import React from 'react';

export default function BranchSubpage({ node, onClose }) {
  if (!node) return null;

  const { label, difficulty, description } = node.data || {};

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 
      }}
      onClick={onClose} 
    >
      <div 
        style={{
          background: '#1e293b', color: '#f8fafc', padding: '40px',
          borderRadius: '20px', width: '600px', maxWidth: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative', border: '1px solid #334155'
        }}
        onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '20px', right: '20px', background: 'transparent',
            border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer',
            padding: '5px 10px', borderRadius: '5px'
          }}
        >✕</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#38bdf8' }}>
            {label || 'Unknown Branch'}
          </h2>
          <span style={{ 
            background: '#0f172a', padding: '8px 16px', borderRadius: '20px', 
            fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px',
            color: '#94a3b8', border: '1px solid #334155'
          }}>
            Difficulty: {difficulty || '???'}
          </span>
        </div>

        <div style={{ marginBottom: '40px', lineHeight: '1.6', color: '#cbd5e1' }}>
          <h3 style={{ fontSize: '18px', color: 'white', marginBottom: '10px' }}>Description</h3>
          <p>{description || `A detailed description for mastering ${label || 'this topic'} is being compiled.`}</p>
        </div>

        <div style={{ background: '#0f172a', border: '2px dashed #475569', borderRadius: '12px', padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>▶️</div>
          <p style={{ margin: 0 }}>YouTube Video Placeholder</p>
        </div>
      </div>
    </div>
  );
}