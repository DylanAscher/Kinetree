import React, { useState, useEffect } from 'react';

export default function BranchSubpage({ node, clickPos, onClose, onMarkLearned, isUnlockable }) {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Animation States
  const [isDeniedGlitching, setIsDeniedGlitching] = useState(false);
  const [isMastering, setIsMastering] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!node) return null;

  const { data } = node;
  const isMastered = data.status === 'mastered';

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
    
    // Wait exactly 400ms for the satisfying mechanical lock animation to finish
    setTimeout(() => {
      onMarkLearned();
      setIsMastering(false);
    }, 400);
  };

  const handleDenialClick = () => {
    if (isDeniedGlitching) return;
    setIsDeniedGlitching(true);
    setTimeout(() => setIsDeniedGlitching(false), 300);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: isActive ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0)',
      backdropFilter: isActive ? 'blur(2px)' : 'blur(0px)',
      transition: 'all 0.3s ease',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
      pointerEvents: isClosing ? 'none' : 'auto' 
    }}>
      
      <style>{`
        /* The Denial Glitch */
        @keyframes glitch-radiate {
          0% { transform: translate(0); box-shadow: 0 0 0 0 rgba(255,68,68,0.8); }
          20% { transform: translate(-2px, 2px); box-shadow: 0 0 0 5px rgba(255,68,68,0.5); filter: invert(0.2); }
          40% { transform: translate(2px, -2px); filter: hue-rotate(90deg); }
          60% { transform: translate(-2px, -2px); filter: invert(0.2); }
          80% { transform: translate(2px, 2px); }
          100% { transform: translate(0); box-shadow: 0 0 0 15px rgba(255,68,68,0); filter: none; }
        }
        .glitch-btn {
          animation: glitch-radiate 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both !important;
          border-color: #ff4444 !important;
          color: #ff4444 !important;
        }

        /* The Mechanical Mastery Lock-in */
        @keyframes mastery-lock {
          0% { transform: scale(1); background: #ededed; color: #000; box-shadow: 0 0 0 0 rgba(237,237,237,0.8); }
          30% { transform: scale(0.95); background: #fff; color: #000; box-shadow: 0 0 0 0 rgba(237,237,237,0.9); }
          70% { transform: scale(1.03); background: #ededed; color: #000; box-shadow: 0 0 0 12px rgba(237,237,237,0); }
          100% { transform: scale(1); background: #111; color: #555; box-shadow: 0 0 0 0 rgba(237,237,237,0); }
        }
        .mastery-btn {
          animation: mastery-lock 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards !important;
          pointer-events: none;
        }
      `}</style>

      <div className="modal-container" style={{
        background: '#0a0a0a', padding: '35px', borderRadius: '6px',
        width: '500px', maxWidth: '90%', color: '#ededed',
        border: `1px solid ${isMastered ? '#ededed' : '#333'}`,
        boxShadow: isMastered ? '0 0 20px rgba(255, 255, 255, 0.05)' : 'none',
        opacity: isActive ? 1 : 0,
        transform: isActive 
          ? 'translate(0px, 0px) scale(1)' 
          : `translate(${startX}px, ${startY}px) scale(0.1)`,
        transition: isClosing 
            ? 'transform 0.3s ease-in, opacity 0.3s ease' 
            : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
        position: 'relative', 
        overflow: 'hidden'    
      }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#fff', fontWeight: '500', letterSpacing: '-0.5px' }}>
            {data.label}
          </h2>
          <span style={{ 
            background: isMastered ? '#ededed' : '#111', 
            color: isMastered ? '#000' : '#888', 
            padding: '4px 8px', borderRadius: '2px', border: isMastered ? 'none' : '1px solid #333',
            fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold'
          }}>
            {isMastered ? 'MASTERED' : 'LOCKED'}
          </span>
        </div>

        <p style={{ fontSize: '14px', color: '#a3a3a3', lineHeight: '1.6', marginBottom: '30px', position: 'relative', zIndex: 10 }}>
          {data.description}
        </p>

        {data.resource_link && (
          <div style={{ marginBottom: '30px', position: 'relative', zIndex: 10 }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>Helpful Resource</p>
            <a 
              href={data.resource_link} target="_blank" rel="noopener noreferrer" 
              style={{ color: '#ededed', textDecoration: 'none', borderBottom: '1px solid #555', paddingBottom: '2px', fontSize: '14px' }}
            >
              View Learning Material ↗
            </a>
          </div>
        )}

        {/* Footer Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #222', position: 'relative', zIndex: 10 }}>
          <button onClick={handleClose} style={{
            padding: '10px 20px', borderRadius: '4px', border: '1px solid #333',
            background: 'transparent', color: '#a3a3a3', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
          }}>
            Close
          </button>
          
          {isMastered ? (
            <button disabled style={{
              padding: '10px 20px', borderRadius: '4px', border: '1px solid #333',
              background: '#111', color: '#555', cursor: 'not-allowed', fontSize: '13px', fontWeight: 'bold'
            }}>
              Mastered
            </button>
          ) : isUnlockable ? (
            <button 
              onClick={handleMarkLearned} 
              className={isMastering ? 'mastery-btn' : ''}
              style={{
                padding: '10px 20px', borderRadius: '4px', border: 'none',
                background: '#ededed', color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
              }}>
              Mark as Mastered
            </button>
          ) : (
            <button 
              onClick={handleDenialClick}
              className={isDeniedGlitching ? 'glitch-btn' : ''}
              style={{
                padding: '10px 20px', borderRadius: '4px', border: '1px solid #333',
                background: '#111', color: '#555', cursor: 'not-allowed', fontSize: '13px', fontWeight: 'bold',
                transition: 'all 0.1s ease'
              }}>
              Prerequisites Needed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}