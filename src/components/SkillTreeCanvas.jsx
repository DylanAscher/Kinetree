import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { Controls, useNodesState, useEdgesState } from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import Branch from './Branch';
import BranchSubpage from './BranchSubpage';
import { useAuth } from '../context/AuthContext';

// 1. DEFINED OUTSIDE THE COMPONENT TO FIX THE WARNING
const nodeTypes = { branch: Branch };
const nodeWidth = 220;
const nodeHeight = 120;

// 2. BULLETPROOF LAYOUT FUNCTION
const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 350 });

  nodes.forEach((node) => {
    dagreGraph.setNode(String(node.id), { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(String(edge.source), String(edge.target));
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const pos = dagreGraph.node(String(node.id));
    
    // BULLETPROOF FALLBACK: The '?.' means if pos doesn't exist, it safely defaults to 0
    const x = pos?.x ?? 0;
    const y = pos?.y ?? 0;

    return {
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',
      position: {
        x: x - nodeWidth / 2,
        y: y - nodeHeight / 2,
      },
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

  const { user, profile, logout, addXP } = useAuth();
  const isLoggedIn = user && user.id !== 'guest';

  const getNameColor = (tier) => {
    if (tier === 'Pro') return '#ffd700';
    if (tier === 'Unlimited') return '#4caf50';
    return '#ededed';
  };

  useEffect(() => { setInitialFitDone(false); }, [treeData?.id]);

  useEffect(() => {
    if (rfInstance && nodes.length > 0 && !initialFitDone) {
      if (nodes[0].width && nodes[0].height) {
        let minY = Infinity, maxY = -Infinity;
        nodes.forEach(n => {
          const h = n.height || 150; 
          if (n.position.y < minY) minY = n.position.y;
          if (n.position.y + h > maxY) maxY = n.position.y + h;
        });

        const graphHeight = maxY - minY;
        const viewportHeight = document.querySelector('.react-flow')?.clientHeight || window.innerHeight;
        const viewportWidth = document.querySelector('.react-flow')?.clientWidth || window.innerWidth;

        let targetZoom = viewportHeight / (graphHeight + 120);
        targetZoom = Math.min(Math.max(targetZoom, 0.1), 2); 

        const rootNode = nodes.reduce((prev, curr) => (prev.position.x < curr.position.x ? prev : curr), nodes[0]);
        
        // Offset center to shift branches down away from the header area
        const centerY = minY + (graphHeight / 2) - 50; 
        const targetCenterX = rootNode.position.x + ((viewportWidth / 2) - 100) / targetZoom;

        rfInstance.setCenter(targetCenterX, centerY, { zoom: targetZoom, duration: 800 });
        setInitialFitDone(true);
      }
    }
  }, [nodes, rfInstance, initialFitDone]);

  const handleCenter = useCallback((nodeId) => {
    if (!rfInstance) return;
    const node = rfInstance.getNode(nodeId);
    if (node) rfInstance.setCenter(node.position.x + 130, node.position.y + 75, { zoom: 0.85, duration: 800 });
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

  // CRITICAL FIX 1: Hydrate nodes/edges securely without triggering an infinite React loop
  useEffect(() => {
    if (treeData && treeData.nodes) {
        const initialEdges = [];
        treeData.nodes.forEach(node => {
            if (node.parent_ids) {
                node.parent_ids.forEach(parentId => {
                    initialEdges.push({
                        id: `e-${parentId}-${node.id}`,
                        source: String(parentId),
                        target: String(node.id),
                        animated: true,
                        style: { stroke: '#333' }
                    });
                });
            }
        });

        const rawNodes = treeData.nodes.map(n => ({
            id: String(n.id),
            type: 'branch',
            data: { ...n }
        }));

        const layouted = getLayoutedElements(rawNodes, initialEdges);
        const hydratedNodes = hydrateNodes(layouted, initialEdges, treeData.isNew);
        
        const hydratedEdges = initialEdges.map(edge => {
          const targetNode = hydratedNodes.find(n => n.id === edge.target);
          const colIndex = targetNode ? targetNode.data.colIndex : 0;
          return {
            ...edge, style: treeData.isNew ? { opacity: 0, animation: `fade-edge 0.5s ease-in-out forwards ${colIndex * 0.5}s` } : { stroke: '#333' }
          };
        });
        
        setNodes(hydratedNodes);
        setEdges(hydratedEdges);
        
        if (treeData.isNew && typeof onSave === 'function') {
            onSave({ ...treeData, isNew: false, nodes: hydratedNodes, edges: hydratedEdges });
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData?.id, hydrateNodes]);

  // CRITICAL FIX 2: Autosave strictly on nodes/edges change using a safe reference
  const treeDataRef = useRef(treeData);
  useEffect(() => { treeDataRef.current = treeData; }, [treeData]);

  useEffect(() => { 
    if (nodes.length > 0 && typeof onSave === 'function') {
      onSave({ ...treeDataRef.current, nodes, edges }); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  const expandBranch = async (parentId, nodeTopic, startX, startY) => {
    const userTier = profile?.tier?.toLowerCase() || 'free';
    if (userTier === 'free') {
       if (onOpenPricing) onOpenPricing();
       return;
    }

    if (isExpanding) return; 
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
                                            id: `e${pId}-${node.id}`, source: String(pId), target: String(node.id), type: 'default', animated: true,
                                            style: { stroke: '#ffffff', strokeWidth: 2, opacity: 0, animation: 'fade-edge 0.5s ease-in-out forwards' }
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

  const panToColumn = (direction) => {
    if (!rfInstance || nodes.length === 0) return;
    const uniqueX = Array.from(new Set(nodes.map(n => n.position.x))).sort((a, b) => a - b);
    const { x: currentViewportX, zoom } = rfInstance.getViewport();
    const viewportWidth = document.querySelector('.react-flow')?.clientWidth || window.innerWidth;
    const centerScreenXInGraph = (viewportWidth / 2 - currentViewportX) / zoom;

    let targetGraphX;
    if (direction === 'right') {
      const nextCol = uniqueX.find(x => x > centerScreenXInGraph + 50);
      if (nextCol !== undefined) targetGraphX = nextCol;
      else return; 
    } else {
      const prevCol = [...uniqueX].reverse().find(x => x < centerScreenXInGraph - 50);
      if (prevCol !== undefined) targetGraphX = prevCol;
      else return; 
    }
    const targetViewportX = (viewportWidth / 2) - (targetGraphX * zoom);
    rfInstance.setViewport({ x: targetViewportX, y: rfInstance.getViewport().y, zoom }, { duration: 800 });
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
      {/* 1. FULL WIDTH NAVBAR - EXACTLY AS YOU DESIGNED IT */}
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

      {/* 2. CANVAS AREA */}
      <div style={{ flex: 1, position: 'relative', width: '100%' }}>
        <button onClick={onBack} style={{ position: 'absolute', top: '25px', left: '30px', zIndex: 100, background: 'rgba(17, 17, 17, 0.85)', border: '1px solid #333', color: '#fff', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', backdropFilter: 'blur(5px)' }}>← Dashboard</button>
        <button onClick={() => panToColumn('left')} style={{ position: 'absolute', top: '50%', left: '30px', transform: 'translateY(-50%)', zIndex: 100, background: 'rgba(17,17,17,0.8)', border: '1px solid #444', color: '#fff', fontSize: '24px', padding: '25px 15px', cursor: 'pointer', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>◀</button>
        <button onClick={() => panToColumn('right')} style={{ position: 'absolute', top: '50%', right: '30px', transform: 'translateY(-50%)', zIndex: 100, background: 'rgba(17,17,17,0.8)', border: '1px solid #444', color: '#fff', fontSize: '24px', padding: '25px 15px', cursor: 'pointer', borderRadius: '12px', backdropFilter: 'blur(5px)' }}>▶</button>

        <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            nodeTypes={nodeTypes} 
            fitView 
            onNodeClick={(e, node) => setActiveNodeData({ node, clickPos: { x: e.clientX, y: e.clientY } })} 
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
          <BranchSubpage node={liveActiveNode} clickPos={activeNodeData.clickPos} onClose={() => setActiveNodeData(null)} onMarkLearned={() => handleUpdateNodeStatus(liveActiveNode.id, 'mastered')} isUnlockable={checkIsUnlockable(liveActiveNode.id, nodes, edges)} />
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