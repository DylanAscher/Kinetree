import React, { useState, useEffect } from 'react';

// 1. Catch the new allNodes prop
export default function BranchSubpage({ node, clickPos, onClose, onMarkLearned, isUnlockable, allNodes }) {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDeniedGlitching, setIsDeniedGlitching] = useState(false);
  const [isMastering, setIsMastering] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!node) return null;

  const { data } = node;
  const isMastered = data.status === 'mastered';

  // 2. Map parent IDs to their actual readable labels
  const prereqIds = data.parent_ids || [];
  const prerequisites = prereqIds.map(pid => {
    const foundNode = allNodes?.find(n => String(n.id) === String(pid));
    return foundNode ? foundNode.data.label : pid;
  });

  const modalX = window.innerWidth / 2;
  const modalY = window.innerHeight / 2;
  const startX = clickPos ? clickPos.x - modalX : 0;
  const startY = clickPos ? clickPos.y - modalY : 0;
  const isActive = mounted && !isClosing;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleMarkLearned = () => {
    if (isMastering || isMastered) return;
    setIsMastering(true);
    setTimeout(() => { onMarkLearned(); handleClose(); }, 400);
  };

  const handleDenialClick = () => {
    setIsDeniedGlitching(true);
    setTimeout(() => setIsDeniedGlitching(false), 400);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: isActive ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0)',
      backdropFilter: isActive ? 'blur(8px)' : 'blur(0px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, transition: 'all 0.3s ease', pointerEvents: isClosing ? 'none' : 'auto'
    }} onClick={handleClose}>
      
      <style>{`
        @keyframes subpage-glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-4px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(4px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .glitch-btn { animation: subpage-glitch 0.3s ease forwards; background: #300 !important; color: #f88 !important; border-color: #f00 !important; }
        .mastery-btn { background: #111 !important; color: #fff !important; box-shadow: 0 0 20px rgba(255,255,255,0.2); }
      `}</style>

      <div style={{
        background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px',
        padding: '30px', width: '90%', maxWidth: '500px',
        transform: isActive ? 'translate(0px, 0px) scale(1)' : `translate(${startX}px, ${startY}px) scale(0.1)`,
        opacity: isActive ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '20px'
      }} onClick={e => e.stopPropagation()}>
        
        <div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#ededed' }}>{data.label}</h2>
          <span style={{
            background: '#111', padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
            fontWeight: 'bold', textTransform: 'uppercase', color: '#888', border: '1px solid #333'
          }}>
            {data.difficulty}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '15px', color: '#a3a3a3', lineHeight: '1.6' }}>
          {data.description}
        </p>

        {/* 3. NEW PREREQUISITES BLOCK */}
        {prerequisites.length > 0 && (
          <div style={{ background: '#111', padding: '15px', borderRadius: '6px', border: '1px solid #222' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Required Prerequisites
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#888', fontSize: '14px' }}>
              {prerequisites.map((prereq, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{prereq}</li>
              ))}
            </ul>
          </div>
        )}

        {data.resource_link && (
          <a href={data.resource_link} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', padding: '12px 16px', background: '#1a1a1a', border: '1px solid #444',
            color: '#ededed', textDecoration: 'none', borderRadius: '6px', fontSize: '14px',
            fontWeight: 'bold', textAlign: 'center', transition: 'background 0.2s'
          }} onMouseEnter={e => e.target.style.background = '#222'} onMouseLeave={e => e.target.style.background = '#1a1a1a'}>
            Explore Resource ↗
          </a>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #222' }}>
          <button onClick={handleClose} style={{
            background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'color 0.2s'
          }} onMouseEnter={e => e.target.style.color = '#ededed'} onMouseLeave={e => e.target.style.color = '#888'}>
            Close
          </button>
          
          {isMastered ? (
            <button disabled style={{ padding: '10px 20px', borderRadius: '4px', border: '1px solid #333', background: '#111', color: '#555', cursor: 'not-allowed', fontSize: '13px', fontWeight: 'bold' }}>
              Mastered
            </button>
          ) : isUnlockable ? (
            <button onClick={handleMarkLearned} className={isMastering ? 'mastery-btn' : ''} style={{
                padding: '10px 20px', borderRadius: '4px', border: 'none', background: '#ededed', 
                color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'opacity 0.2s'
              }} onMouseEnter={e => e.target.style.opacity = '0.8'} onMouseLeave={e => e.target.style.opacity = '1'}>
              Mark as Mastered
            </button>
          ) : (
            <button onClick={handleDenialClick} className={isDeniedGlitching ? 'glitch-btn' : ''} style={{
                padding: '10px 20px', borderRadius: '4px', border: '1px solid #333', background: '#0a0a0a', 
                color: '#555', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s'
              }}>
              Locked
            </button>
          )}
        </div>
      </div>
    </div>
  );
}