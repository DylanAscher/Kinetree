import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import Branch from './Branch';
import BranchSubpage from './BranchSubpage';
import { useAuth } from './AuthContext';

const nodeTypes = { branch: Branch };

export default function SkillTreeCanvas({ treeData, userXP, setUserXP, onBack, onSave, onOpenLogin, onOpenXpStats }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeNodeData, setActiveNodeData] = useState(null); 
  const [rfInstance, setRfInstance] = useState(null);

  // NEW: State for tracking generation to show the footnote
  const [isExpanding, setIsExpanding] = useState(false);

  const { user, logout } = useAuth();

  const handleCenter = useCallback((nodeId) => {
    if (!rfInstance) return;
    const node = rfInstance.getNode(nodeId);
    if (node) {
      rfInstance.setCenter(node.position.x + 130, node.position.y + 75, { zoom: 0.85, duration: 800 });
    }
  }, [rfInstance]);

  const hydrateNodes = useCallback((rawNodes, currentEdges, isNewTree) => {
    const xCoords = Array.from(new Set(rawNodes.map(n => n.position.x))).sort((a, b) => a - b);
    const sourceIds = new Set(currentEdges.map(e => String(e.source)));
    
    return rawNodes.map(node => {
      const colIndex = xCoords.indexOf(node.position.x);
      return {
        ...node,
        dragHandle: '.move-icon',
        data: {
          ...node.data,
          isLeaf: !sourceIds.has(String(node.id)),
          colIndex: colIndex,     
          isNewTree: isNewTree,   
          onExpand: () => expandBranch(node.id, node.data.label, node.position.x, node.position.y),
          onCenter: () => handleCenter(node.id) 
        }
      }
    });
  }, [handleCenter]);

  useEffect(() => {
    if (treeData) {
      const hydratedNodes = hydrateNodes(treeData.nodes || [], treeData.edges || [], treeData.isNew);
      setNodes(hydratedNodes);

      const hydratedEdges = (treeData.edges || []).map(edge => {
        const targetNode = hydratedNodes.find(n => n.id === edge.target);
        const colIndex = targetNode ? targetNode.data.colIndex : 0;
        
        return {
          ...edge,
          style: treeData.isNew ? {
            opacity: 0,
            animation: `fade-edge 0.5s ease-in-out forwards ${colIndex * 0.5}s`
          } : {}
        };
      });
      setEdges(hydratedEdges);

      if (treeData.isNew) {
        onSave({ ...treeData, isNew: false });
      }
    }
  }, [treeData.id, hydrateNodes]); 

  useEffect(() => {
    if (nodes.length > 0) {
      onSave({ ...treeData, nodes, edges });
    }
  }, [nodes, edges]);

  const expandBranch = async (parentId, nodeTopic, startX, startY) => {
    if (isExpanding) return; // Prevent spamming the button while generating
    setIsExpanding(true);

    try {
      const response = await fetch(`http://localhost:8000/expand-tree?topic=${encodeURIComponent(nodeTopic)}&parent_id=${parentId}&start_x=${startX}&start_y=${startY}`);
      if (!response.ok) return;

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
                    if (data.type === 'success') {
                        const rawNodes = data.data.nodes || [];
                        const newNodes = rawNodes.map((node) => ({
                          id: String(node.id), type: 'branch', position: { x: node.x, y: node.y },
                          data: { label: node.label, description: node.description, difficulty: node.difficulty, resource_link: node.resource_link, status: 'locked' }
                        }));

                        const newEdges = [];
                        setNodes(prevNodes => {
                          const nodesToCheck = [...prevNodes];
                          const resolvedNewNodes = newNodes.map((newNode) => {
                              let currentX = newNode.position.x;
                              let currentY = newNode.position.y;
                              let overlapping = true;
                              
                              while (overlapping) {
                                  overlapping = false;
                                  for (let i = 0; i < nodesToCheck.length; i++) {
                                      const existingNode = nodesToCheck[i];
                                      if (existingNode.id === newNode.id) continue;
                                      
                                      const dx = Math.abs(existingNode.position.x - currentX);
                                      const dy = Math.abs(existingNode.position.y - currentY);
                                      
                                      if (dx < 280 && dy < 160) {
                                          currentY += 160; 
                                          overlapping = true; 
                                          break; 
                                      }
                                  }
                              }
                              
                              const resolvedNode = { ...newNode, position: { x: currentX, y: currentY } };
                              nodesToCheck.push(resolvedNode); 
                              return resolvedNode;
                          });

                          const combinedNodes = [...prevNodes, ...resolvedNewNodes];
                          const validNodeIds = new Set(combinedNodes.map(n => n.id));

                          rawNodes.forEach((node) => {
                              if (node.parent_ids) {
                                  node.parent_ids.forEach((pId) => {
                                      if (validNodeIds.has(String(pId)) && String(pId) !== String(node.id)) {
                                          newEdges.push({ 
                                            id: `e${pId}-${node.id}`, source: String(pId), target: String(node.id), type: 'bezier', animated: true,
                                            style: { opacity: 0, animation: 'fade-edge 0.5s ease-in-out forwards' }
                                          });
                                      }
                                  });
                              }
                          });

                          setEdges(prevEdges => {
                             const nextEdges = [...prevEdges, ...newEdges];
                             setTimeout(() => setNodes(hydrateNodes(combinedNodes, nextEdges, false)), 0); 
                             return nextEdges;
                          });
                          return prevNodes; 
                        });
                    }
                } catch (e) {}
            }
        }
      }
    } catch (err) { 
      console.error(err); 
    } finally {
      setIsExpanding(false); // Turn off footnote
    }
  };

  const handleUpdateNodeStatus = (nodeId, newStatus) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const oldStatus = n.data.status;
          const updatedNode = { ...n, data: { ...n.data, status: newStatus } };
          if (newStatus === 'mastered' && oldStatus !== 'mastered') setUserXP(prev => prev + 50);
          else if (oldStatus === 'mastered' && newStatus !== 'mastered') setUserXP(prev => Math.max(0, prev - 50));
          return updatedNode;
        }
        return n;
      })
    );
  };

  const handleLogout = () => {
    logout();
    onBack(); 
  };

  const checkIsUnlockable = (nodeId) => {
    const incomingEdges = edges.filter(e => String(e.target) === String(nodeId));
    if (incomingEdges.length === 0) return true; 
    
    return incomingEdges.every(edge => {
        const parentNode = nodes.find(n => String(n.id) === String(edge.source));
        return parentNode && parentNode.data?.status === 'mastered';
    });
  };

  const liveActiveNode = activeNodeData 
    ? nodes.find(n => n.id === activeNodeData.node.id) 
    : null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden' }}>
      
      <style>{`
        @keyframes fade-edge { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes pulse-text { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>

      <div style={{ padding: '15px 30px', background: '#0a0a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={onBack} 
            style={{ padding: '8px 16px', background: 'transparent', color: '#ededed', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '13px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.target.style.background = '#ededed'; e.target.style.color = '#000'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ededed'; }}
          >
            ← Back to Dashboard
          </button>
          <h2 style={{ margin: 0, color: '#ededed', fontSize: '20px', fontWeight: '500', letterSpacing: '-0.5px' }}>{treeData.topic}</h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
          {/* UPDATED: XP is now an interactive button */}
          <button 
            onClick={onOpenXpStats}
            style={{ fontSize: '14px', fontFamily: 'monospace', color: '#a3a3a3', background: '#111', padding: '8px 16px', borderRadius: '4px', border: '1px solid #333', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.target.style.background = '#222'; e.target.style.color = '#ededed'; }}
            onMouseLeave={(e) => { e.target.style.background = '#111'; e.target.style.color = '#a3a3a3'; }}
          >
            XP: {userXP}
          </button>
          
          {user ? (
            <button 
              onClick={handleLogout} 
              style={{ fontSize: '14px', fontFamily: 'monospace', color: '#ededed', background: 'transparent', padding: '8px 16px', borderRadius: '4px', border: '1px solid #333', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.target.style.background = '#ededed'; e.target.style.color = '#000'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ededed'; }}
            >
              {user.email} (Log out)
            </button>
          ) : (
            <button 
              onClick={onOpenLogin} 
              style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold', color: '#000', background: '#ededed', padding: '8px 24px', borderRadius: '4px', border: '1px solid #ededed', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Log In
            </button>
          )}
        </div>
      </div>

      <div style={{ flexGrow: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(e, node) => setActiveNodeData({ node, clickPos: { x: e.clientX, y: e.clientY } })}
          fitView
          onInit={setRfInstance} 
          minZoom={0.05}         
          maxZoom={3}            
          attributionPosition="bottom-left"
        >
          <Controls style={{ button: { backgroundColor: '#0a0a0a', border: '1px solid #333', fill: '#888' } }} />
        </ReactFlow>

        {liveActiveNode && activeNodeData && (
          <BranchSubpage
            node={liveActiveNode}
            clickPos={activeNodeData.clickPos}
            onClose={() => setActiveNodeData(null)}
            onMarkLearned={() => handleUpdateNodeStatus(liveActiveNode.id, 'mastered')}
            isUnlockable={checkIsUnlockable(liveActiveNode.id)} 
          />
        )}

        {/* NEW: Generating Footnote indicator */}
        {isExpanding && (
          <div style={{
            position: 'absolute', bottom: '30px', right: '30px',
            background: '#111', border: '1px solid #333',
            color: '#ededed', padding: '10px 20px', borderRadius: '4px',
            fontFamily: 'monospace', fontSize: '13px', zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            animation: 'pulse-text 1.5s infinite ease-in-out'
          }}>
            Generating...
          </div>
        )}
      </div>
    </div>
  );
}