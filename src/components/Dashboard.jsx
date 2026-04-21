import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DialogModal from './DialogModal';

export default function Dashboard({ savedTrees = [], userXP, onOpenTree, onOpenLogin, onGenerate, onDeleteTree, onOpenLeaderboard, onOpenPricing }) {
  const { user, profile, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner'); 
  
  const [deleteId, setDeleteId] = useState(null);

  const filteredTrees = (savedTrees || []).filter(tree => 
    tree.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoggedIn = user && user.id !== 'guest';

  const handleGenerateClick = () => {
    if (!isLoggedIn) {
      onOpenLogin("An account is required to generate and save your own skill trees.");
    } else {
      onGenerate(newTopic, skillLevel); 
    }
  };

  return (
    <div style={{ 
      padding: '20px 50px 50px 50px', maxWidth: '1400px', margin: '0 auto', 
      width: '100%', minHeight: '100vh', boxSizing: 'border-box', 
      color: '#fff', display: 'flex', flexDirection: 'column'
    }}>
      
      <DialogModal 
        isOpen={!!deleteId}
        title="Delete Skill Tree"
        message="Are you sure you want to permanently delete this skill tree? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => { onDeleteTree(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />

      <header style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
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
              
              <button onClick={onOpenLeaderboard} style={{ background: '#ededed', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                 Rankings
              </button>

              <button onClick={onOpenPricing} style={{ background: 'linear-gradient(45deg, #4caf50, #2e7d32)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 0 15px rgba(76,175,80,0.3)' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                 Upgrade
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>{profile?.username || user.email}</span>
                <button onClick={logout} style={{ background: 'none', border: '1px solid #ff4444', color: '#ff4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '16px', color: '#aaa' }}>Log in to save your progress</span>
              <button onClick={() => onOpenLogin()} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                Log In
              </button>
            </div>
          )}
        </div>
      </header>

      {/* FIXED OFFCENTER: Added boxSizing: 'border-box' so padding stays internal */}
      <div style={{ flexShrink: 0, background: 'rgba(17, 17, 17, 0.7)', border: '1px solid #333', padding: '60px', borderRadius: '16px', marginBottom: '40px', textAlign: 'center', width: '100%', boxSizing: 'border-box', margin: '0 auto 40px auto', backdropFilter: 'blur(10px)' }}>
        <h2 style={{ margin: '0 0 35px 0', fontSize: '32px' }}>What do you want to learn today?</h2>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          
          <input 
            type="text" 
            placeholder="e.g., Python, Video Editing, Cooking..."
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateClick()} 
            style={{ flex: 1, padding: '20px 30px', background: '#0a0a0a', border: '1px solid #444', color: '#fff', borderRadius: '10px', fontSize: '22px', outline: 'none' }}
          />

          <select 
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            style={{ padding: '20px', background: '#0a0a0a', border: '1px solid #444', color: '#fff', borderRadius: '10px', fontSize: '20px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Full Progression" style={{ color: '#4caf50', fontWeight: 'bold' }}>Full Progression (Unlimited)</option>
          </select>

          <button 
            onClick={handleGenerateClick}
            style={{ padding: '20px 45px', background: '#fff', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '22px' }}
          >
            Generate Tree
          </button>
        </div>
      </div>

      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '22px' }}>Saved Trees</h3>
        <input 
          type="text" placeholder="Search trees..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px 20px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '6px', width: '300px', fontSize: '16px', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px', paddingBottom: '50px' }}>
        {filteredTrees.length > 0 ? filteredTrees.map(tree => {
          const totalNodes = tree.nodes?.length || 0;
          const masteredNodes = tree.nodes?.filter(n => n.data?.status === 'mastered').length || 0;
          const progress = totalNodes === 0 ? 0 : Math.round((masteredNodes / totalNodes) * 100);

          return (
            <div key={tree.id} onClick={() => onOpenTree(tree)} style={{ background: 'rgba(17, 17, 17, 0.7)', border: '1px solid #333', padding: '30px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease', backdropFilter: 'blur(5px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: 'bold' }}>{tree.topic}</h3>
              <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#4caf50' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Created: {tree.dateCreated || (tree.created_at ? new Date(tree.created_at).toLocaleDateString() : 'Unknown')}</span>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(tree.id); }} style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Delete</button>
                  <span style={{ fontSize: '14px', color: '#444', fontWeight: 'bold' }}>View Tree →</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ width: '100%', gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#666' }}>
            <p style={{ fontSize: '18px' }}>No skill trees found.</p>
          </div>
        )}
      </div>

    </div>
  );
}