import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import SkillTreeCanvas from './components/SkillTreeCanvas';
import GeneratePopup from './components/GeneratePopup';
import MockLogin from './components/MockLogin';
import XpModal from './components/XpModal'; // NEW
import { useAuth } from './components/AuthContext';

export default function App() {
  const { user } = useAuth(); 
  
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [activeTree, setActiveTree] = useState(null);
  const [savedTrees, setSavedTrees] = useState([]);
  const [userXP, setUserXP] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showXpModal, setShowXpModal] = useState(false); // NEW

  const [loading, setLoading] = useState(false);
  const [generationAttempt, setGenerationAttempt] = useState(1);
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

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    refreshSavedTrees();
  }, [user]);

  useEffect(() => {
    const xp = localStorage.getItem('kinetree-user-xp');
    if (xp) setUserXP(parseInt(xp, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem('kinetree-user-xp', userXP.toString());
  }, [userXP]);

  const refreshSavedTrees = () => {
    const trees = [];
    const currentUserId = user ? user.id : 'guest';

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('kinetree-tree-')) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key));
          if (parsed.userId === currentUserId) {
            trees.push(parsed);
          }
        } catch (e) {}
      }
    }
    
    trees.sort((a, b) => {
        const dateA = new Date(a.dateCreated).getTime();
        const dateB = new Date(b.dateCreated).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
    setSavedTrees(trees);
  };

  const handleGenerateTree = async (topic) => {
    if (!topic) return;
    setLoading(true);
    setError('');
    setGenerationAttempt(1);
    setCurrentModel('');
    setProgressMessage('Establishing server connection...');
    setGeneratingTopic(topic);
    
    try {
      const response = await fetch(`http://localhost:8000/generate-tree?topic=${encodeURIComponent(topic)}`);
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
                        setGenerationAttempt(data.attempt);
                        setCurrentModel(data.model);
                        setProgressMessage(data.message);
                    } else if (data.type === 'success') {
                        const rawNodes = data.data.nodes || [];
                        const formattedNodes = rawNodes.map((node) => ({
                          id: String(node.id), 
                          type: 'branch', 
                          position: { x: node.x, y: node.y },
                          data: {
                            label: node.label, description: node.description,
                            difficulty: node.difficulty, resource_link: node.resource_link,
                            status: 'locked', isLeaf: true 
                          }
                        }));

                        const formattedEdges = [];
                        rawNodes.forEach((node) => {
                            if (node.parent_ids) {
                                node.parent_ids.forEach((pId) => {
                                    formattedEdges.push({
                                        id: `e${pId}-${node.id}`, source: String(pId), target: String(node.id), type: 'bezier', animated: true      
                                    });
                                });
                            }
                        });
                        
                        const newTree = {
                          id: `kinetree-tree-${Date.now()}`, 
                          userId: user ? user.id : 'guest', 
                          topic: topic,
                          dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          nodes: formattedNodes,
                          edges: formattedEdges,
                          isNew: true 
                        };

                        localStorage.setItem(newTree.id, JSON.stringify(newTree));
                        refreshSavedTrees();
                        setActiveTree(newTree);
                        setCurrentView('tree');
                        setLoading(false);
                    }
                } catch (e) {}
            }
        }
      }
    } catch (err) {
      setError("Failed to reach local API.");
      setLoading(false);
    }
  };

  const handleUpdateActiveTree = (updatedTree) => {
    setActiveTree(updatedTree);
    localStorage.setItem(updatedTree.id, JSON.stringify(updatedTree));
    refreshSavedTrees(); 
  };

  const handleDeleteTree = (treeId) => {
    localStorage.removeItem(treeId);
    refreshSavedTrees();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -3,
        backgroundColor: '#050505',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`
      }} />

      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -2,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }} />

      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -1,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        maskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
        WebkitMaskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`
      }} />

      {currentView === 'dashboard' && (
        <Dashboard 
          savedTrees={savedTrees} 
          userXP={userXP} 
          onOpenTree={(tree) => { setActiveTree(tree); setCurrentView('tree'); }} 
          onGenerate={handleGenerateTree} 
          onDeleteTree={handleDeleteTree} 
          onOpenLogin={() => setShowLogin(true)} 
          onOpenXpStats={() => setShowXpModal(true)} // NEW
        />
      )}
      
      {currentView === 'tree' && activeTree && (
        <SkillTreeCanvas 
          treeData={activeTree} 
          userXP={userXP}
          setUserXP={setUserXP}
          onBack={() => { setActiveTree(null); setCurrentView('dashboard'); }}
          onSave={handleUpdateActiveTree}
          onOpenLogin={() => setShowLogin(true)}
          onOpenXpStats={() => setShowXpModal(true)} // NEW
        />
      )}

      {loading && (
        <GeneratePopup 
            topic={generatingTopic}
            attempt={generationAttempt}
            model={currentModel}
            progressMessage={progressMessage}
        />
      )}

      {showLogin && <MockLogin onClose={() => setShowLogin(false)} />}

      {/* NEW: XP Modal */}
      {showXpModal && (
        <XpModal 
          savedTrees={savedTrees}
          userXP={userXP}
          onClose={() => setShowXpModal(false)}
        />
      )}
    </div>
  );
}