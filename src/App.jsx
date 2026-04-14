import React, { useState } from 'react';

// 1. The Custom Node (Consolidated into this single file)
function Branch({ data }) {
  const isMastered = data?.status === 'mastered';
  
  return (
    <div style={{
      background: isMastered ? '#064e3b' : '#1e293b',
      color: '#f8fafc',
      padding: '15px 20px',
      borderRadius: '12px',
      border: `2px solid ${isMastered ? '#10b981' : '#3b82f6'}`,
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      textAlign: 'center',
      minWidth: '160px',
      height: '70px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Visual Target Handle (Top) */}
      <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, background: '#cbd5e1', borderRadius: '50%', border: '1px solid #64748b' }} />
      
      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
        {data?.label || 'Skill Node'}
      </div>
      
      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8' }}>
        {data?.difficulty || 'Unknown'}
      </div>
      
      {/* Visual Source Handle (Bottom) */}
      <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, background: '#cbd5e1', borderRadius: '50%', border: '1px solid #64748b' }} />
    </div>
  );
}

// 2. The Main Application
export default function App() {
  const [topic, setTopic] = useState('');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const castSpell = async (e) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);
    setError('');

    try {
      // Fetching from your local Python backend
      const response = await fetch(`http://localhost:8000/generate-tree?topic=${topic}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      // Process Nodes
      const formattedNodes = data.nodes.map((node, index) => ({
        ...node,
        // Fallback positioning if the AI fails to generate x/y coordinates
        position: node.position || { x: window.innerWidth / 2 - 80, y: 100 + (index * 120) } 
      }));

      setNodes(formattedNodes);
      setEdges(data.edges || []);
      
    } catch (err) {
      setError("Failed to reach the local API. Is your Python server running on localhost:8000?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to draw lines between nodes
  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);

      if (!sourceNode || !targetNode) return null;

      // Calculate center points (assuming node width 160px, height 70px)
      const startX = sourceNode.position.x + 80;
      const startY = sourceNode.position.y + 70;
      const endX = targetNode.position.x + 80;
      const endY = targetNode.position.y;

      return (
        <line 
          key={edge.id}
          x1={startX} 
          y1={startY} 
          x2={endX} 
          y2={endY} 
          stroke="#94a3b8" 
          strokeWidth="2"
          strokeDasharray={edge.animated ? "5,5" : "none"}
        />
      );
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      
      {/* Header & Controls */}
      <div style={{ padding: '20px', background: '#1e293b', borderBottom: '1px solid #334155', color: 'white', display: 'flex', gap: '15px', alignItems: 'center', zIndex: 20 }}>
        <h2 style={{ margin: 0, color: '#38bdf8' }}>IterArbor</h2>
        
        <form onSubmit={castSpell} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Photography, Python" 
            style={{ 
              padding: '8px 12px', 
              borderRadius: '6px', 
              border: '1px solid #475569', 
              background: '#0f172a', 
              color: 'white', 
              width: '250px',
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              padding: '8px 16px', 
              background: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Generating...' : 'Manifest Tree'}
          </button>
        </form>
        
        {error && <span style={{ color: '#ef4444', fontSize: '14px', marginLeft: '10px' }}>{error}</span>}
      </div>

      {/* Custom React Flow Canvas Alternative */}
      <div style={{ flexGrow: 1, position: 'relative', overflow: 'auto' }}>
        {/* Background Pattern */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(#334155 1px, transparent 0)', backgroundSize: '20px 20px', opacity: 0.5 }} />
        
        {/* SVG Layer for Connections */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          {renderEdges()}
        </svg>

        {/* HTML Layer for Nodes */}
        {nodes.map((node) => (
          <div 
            key={node.id} 
            style={{ 
              position: 'absolute', 
              left: node.position.x, 
              top: node.position.y,
              transition: 'all 0.3s ease'
            }}
          >
            <Branch data={node.data} />
          </div>
        ))}
        
        {nodes.length === 0 && !loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#64748b', textAlign: 'center' }}>
            Enter a topic above and ensure your Python server is running to generate a skill tree.
          </div>
        )}
      </div>
      
    </div>
  );
}