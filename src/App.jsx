import React, { useState, useMemo } from 'react';
// 1. Import the specific hooks and components from 'reactflow'
import ReactFlow, { useNodesState, useEdgesState } from 'reactflow';
// 2. Import the mandatory React Flow styles
import 'reactflow/dist/style.css';

// Note: Ensure these components (Branch, BranchSubpage, GeneratePopup) 
// are defined or imported in your project.
import Branch from './components/Branch'; 
import BranchSubpage from './components/BranchSubpage'; 
import GeneratePopup from './components/GeneratePopup';

export default function App() {
  const [topic, setTopic] = useState('');
  
  // These hooks manage the internal state of your graph elements
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      // Map the data to the format React Flow expects
      setNodes((data.nodes || []).map(n => ({ 
        ...n, 
        id: String(n.id), 
        type: 'branch',
        position: n.position || { x: 0, y: 0 } // Ensure there is a position
      })));
      
      setEdges((data.edges || []).map(e => ({ 
        ...e, 
        id: String(e.id), 
        source: String(e.source), 
        target: String(e.target), 
        animated: true 
      })));
    } catch (err) {
      setError("Failed to reach local API. Check if your Python server is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          <button type="submit" style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
            Grow Tree
          </button>
        </form>
        {error && <span style={{ color: '#ef4444', fontSize: '12px' }}>{error}</span>}
        <button style={{ background: '#0f172a', color: '#e2e8f0', border: '1px solid #475569', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer' }}>User</button>
      </div>

      <div style={{ flexGrow: 1, position: 'relative' }}>
        {/* ReactFlow must be inside a container with defined height/width */}
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onNodeClick={(_, node) => setSelectedNode(node)} 
          nodeTypes={nodeTypes} 
          fitView // This will center the tree automatically when it loads
        />
      </div>

      {selectedNode && <BranchSubpage node={selectedNode} onClose={() => setSelectedNode(null)} />}
      {loading && <GeneratePopup />}
    </div>
  );
}