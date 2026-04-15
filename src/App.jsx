import React, { useState, useMemo } from 'react';
import ReactFlow, { useNodesState, useEdgesState, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import confetti from 'canvas-confetti'; 

import Branch from './components/Branch'; 
import BranchSubpage from './components/BranchSubpage'; 
import GeneratePopup from './components/GeneratePopup';

export default function App() {
  const [topic, setTopic] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userXP, setUserXP] = useState(0); 

  // NEW: State to control if the user can move the tree (panning)
  const [isPaneDraggable, setIsPaneDraggable] = useState(true);

  const nodeTypes = useMemo(() => ({ branch: Branch }), []);

  const castSpell = async (e) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:8000/generate-tree?topic=${topic}`);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const formattedNodes = (data.nodes || []).map((node) => ({
        id: String(node.id), 
        type: 'branch', 
        position: { x: node.x, y: node.y }, 
        data: { 
            label: node.label, 
            description: node.description,
            resources: node.resources,
            difficulty: node.difficulty, 
            status: 'locked' 
        }
      }));

      const formattedEdges = [];
      formattedNodes.forEach((nodeA) => {
          formattedNodes.forEach((nodeB) => {
              if (
                  nodeB.position.x === nodeA.position.x + 250 && 
                  Math.abs(nodeB.position.y - nodeA.position.y) <= 150
              ) {
                  formattedEdges.push({
                      id: `e${nodeA.id}-${nodeB.id}`,
                      source: nodeA.id,
                      target: nodeB.id,
                      type: 'bezier', 
                      animated: true      
                  });
              }
          });
      });
      
      setNodes(formattedNodes);
      setEdges(formattedEdges);
      
    } catch (err) {
      setError("Failed to reach local API. Check if your Python server is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkPrerequisites = (nodeId) => {
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    if (incomingEdges.length === 0) return true; 

    return incomingEdges.every(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      return sourceNode?.data?.status === 'mastered';
    });
  };

  const handleMarkLearned = (nodeId) => {
    const difficulty = selectedNode?.data?.difficulty;

    setNodes((currentNodes) =>
      currentNodes.map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, status: 'mastered' } };
        }
        return n;
      })
    );
    
    setSelectedNode((prev) => ({
      ...prev,
      data: { ...prev.data, status: 'mastered' }
    }));

    if (difficulty === 'Beginner') setUserXP(prev => prev + 50);
    else if (difficulty === 'Intermediate') setUserXP(prev => prev + 100);
    else if (difficulty === 'Advanced') setUserXP(prev => prev + 200);
    else setUserXP(prev => prev + 100); 

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '15px 30px', background: '#1e293b', borderBottom: '1px solid #334155', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '24px' }}>Iter Arbor</h2>
        <form onSubmit={castSpell} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
            placeholder="What do you want to learn?" 
            style={{ padding: '10px 20px', borderRadius: '30px', border: '1px solid #475569', background: '#0f172a', color: 'white', width: '350px', textAlign: 'center', outline: 'none' }} 
          />
          <button type="submit" style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>Grow Tree</button>
        </form>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>XP: {userXP}</span>
          <button style={{ background: '#0f172a', color: '#e2e8f0', border: '1px solid #475569', padding: '8px 20px', borderRadius: '20px' }}>User</button>
        </div>
      </div>

      <div style={{ flexGrow: 1, position: 'relative' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onNodeClick={(_, node) => setSelectedNode(node)} 
          nodeTypes={nodeTypes} 
          fitView 
          nodesDraggable={false} 
          // FIX: Toggle panning off when hovering a node to prevent accidental background slides
          panOnDrag={isPaneDraggable}
          onNodeMouseEnter={() => setIsPaneDraggable(false)}
          onNodeMouseLeave={() => setIsPaneDraggable(true)}
        >
          <Controls />
        </ReactFlow>
      </div>

      {selectedNode && (
        <BranchSubpage 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)} 
          onMarkLearned={() => handleMarkLearned(selectedNode.id)} 
          isUnlockable={checkPrerequisites(selectedNode.id)} 
        />
      )}
      {loading && <GeneratePopup />}
    </div>
  );
}