import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function Dashboard({ savedTrees, userXP, onOpenTree, onGenerate, onDeleteTree, onOpenLogin, onOpenXpStats }) {
  const [topic, setTopic] = useState('');
  const [treeToDelete, setTreeToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user, logout } = useAuth();

  const calculateProgress = (nodes) => {
    if (!nodes || nodes.length === 0) return 0;
    const mastered = nodes.filter(n => n.data?.status === 'mastered').length;
    return Math.round((mastered / nodes.length) * 100);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic.trim());
      setTopic(''); 
    }
  };

  const confirmDelete = (e, tree) => {
    e.stopPropagation();
    setTreeToDelete(tree);
  };

  const executeDelete = () => {
    if (treeToDelete) {
      onDeleteTree(treeToDelete.id);
      setTreeToDelete(null);
    }
  };

  const filteredTrees = savedTrees.filter(tree =>
    tree.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px 40px 40px 40px', color: '#ededed', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', margin: 0, fontWeight: '600', letterSpacing: '-0.5px' }}>Kinetree</h1>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
          {/* UPDATED: XP Button */}
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
              onClick={logout} 
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

      <div style={{ background: '#0a0a0a', padding: '25px', borderRadius: '8px', marginBottom: '40px', border: '1px solid #222' }}>
        <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '16px', fontWeight: '500', color: '#888' }}>Grow a New Skill Tree</h2>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="What do you want to learn? (e.g., Python, System Design, 3D Modeling)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{ flexGrow: 1, padding: '12px 16px', borderRadius: '4px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '15px', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#666'}
            onBlur={(e) => e.target.style.borderColor = '#333'}
          />
          <button type="submit" style={{ padding: '0 24px', borderRadius: '4px', border: '1px solid #ededed', background: '#ededed', color: '#000', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
            Generate
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '500' }}>Your Saved Trees</h2>
        <input
          type="text"
          placeholder="Search trees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '14px', width: '250px', outline: 'none' }}
          onFocus={(e) => e.target.style.borderColor = '#666'}
          onBlur={(e) => e.target.style.borderColor = '#333'}
        />
      </div>

      {filteredTrees.length === 0 ? (
        <p style={{ color: '#666', fontSize: '15px', textAlign: 'center', marginTop: '60px', fontFamily: 'monospace' }}>
          {savedTrees.length === 0 ? "You haven't generated any trees on this account yet." : "No matching trees found."}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '15px' }}>
          {filteredTrees.map(tree => {
            const progress = calculateProgress(tree.nodes);
            return (
              <div
                key={tree.id}
                onClick={() => onOpenTree(tree)}
                style={{ background: '#0a0a0a', borderRadius: '6px', padding: '20px', cursor: 'pointer', border: '1px solid #222', transition: 'border-color 0.2s', position: 'relative' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#555'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
              >
                <button
                  onClick={(e) => confirmDelete(e, tree)}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#666', fontSize: '16px', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.target.style.color = '#ff4444'}
                  onMouseLeave={(e) => e.target.style.color = '#666'}
                >
                  ✕
                </button>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '500', paddingRight: '20px' }}>{tree.topic}</h3>
                
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '20px', fontFamily: 'monospace' }}>
                  Generated: {tree.dateCreated}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#888', fontSize: '12px', marginBottom: '8px', fontFamily: 'monospace' }}>
                  <span>Progress</span>
                  <span style={{ color: '#ededed' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', background: '#222', borderRadius: '2px', height: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, background: '#ededed', height: '100%', transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {treeToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#0a0a0a', padding: '30px', borderRadius: '6px', border: '1px solid #ff4444', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '500' }}>Delete "{treeToDelete.topic}"?</h3>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '25px' }}>This action is permanent and cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setTreeToDelete(null)} style={{ padding: '8px 16px', background: 'transparent', color: '#ededed', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={executeDelete} style={{ padding: '8px 16px', background: '#ff4444', color: '#fff', border: '1px solid #ff4444', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}