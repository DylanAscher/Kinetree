import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { Controls, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import Branch from './Branch';
import BranchSubpage from './BranchSubpage';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const nodeTypes = { branch: Branch };
const nodeWidth = 220; 
const nodeHeight = 120; 

const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(String(node.id), { width: 250, height: 130 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(String(edge.source), String(edge.target));
  });

  dagre.layout(dagreGraph);

  const columns = {};
  nodes.forEach((node) => {
    const pos = dagreGraph.node(String(node.id));
    const colX = Math.round(pos.x);
    if (!columns[colX]) columns[colX] = [];
    columns[colX].push({ node, dagreY: pos.y });
  });

  Object.keys(columns).forEach(colX => {
    columns[colX].sort((a, b) => a.dagreY - b.dagreY);
  });

  const verticalGap = 15; 
  const actualHeight = 120; 

  return nodes.map((node) => {
    const pos = dagreGraph.node(String(node.id));
    const colX = Math.round(pos.x);
    
    const colData = columns[colX];
    const nodeIndex = colData.findIndex(item => item.node.id === node.id);
    const totalNodesInCol = colData.length;

    const totalColHeight = (totalNodesInCol * actualHeight) + ((totalNodesInCol - 1) * verticalGap);
    const startY = -(totalColHeight / 2);
    const customY = startY + (nodeIndex * (actualHeight + verticalGap));

    return {
      ...node,
      position: { x: pos.x, y: customY },
      targetPosition: 'left',
      sourcePosition: 'right',
    };
  });
};

export default function SkillTreeCanvas({ treeData, userXP, onBack, onSave, onOpenLogin, onOpenLeaderboard, onOpenPricing, onOpenUserInfo }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [activeNodeData, setActiveNodeData] = useState(null); 
  const [rfInstance, setRfInstance] = useState(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [initialFitDone, setInitialFitDone] = useState(false);
  const [isPaneDraggable, setIsPaneDraggable] = useState(true);
  
  const [currentColIndex, setCurrentColIndex] = useState(-1);
  const [isZoomed, setIsZoomed] = useState(false);

  const { user, profile, logout, addXP } = useAuth();
  const isLoggedIn = user && user.id !== 'guest';

  const getNameColor = (tier) => {
    if (tier === 'Pro') return '#ffd700';
    if (tier === 'Unlimited') return '#4caf50';
    return '#ededed';
  };

  // Reset initial fit when a new tree is loaded
  useEffect(() => { setInitialFitDone(false); }, [treeData?.id]);

  const handleCenter = useCallback((nodeId) => {
    if (!rfInstance) return;
    const node = rfInstance.getNode(nodeId);
    if (node) rfInstance.setCenter(node.position.x + 130, node.position.y + 75, { zoom: 1.15, duration: 800 });
  }, [rfInstance]);

  const checkIsUnlockable = useCallback((nodeId, currentNodes, currentEdges) => {
    const incomingEdges = currentEdges.filter(e => String(e.target) === String(nodeId));
    if (incomingEdges.length === 0) return true; 
    return incomingEdges.every(edge => {
        const parentNode = currentNodes.find(n => String(n.id) === String(edge.source));
        return parentNode && parentNode.data?.status === 'mastered';
    });
  }, []);

  const hydrateNodes = useCallback((rawNodes, currentEdges, isNewTree) => {
    const xCoords = Array.from(new Set(rawNodes.map(n => n.position.x))).sort((a, b) => a - b);
    const sourceIds = new Set(currentEdges.map(e => String(e.source)));
    return rawNodes.map(node => {
      const colIndex = xCoords.indexOf(node.position.x);
      return {
        ...node, dragHandle: '.move-icon',
        data: {
          ...node.data, isLeaf: !sourceIds.has(String(node.id)), colIndex: colIndex, isNewTree: isNewTree,
          isUnlockable: checkIsUnlockable(node.id, rawNodes, currentEdges),
          onExpand: () => expandBranch(node.id, node.data.label, node.position.x, node.position.y),
          onCenter: () => handleCenter(node.id) 
        }
      }
    });
  }, [handleCenter, checkIsUnlockable]);

  // REUSABLE ZOOM FUNCTION
  const zoomToColumn = useCallback((targetIndex) => {
    if (!rfInstance || nodes.length === 0) return;

    const columnsMap = {};
    nodes.forEach((node) => {
      const colX = Math.round(node.position.x);
      if (!columnsMap[colX]) columnsMap[colX] = [];
      columnsMap[colX].push(node);
    });

    const sortedColXs = Object.keys(columnsMap).map(Number).sort((a, b) => a - b);
    if (targetIndex < 0 || targetIndex >= sortedColXs.length) return;

    const targetX = sortedColXs[targetIndex];
    const targetNodes = columnsMap[targetX];
    const yValues = targetNodes.map((n) => n.position.y);
    
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues) + nodeHeight;
    const centerY = minY + ((maxY - minY) / 2);
    
    rfInstance.setCenter(targetX + (nodeWidth / 2), centerY, { zoom: 1.15, duration: 800 });
    setCurrentColIndex(targetIndex);
    setIsZoomed(true);
  }, [rfInstance, nodes]);

  // CRITICAL FIX 2: UNIFIED "SMART SPAWN" LOGIC (Furthest Left Unlearned)
  useEffect(() => {
    if (rfInstance && nodes.length > 0 && !initialFitDone) {
      setTimeout(() => {
        const columnsMap = {};
        nodes.forEach((node) => {
          const colX = Math.round(node.position.x);
          if (!columnsMap[colX]) columnsMap[colX] = [];
          columnsMap[colX].push(node);
        });

        const sortedColXs = Object.keys(columnsMap).map(Number).sort((a, b) => a - b);
        
        let targetColIndex = 0; // Default to first column
        
        // Scan left to right to find the first column with an unmastered skill
        for (let i = 0; i < sortedColXs.length; i++) {
          const colNodes = columnsMap[sortedColXs[i]];
          const hasUnmastered = colNodes.some(n => n.data.status !== 'mastered');
          
          if (hasUnmastered) {
            targetColIndex = i;
            break;
          }
        }

        zoomToColumn(targetColIndex);
        setInitialFitDone(true);
      }, 100); // Tiny timeout allows Dagre to finish rendering coordinates
    }
  }, [rfInstance, nodes, initialFitDone, zoomToColumn]);


  useEffect(() => {
    if (treeData && treeData.nodes) {
        const initialEdges = [];
        
        treeData.nodes.forEach(node => {
            let parents = [];
            if (node.parent_ids) parents = node.parent_ids;
            else if (node.data?.parent_ids) parents = node.data.parent_ids;
            else if (node.parent_id) parents = [node.parent_id];
            else if (node.data?.parent_id) parents = [node.data.parent_id];
            
            if (Array.isArray(parents)) {
                parents.forEach(parentId => {
                    if (parentId && String(parentId) !== "null" && String(parentId) !== String(node.id)) {
                        initialEdges.push({
                            id: `e-${parentId}-${node.id}`,
                            source: String(parentId),
                            target: String(node.id),
                            type: 'default',
                            animated: true,
                            style: { stroke: '#555', strokeWidth: 2 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#555' }
                        });
                    }
                });
            }
        });

        const rawNodes = treeData.nodes.map(n => ({
            id: String(n.id),
            type: 'branch',
            data: n.data ? { ...n.data } : { ...n },
            position: n.position || { x: 0, y: 0 }
        }));

        const layouted = getLayoutedElements(rawNodes, initialEdges);
        const hydratedNodes = hydrateNodes(layouted, initialEdges, treeData.isNew);
        
        const hydratedEdges = initialEdges.map(edge => {
          const targetNode = hydratedNodes.find(n => n.id === edge.target);
          const colIndex = targetNode ? targetNode.data.colIndex : 0;
          return {
            ...edge, 
            style: treeData.isNew ? { ...edge.style, opacity: 0, animation: `fade-edge 0.5s ease-in-out forwards ${colIndex * 0.5}s` } : edge.style
          };
        });
        
        setNodes(hydratedNodes);
        setEdges(hydratedEdges);
        
        if (treeData.isNew && typeof onSave === 'function') {
            onSave({ ...treeData, isNew: false, nodes: hydratedNodes, edges: hydratedEdges });
        }
    }
  }, [treeData?.id, hydrateNodes]);

  const treeDataRef = useRef(treeData);
  useEffect(() => { treeDataRef.current = treeData; }, [treeData]);

  useEffect(() => { 
    if (nodes.length > 0 && typeof onSave === 'function') {
      onSave({ ...treeDataRef.current, nodes, edges }); 
    }
  }, [nodes, edges]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const isSelected = n.data.colIndex === currentColIndex;
        const isNoSelection = currentColIndex === -1;
        
        if (isZoomed) {
          return {
            ...n,
            style: {
              ...n.style,
              opacity: isSelected ? 1 : 0.5, 
              boxShadow: isSelected ? '0px 0px 35px 8px rgba(255, 255, 255, 0.07)' : 'none',
              transition: 'all 0.5s ease'
            }
          };
        } else {
          return {
            ...n,
            style: {
              ...n.style,
              opacity: (isSelected || isNoSelection) ? 1 : 0.75, 
              boxShadow: isSelected ? '0px 0px 15px 4px rgba(255, 255, 255, 0.08)' : 'none',
              transition: 'all 0.5s ease'
            }
          };
        }
      })
    );
  }, [currentColIndex, isZoomed, setNodes]);


  const expandBranch = async (parentId, nodeTopic, startX, startY) => {
    const userTier = profile?.tier?.toLowerCase() || 'free';
    if (userTier === 'free') {
       if (onOpenPricing) onOpenPricing();
       return;
    }

    if (isExpanding) return; 
    setIsExpanding(true);
    try {
      const response = await fetch(`${API_BASE_URL}/expand-tree?topic=${encodeURIComponent(nodeTopic)}&parent_id=${parentId}&start_x=${startX}&start_y=${startY}`);
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
                          const yOffsets = [0, 110, -110, 220, -220];
                          const resolvedNewNodes = newNodes.map((newNode) => {
                              let currentX = newNode.position.x;
                              let placed = false;
                              for (let offset of yOffsets) {
                                  let testY = offset;
                                  let overlapping = false;
                                  for (let existingNode of nodesToCheck) {
                                      if (existingNode.id === newNode.id) continue;
                                      const dx = Math.abs(existingNode.position.x - currentX);
                                      const dy = Math.abs(existingNode.position.y - testY);
                                      if (dx < 200 && dy < 100) { overlapping = true; break; }
                                  }
                                  if (!overlapping) { newNode.position.y = testY; placed = true; break; }
                              }
                              if (!placed) newNode.position.y = 0;
                              const resolvedNode = { ...newNode };
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
                                            id: `e-${parentId}-${node.id}`,
                                            source: String(parentId),
                                            target: String(node.id),
                                            type: 'default',
                                            style: { stroke: '#555', strokeWidth: 2 }, 
                                            markerEnd: { 
                                              type: MarkerType.ArrowClosed, 
                                              color: '#555' 
                                            }
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
                } catch (e) { console.error('Invalid expansion response:', e); }
            }
        }
      }
    } catch (err) {
      console.error('Failed to expand tree:', err);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleUpdateNodeStatus = (nodeId, newStatus) => {
    if (newStatus === 'mastered') { if (addXP) addXP(50); }
    setNodes((nds) => {
      const updatedNodes = nds.map((n) => {
        if (n.id === nodeId) return { ...n, data: { ...n.data, status: newStatus } };
        return n;
      });
      return updatedNodes.map(n => ({ ...n, data: { ...n.data, isUnlockable: checkIsUnlockable(n.id, updatedNodes, edges) } }));
    });
  };

  const handleToggleZoomState = () => {
    if (!rfInstance) return;

    if (isZoomed) {
      rfInstance.fitView({ padding: 0.2, duration: 800 });
      setIsZoomed(false);
    } else {
      if (currentColIndex === -1) {
        zoomToColumn(0);
      } else {
        zoomToColumn(currentColIndex);
      }
    }
  };

  const handleColumnNav = (direction) => {
    if (nodes.length === 0) return;
    const xCoords = Array.from(new Set(nodes.map(n => Math.round(n.position.x)))).sort((a, b) => a - b);

    let nextIndex = currentColIndex;
    if (currentColIndex === -1) {
        nextIndex = direction === 'left' ? 0 : 1;
    } else {
        nextIndex += (direction === 'right' ? 1 : -1);
    }
    
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= xCoords.length) nextIndex = xCoords.length - 1;
    
    zoomToColumn(nextIndex);
  };

  const handleLogout = () => { logout(); onBack(); };

  const liveActiveNode = activeNodeData ? nodes.find(n => n.id === activeNodeData.node.id) : null;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'pageFadeIn 0.4s ease-out forwards' }}>
      <style>{`
        @keyframes pageFadeIn {
          from { opacity: 0; filter: blur(8px); }
          to { opacity: 1; filter: blur(0); }
        }
      `}</style>
      
      <div style={{ 
        background: '#000', borderBottom: '1px solid #222', padding: '30px 50px', 
        width: '100%', boxSizing: 'border-box', zIndex: 100, flexShrink: 0 
      }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '900', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>KINETREE</h1>
            <p style={{ color: '#888', fontSize: '16px', margin: '5px 0 0 0' }}>Adaptive Learning Infrastructure</p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', padding: '6px 14px', borderRadius: '50px', border: '1px solid #333' }}>
                   <span style={{ color: '#888', fontWeight: 'bold', fontSize: '12px' }}>XP</span>
                   <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ededed' }}>{userXP}</span>
                </div>
                <button onClick={onOpenLeaderboard} style={{ background: '#ededed', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Rankings</button>
                <button onClick={onOpenPricing} style={{ background: 'linear-gradient(45deg, #4caf50, #2e7d32)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Upgrade</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button 
                    onClick={() => onOpenUserInfo()} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: getNameColor(profile?.tier),
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer', 
                      textDecoration: 'underline', 
                      padding: 0 
                    }}
                  >
                    {profile?.username || user.email?.split('@')[0]}
                  </button>
                  <button onClick={handleLogout} style={{ background: '#000', border: '1px solid #ff4444', color: '#ff4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Log Out</button>
                </div>
              </>
            ) : (
              <button onClick={() => onOpenLogin()} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Log In</button>
            )}
          </div>
        </header>
      </div>

      <div style={{ flex: 1, position: 'relative', width: '100%' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: '25px', left: '30px', zIndex: 100, background: 'rgba(17, 17, 17, 0.85)', border: '1px solid #333', color: '#fff', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backdropFilter: 'blur(5px)' }}>← Dashboard</button>
        
        <button 
          onClick={handleToggleZoomState} 
          style={{ 
            position: 'absolute', top: '25px', right: '30px', zIndex: 100, 
            background: 'rgba(17, 17, 17, 0.85)', border: '1px solid #333', 
            color: '#fff', padding: '10px 20px', borderRadius: '6px', 
            cursor: 'pointer', fontWeight: 'bold', backdropFilter: 'blur(5px)' 
          }}
        >
          {isZoomed ? '⛶ Return to Tree' : '⛶ Return to Branch'}
        </button>

        <button onClick={() => handleColumnNav('left')} style={{ position: 'absolute', top: '50%', left: '30px', transform: 'translateY(-50%)', zIndex: 100, background: 'rgba(17,17,17,0.8)', border: '1px solid #444', color: '#fff', fontSize: '24px', padding: '25px 15px', cursor: 'pointer', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>◀</button>
        <button onClick={() => handleColumnNav('right')} style={{ position: 'absolute', top: '50%', right: '30px', transform: 'translateY(-50%)', zIndex: 100, background: 'rgba(17,17,17,0.8)', border: '1px solid #444', color: '#fff', fontSize: '24px', padding: '25px 15px', cursor: 'pointer', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>▶</button>

        <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            nodeTypes={nodeTypes} 
            fitView 
            onNodeClick={(e, node) => {
                if (isZoomed && node.data.colIndex === currentColIndex) {
                    setActiveNodeData({ node, clickPos: { x: e.clientX, y: e.clientY } });
                } else {
                    setActiveNodeData(null); 
                    zoomToColumn(node.data.colIndex);
                }
            }} 
            onNodeMouseEnter={() => setIsPaneDraggable(false)}
            onNodeMouseLeave={() => setIsPaneDraggable(true)}
            onInit={setRfInstance} 
            panOnDrag={isPaneDraggable} 
            panOnScroll={true} 
            panOnScrollMode="horizontal" 
            zoomOnScroll={false} 
            nodesDraggable={false} 
            minZoom={0.05} 
            maxZoom={3} 
            attributionPosition="bottom-left"
        >
          <Controls style={{ button: { backgroundColor: '#0a0a0a', border: '1px solid #333', fill: '#888' }, zIndex: 5 }} />
        </ReactFlow>

        {liveActiveNode && activeNodeData && (
          <BranchSubpage 
            node={liveActiveNode} 
            clickPos={activeNodeData.clickPos} 
            onClose={() => setActiveNodeData(null)} 
            onMarkLearned={() => handleUpdateNodeStatus(liveActiveNode.id, 'mastered')} 
            isUnlockable={checkIsUnlockable(liveActiveNode.id, nodes, edges)}
            allNodes={nodes}
            treeTopic={treeData?.topic} // <--- PASS THE TREE NAME HERE
          />
        )}

        {isExpanding && (
          <div style={{ position: 'absolute', bottom: '30px', right: '30px', background: '#111', border: '1px solid #333', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', zIndex: 10, fontWeight: 'bold' }}>
            <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite' }}>// EXPANDING BRANCH...</span>
          </div>
        )}
      </div>
    </div>
  );
}