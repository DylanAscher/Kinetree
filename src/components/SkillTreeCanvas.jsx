import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { Controls, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import Branch from './Branch';
import BranchSubpage from './BranchSubpage';
import { useAuth } from '../context/AuthContext';

const nodeTypes = { branch: Branch };

export default function SkillTreeCanvas({ treeData, userXP, onBack, onSave, onOpenLogin, onOpenLeaderboard, onOpenPricing }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeNodeData, setActiveNodeData] = useState(null); 
  const [rfInstance, setRfInstance] = useState(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [initialFitDone, setInitialFitDone] = useState(false);

  const { user, profile, logout } = useAuth();

  useEffect(() => { setInitialFitDone(false); }, [treeData.id]);

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
        const paddingY = 120; 
        const container = document.querySelector('.react-flow');
        const viewportHeight = container ? container.clientHeight : window.innerHeight;
        const viewportWidth = container ? container.clientWidth : window.innerWidth;

        let targetZoom = viewportHeight / (graphHeight + paddingY);
        targetZoom = Math.min(Math.max(targetZoom, 0.1), 2); 

        const rootNode = nodes.reduce((prev, curr) => (prev.position.x < curr.position.x ? prev : curr), nodes[0]);
        const centerY = minY + (graphHeight / 2);
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

  useEffect(() => {
    if (treeData) {
      const hydratedNodes = hydrateNodes(treeData.nodes || [], treeData.edges || [], treeData.isNew);
      setNodes(hydratedNodes);
      const hydratedEdges = (treeData.edges || []).map(edge => {
        const targetNode = hydratedNodes.find(n => n.id === edge.target);
        const colIndex = targetNode ? targetNode.data.colIndex : 0;
        return {
          ...edge, style: treeData.isNew ? { opacity: 0, animation: `fade-edge 0.5s ease-in-out forwards ${colIndex * 0.5}s` } : {}
        };
      });
      setEdges(hydratedEdges);
      if (treeData.isNew) onSave({ ...treeData, isNew: false });
    }
  }, [treeData.id, hydrateNodes]); 

  useEffect(() => { if (nodes.length > 0) onSave({ ...treeData, nodes, edges }); }, [nodes, edges]);

  const expandBranch = async (parentId, nodeTopic, startX, startY) => {
    // --- SaaS TIER LOGIC ---
    const userTier = profile?.tier?.toLowerCase() || 'free';
    if (userTier === 'free') {
       if (onOpenPricing) onOpenPricing();
       return;
    }
    // -----------------------

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
    } catch (err) { } finally { setIsExpanding(false); }
  };

  const handleUpdateNodeStatus = (nodeId, newStatus) => {
    setNodes((nds) => {
      const updatedNodes = nds.map((n) => { if (n.id === nodeId) return { ...n, data: { ...n.data, status: newStatus } }; return n; });
      return updatedNodes.map(n => ({ ...n, data: { ...n.data, isUnlockable: checkIsUnlockable(n.id, updatedNodes, edges) } }));
    });
  };

  const handleLogout = () => { logout(); onBack(); };

  const panToColumn = (direction) => {
    if (!rfInstance || nodes.length === 0) return;
    const uniqueX = Array.from(new Set(nodes.map(n => n.position.x))).sort((a, b) => a - b);
    const { x: currentXPos, y, zoom } = rfInstance.getViewport();
    const container = document.querySelector('.react-flow');
    const viewportWidth = container ? container.clientWidth : window.innerWidth;
    const centerScreenX = (viewportWidth / 2 - currentXPos) / zoom;

    let closestColIndex = 0, minDiff = Infinity;
    uniqueX.forEach((colX, index) => {
        const diff = Math.abs(colX - centerScreenX);
        if (diff < minDiff) { minDiff = diff; closestColIndex = index; }
    });

    let targetColIndex = closestColIndex;
    if (direction === 'right' && closestColIndex < uniqueX.length - 1) targetColIndex = closestColIndex + 1;
    else if (direction === 'left' && closestColIndex > 0) targetColIndex = closestColIndex - 1;
    else return; 

    const targetX = uniqueX[targetColIndex];
    const startX = currentXPos;
    const endX = (viewportWidth / 2) - (targetX * zoom) - (130 * zoom);
    
    const startTime = performance.now();
    const duration = 400;
    const animatePan = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const newX = startX + (endX - startX) * ease;
      rfInstance.setViewport({ x: newX, y, zoom }); 
      if (progress < 1) requestAnimationFrame(animatePan);
    };
    requestAnimationFrame(animatePan);
  };

  const liveActiveNode = activeNodeData ? nodes.find(n => n.id === activeNodeData.node.id) : null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'transparent', overflow: 'hidden' }}>
      <style>{`
        @keyframes fade-edge { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes pulse-text { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      `}</style>

      <div style={{ padding: '15px 30px', background: '#0a0a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onBack} style={{ padding: '8px 16px', background: 'transparent', color: '#ededed', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.target.style.background = '#ededed'; e.target.style.color = '#000'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ededed'; }}
          >← Back to Dashboard</button>
          <h2 style={{ margin: 0, color: '#ededed', fontSize: '20px', fontWeight: '500', letterSpacing: '-0.5px' }}>{treeData.topic}</h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', padding: '6px 14px', borderRadius: '50px', border: '1px solid #333' }}>
             <span style={{ color: '#888', fontWeight: 'bold', fontSize: '12px' }}>XP</span>
             <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ededed' }}>{userXP}</span>
          </div>
          
          <button onClick={onOpenLeaderboard} style={{ background: '#ededed', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
             Rankings
          </button>
          
          {user ? (
            <button onClick={handleLogout} style={{ fontSize: '14px', fontWeight: 'bold', color: '#ededed', background: 'transparent', padding: '8px 16px', borderRadius: '4px', border: '1px solid #333', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.target.style.background = '#ededed'; e.target.style.color = '#000'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ededed'; }}
            >{user.email} (Log out)</button>
          ) : (
            <button onClick={onOpenLogin} style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', background: '#ededed', padding: '8px 24px', borderRadius: '4px', border: '1px solid #ededed', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >Log In</button>
          )}
        </div>
      </div>

      <div style={{ flexGrow: 1, position: 'relative' }} onWheelCapture={(e) => { if (e.ctrlKey || e.metaKey || !rfInstance) return; if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { const { x, y, zoom } = rfInstance.getViewport(); rfInstance.setViewport({ x: x - e.deltaY, y, zoom }); } }}>
        <button onClick={() => panToColumn('left')} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 100, background: 'rgba(10,10,10,0.8)', border: '1px solid #333', color: '#fff', fontSize: '24px', padding: '20px 15px', cursor: 'pointer', borderRadius: '8px', backdropFilter: 'blur(5px)' }}>◀</button>
        <button onClick={() => panToColumn('right')} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 100, background: 'rgba(10,10,10,0.8)', border: '1px solid #333', color: '#fff', fontSize: '24px', padding: '20px 15px', cursor: 'pointer', borderRadius: '8px', backdropFilter: 'blur(5px)' }}>▶</button>

        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} nodeTypes={nodeTypes} fitView onNodeClick={(e, node) => setActiveNodeData({ node, clickPos: { x: e.clientX, y: e.clientY } })} onInit={setRfInstance} panOnDrag={false} panOnScroll={true} panOnScrollMode="horizontal" zoomOnScroll={false} nodesDraggable={false} minZoom={0.05} maxZoom={3} attributionPosition="bottom-left">
          <Controls style={{ button: { backgroundColor: '#0a0a0a', border: '1px solid #333', fill: '#888' } }} />
        </ReactFlow>

        {liveActiveNode && activeNodeData && (
          <BranchSubpage node={liveActiveNode} clickPos={activeNodeData.clickPos} onClose={() => setActiveNodeData(null)} onMarkLearned={() => handleUpdateNodeStatus(liveActiveNode.id, 'mastered')} isUnlockable={checkIsUnlockable(liveActiveNode.id, nodes, edges)} />
        )}

        {isExpanding && (
          <div style={{ position: 'absolute', bottom: '30px', right: '30px', background: '#111', border: '1px solid #333', color: '#ededed', padding: '10px 20px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.5)', animation: 'pulse-text 1.5s infinite ease-in-out' }}>
            Generating...
          </div>
        )}
      </div>
    </div>
  );
}