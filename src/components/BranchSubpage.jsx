import React, { useState, useEffect } from 'react';

export default function BranchSubpage({ node, clickPos, onClose, onMarkLearned, isUnlockable }) {
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
    setTimeout(() => setIsDeniedGlitching(false), 300);
  };

  const searchQuery = encodeURIComponent(`${data.label} ${data.description}`);
  const youtubeLink = `https://www.youtube.com/results?search_query=${searchQuery}`;
  const siteLink = data.resource_link && data.resource_link !== "" 
    ? data.resource_link 
    : `https://www.google.com/search?q=${searchQuery}+guide+tutorial`;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: isActive ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 2000, transition: 'background-color 0.3s ease',
      backdropFilter: isActive ? 'blur(4px)' : 'blur(0px)'
    }}>
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: translate(${startX}px, ${startY}px) scale(0.5); }
          100% { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        @keyframes popOut {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(${startX}px, ${startY}px) scale(0.5); }
        }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-4px, 2px) }
          40% { transform: translate(4px, -2px) }
          60% { transform: translate(-4px, -2px) }
          80% { transform: translate(4px, 2px) }
          100% { transform: translate(0) }
        }
        .glitch-btn {
          animation: glitch 0.3s cubic-bezier(.36,.07,.19,.97) both;
          background: #330000 !important; border-color: #ff4444 !important; color: #ff4444 !important;
        }
        .mastery-btn {
          background: #fff !important; color: #000 !important;
          box-shadow: 0 0 20px rgba(255,255,255,0.5); transform: scale(1.05); transition: all 0.2s;
        }
      `}</style>
      
      <div style={{
        background: '#0a0a0a', padding: '40px', borderRadius: '12px',
        border: '1px solid #333', width: '100%', maxWidth: '500px', color: '#fff', position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        animation: isClosing ? 'popOut 0.3s ease-in forwards' : 'popIn 0.3s ease-out forwards',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '-0.5px' }}>{data.label}</h2>
          <span style={{ 
            fontSize: '12px', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase',
            border: `1px solid ${isMastered ? '#555' : '#333'}`, color: isMastered ? '#ededed' : '#888',
            background: '#111'
          }}>
            {data.difficulty}
          </span>
        </div>

        <p style={{ color: '#aaa', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>{data.description}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '35px' }}>
            <a href={youtubeLink} target="_blank" rel="noreferrer" style={{
                display: 'block', padding: '14px', background: '#111', border: '1px solid #222',
                color: '#ededed', textDecoration: 'none', borderRadius: '6px', fontSize: '14px',
                textAlign: 'center', fontWeight: '600', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.background = '#222'; e.target.style.borderColor = '#444'; }}
            onMouseLeave={e => { e.target.style.background = '#111'; e.target.style.borderColor = '#222'; }}>
                ► Search YouTube Tutorials
            </a>
            <a href={siteLink} target="_blank" rel="noreferrer" style={{
                display: 'block', padding: '14px', background: '#111', border: '1px solid #222',
                color: '#ededed', textDecoration: 'none', borderRadius: '6px', fontSize: '14px',
                textAlign: 'center', fontWeight: '600', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.background = '#222'; e.target.style.borderColor = '#444'; }}
            onMouseLeave={e => { e.target.style.background = '#111'; e.target.style.borderColor = '#222'; }}>
                🌐 View Documentation / Guides
            </a>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #222', paddingTop: '20px' }}>
          <button onClick={handleClose} style={{
            padding: '10px 20px', borderRadius: '4px', border: 'none', background: 'transparent', 
            color: '#888', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.target.style.color = '#ededed'}
          onMouseLeave={e => e.target.style.color = '#888'}
          >Close</button>
          
          {isMastered ? (
            <button disabled style={{ padding: '10px 20px', borderRadius: '4px', border: '1px solid #333', background: '#111', color: '#555', cursor: 'not-allowed', fontSize: '13px', fontWeight: 'bold' }}>
              Mastered
            </button>
          ) : isUnlockable ? (
            <button onClick={handleMarkLearned} className={isMastering ? 'mastery-btn' : ''} style={{
                padding: '10px 20px', borderRadius: '4px', border: 'none', background: '#ededed', 
                color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.target.style.opacity = '0.8'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >Mark as Mastered</button>
          ) : (
            <button onClick={handleDenialClick} className={isDeniedGlitching ? 'glitch-btn' : ''} style={{
                padding: '10px 20px', borderRadius: '4px', border: '1px solid #333', background: '#111', 
                color: '#555', cursor: 'not-allowed', fontSize: '13px', fontWeight: 'bold'
              }}>Prerequisites Required</button>
          )}
        </div>
      </div>
    </div>
  );
}