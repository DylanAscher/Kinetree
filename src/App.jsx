import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SkillTreeCanvas from './components/SkillTreeCanvas';
import GeneratePopup from './components/GeneratePopup';
import AuthModal from './context/AuthModal'; 
import Leaderboard from './components/Leaderboard'; 
import DialogModal from './components/DialogModal'; 
import LandingPage from './components/LandingPage';
import Pricing from './components/Pricing'; 
import UserInfo from './components/UserInfo'; // NEW IMPORT
import { useAuth, supabase } from './context/AuthContext'; 

export default function App() {
  const { user, profile, addXP } = useAuth(); 
  const userXP = profile?.xp || 0;

  const isLoggedIn = user && user.id !== 'guest';
  
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [activeTree, setActiveTree] = useState(null);
  const [savedTrees, setSavedTrees] = useState([]);
  
  const [showLogin, setShowLogin] = useState(false);
  const [authMessage, setAuthMessage] = useState(''); 
  const [showLeaderboard, setShowLeaderboard] = useState(false); 
  const [showPricing, setShowPricing] = useState(false); 
  
  const [dialogConfig, setDialogConfig] = useState({ isOpen: false });

  const [loading, setLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState("");
  const [progressMessage, setProgressMessage] = useState("");
  const [error, setError] = useState("");
  const [generatingTopic, setGeneratingTopic] = useState("");

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 }); 

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#050505';
    document.body.style.color = '#ededed';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    document.body.style.overflow = 'auto'; 
    document.documentElement.style.overflow = 'auto';

    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    refreshSavedTrees();
  }, [user]);

  const refreshSavedTrees = async () => {
    if (!user || user.id === 'guest') {
      setSavedTrees([]);
      return;
    }
    const { data, error } = await supabase.from('trees').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (!error && data) {
      const formattedTrees = data.map(dbTree => {
        const nodes = typeof dbTree.nodes === 'string' ? JSON.parse(dbTree.nodes) : dbTree.nodes;
        const edges = typeof dbTree.edges === 'string' ? JSON.parse(dbTree.edges) : dbTree.edges;
        return {
          ...dbTree, nodes, edges,
          dateCreated: new Date(dbTree.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
      });
      setSavedTrees(formattedTrees);
    }
  };

  const handleGenerateTree = (topic) => {
  setGeneratingTopic(topic);
  setLoading(true);
  setProgressMessage("Initializing Cognitive Parsing...");
  const eventSource = new EventSource(`http://localhost:8000/generate-tree?topic=${encodeURIComponent(topic)}`);
  eventSource.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);

      if (parsedData.type === 'progress') {
        setProgressMessage(parsedData.message);
        setCurrentModel(parsedData.model || currentModel);
      }
      else if (parsedData.type === 'success') {
            
            // 1. Pre-calculate the edges so Supabase has them
            const generatedNodes = parsedData.data.nodes;
            const generatedEdges = [];
            
            generatedNodes.forEach(node => {
              if (node.parent_ids && Array.isArray(node.parent_ids)) {
                node.parent_ids.forEach(parentId => {
                  generatedEdges.push({
                    id: `e-${parentId}-${node.id}`,
                    source: String(parentId),
                    target: String(node.id),
                    animated: true,
                    style: { stroke: '#333' }
                  });
                });
              }
            });

            // 2. Build the full tree object
            const newTree = {
              id: crypto.randomUUID(),
              topic: topic,
              date: new Date().toLocaleDateString(),
              nodes: generatedNodes,
              edges: generatedEdges, // <-- We now have edges!
            };

            const updatedTrees = [newTree, ...savedTrees];
            setSavedTrees(updatedTrees);
            localStorage.setItem('kinetree_saved', JSON.stringify(updatedTrees));

            if (isLoggedIn) {
              // 3. Send EVERYTHING to Supabase to satisfy the strict schema
              supabase.from('trees').insert([{ 
                id: newTree.id, 
                user_id: user.id, 
                topic: newTree.topic, 
                data: newTree,
                nodes: newTree.nodes,
                edges: newTree.edges // <-- Sent to Database!
              }])
              .then(({error}) => { if(error) console.error("Supabase Save Error:", error); });
            }

            setActiveTree(newTree); 
            setCurrentView('tree'); 
            setLoading(false); 
            eventSource.close(); 
      } else if (parsedData.type === 'error') {
        console.error("Backend Error:", parsedData.message);
        alert(`Generation failed: ${parsedData.message}`);
        setLoading(false);
        eventSource.close();
      }
    } catch (err) {
      // THIS PREVENTS FUTURE BRICKING!
      console.error("Failed to process server response:", err);
      alert("The AI returned an invalid response. Please try again.");
      setLoading(false); 
      eventSource.close();
    }
  };

  eventSource.onerror = () => {
    // --- THE FIX: Catch network/connection errors ---
    console.error("EventSource failed.");
    alert("Lost connection to the server.");
    setGeneratingTopic  (false); // Force close the popup!
    eventSource.close();    // Kill connection
  };
};

  const performClone = async (existingTree) => {
    setLoading(true);
    setProgressMessage('Cloning existing tree...');
    setGeneratingTopic(existingTree.topic);
    
    const nodes = typeof existingTree.nodes === 'string' ? JSON.parse(existingTree.nodes) : existingTree.nodes;
    const edges = typeof existingTree.edges === 'string' ? JSON.parse(existingTree.edges) : existingTree.edges;
    
    const freshNodes = nodes.map(n => ({ ...n, data: { ...n.data, status: 'locked' } }));
    
    const newTreeData = { user_id: user.id, topic: existingTree.topic, nodes: freshNodes, edges: edges };
    const { data: insertedTree, error } = await supabase.from('trees').insert([newTreeData]).select().single();

    if (!error && insertedTree) {
        const formattedTreeToOpen = {
            ...insertedTree, nodes: freshNodes, edges: edges,
            dateCreated: new Date(insertedTree.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            isNew: true 
        };
        setSavedTrees(prev => [formattedTreeToOpen, ...prev]);
        setActiveTree(formattedTreeToOpen);
        setCurrentView('tree');
    }
    setLoading(false);
  };

  const performGenerate = async (topic, skillLevel) => {
    setLoading(true);
    setError('');
    setCurrentModel('');
    setProgressMessage('Establishing server connection...');
    setGeneratingTopic(topic);
    
    try {
      const enhancedTopic = `${topic} (Target Audience: ${skillLevel})`;
      const response = await fetch(`http://localhost:8000/generate-tree?topic=${encodeURIComponent(enhancedTopic)}`);
      
      if (!response.ok) throw new Error("Network response error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop(); 

        for (const chunk of chunks) {
            if (chunk.trim().startsWith('data: ')) {
                try {
                    const data = JSON.parse(chunk.substring(6));
                    if (data.type === 'progress') {
                        setCurrentModel(data.model);
                        setProgressMessage(data.message);
                    } else if (data.type === 'success') {
                        const rawNodes = data.data.nodes || [];
                        const nodesToCheck = [];
                        const yOffsets = [0, 110, -110, 220, -220];
                        
                        const formattedNodes = rawNodes.map((node) => {
                          let currentX = node.x;
                          let currentY = 0;
                          for (let offset of yOffsets) {
                              let overlapping = false;
                              for (let existingNode of nodesToCheck) {
                                  let dx = Math.abs(existingNode.position.x - currentX);
                                  let dy = Math.abs(existingNode.position.y - offset);
                                  if (dx < 200 && dy < 100) { overlapping = true; break; }
                              }
                              if (!overlapping) { currentY = offset; break; }
                          }
                          const resolvedNode = {
                            id: String(node.id), type: 'branch', position: { x: currentX, y: currentY },
                            data: { label: node.label, description: node.description, difficulty: node.difficulty, resource_link: node.resource_link, status: 'locked', isLeaf: true }
                          };
                          nodesToCheck.push(resolvedNode);
                          return resolvedNode;
                        });

                        const formattedEdges = [];
                        rawNodes.forEach((node) => {
                            if (node.parent_ids) {
                                node.parent_ids.forEach((pId) => {
                                    formattedEdges.push({
                                        id: `e${pId}-${node.id}`, source: String(pId), target: String(node.id), type: 'default', animated: true,
                                        style: { stroke: '#ffffff', strokeWidth: 2 } 
                                    });
                                });
                            }
                        });
                        
                        const newTreeData = { user_id: user.id, topic: topic, nodes: formattedNodes, edges: formattedEdges };
                        const { data: insertedTree } = await supabase.from('trees').insert([newTreeData]).select().single();
                        const treeToOpen = insertedTree || { id: `temp-${Date.now()}`, ...newTreeData, created_at: new Date().toISOString() };

                        const formattedTreeToOpen = {
                          ...treeToOpen, nodes: formattedNodes, edges: formattedEdges,
                          dateCreated: new Date(treeToOpen.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        };

                        setSavedTrees(prev => [formattedTreeToOpen, ...prev]);
                        setActiveTree(formattedTreeToOpen);
                        setCurrentView('tree'); 
                        setLoading(false);
                    }
                } catch (e) { }
            }
        }
      }
    } catch (err) {
      setError("Failed to reach local API.");
      setLoading(false);
    }
  };

  const handleUpdateActiveTree = async (updatedTree) => {
    setActiveTree(updatedTree);
    setSavedTrees(prev => prev.map(t => t.id === updatedTree.id ? updatedTree : t));

    if (user && user.id !== 'guest') {
      await supabase.from('trees').update({ nodes: updatedTree.nodes, edges: updatedTree.edges }).eq('id', updatedTree.id);
    }
  };

  const handleDeleteTree = async (treeId) => {
    setSavedTrees(prev => prev.filter(t => t.id !== treeId));
    if (user && user.id !== 'guest') {
      await supabase.from('trees').delete().eq('id', treeId);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -3, backgroundColor: '#050505', backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")` }} />
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -2, backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -1, backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)', backgroundSize: '24px 24px', maskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`, WebkitMaskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)` }} />

      {/* NEW ROUTING LOGIC */}
      {currentView === 'userInfo' ? (
        <UserInfo onBack={() => setCurrentView('dashboard')} onOpenPricing={() => setShowPricing(true)} />
      ) : currentView === 'landing' ? (
        <LandingPage 
          onOpenLogin={(msg) => { setAuthMessage(typeof msg === 'string' ? msg : ""); setShowLogin(true); }} 
          onOpenPricing={() => setShowPricing(true)} 
          onGoToDashboard={() => setCurrentView('dashboard')}
          isLoggedIn={user && user.id !== 'guest'}
        />
      ) : currentView === 'dashboard' ? (
        user && user.id !== 'guest' ? (
          <Dashboard 
            savedTrees={savedTrees} userXP={userXP} 
            onOpenTree={(tree) => { setActiveTree(tree); setCurrentView('tree'); }} 
            onGenerate={handleGenerateTree} onDeleteTree={handleDeleteTree} 
            onOpenLogin={(msg) => { setAuthMessage(typeof msg === 'string' ? msg : ""); setShowLogin(true); }} 
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenPricing={() => setShowPricing(true)} 
            onOpenUserInfo={() => setCurrentView('userInfo')}
            onOpenLanding={() => setCurrentView('landing')} 
          />
        ) : (
          <LandingPage 
            onOpenLogin={(msg) => { setAuthMessage(typeof msg === 'string' ? msg : ""); setShowLogin(true); }} 
            onOpenPricing={() => setShowPricing(true)} 
            onGoToDashboard={() => setCurrentView('dashboard')}
            isLoggedIn={false}
          />
        )
      ) : null}
      
      {currentView === 'tree' && activeTree && (
        <SkillTreeCanvas 
          treeData={activeTree} userXP={userXP}
          onBack={() => { setActiveTree(null); setCurrentView('dashboard'); }}
          onSave={handleUpdateActiveTree}
          onOpenLogin={(msg) => { setAuthMessage(typeof msg === 'string' ? msg : ""); setShowLogin(true); }}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenPricing={() => setShowPricing(true)}
          onOpenUserInfo={() => setCurrentView('userInfo')}
        />
      )}

      {loading && <GeneratePopup topic={generatingTopic} model={currentModel} progressMessage={progressMessage} />}
      {showLogin && <AuthModal message={authMessage} onClose={() => setShowLogin(false)} />}
      {showLeaderboard && <Leaderboard userXP={userXP} onClose={() => setShowLeaderboard(false)} />}
      {showPricing && <Pricing onClose={() => setShowPricing(false)} onOpenLogin={(msg) => { setAuthMessage(msg); setShowLogin(true); }} />}
      
      <DialogModal {...dialogConfig} />
    </div>
  );
}