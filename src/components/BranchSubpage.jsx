import React, { useState, useEffect } from 'react';

export default function BranchSubpage({ node, clickPos, onClose, onMarkLearned, isUnlockable, allNodes, treeTopic }) {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMastering, setIsMastering] = useState(false);
  const [isDeniedGlitching, setIsDeniedGlitching] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!node) return null;

  const { data } = node;
  const isMastered = data.status === 'mastered';

  const prereqIds = data.parent_ids || [];
  const prerequisites = prereqIds.map(pid => {
    const foundNode = allNodes?.find(n => String(n.id) === String(pid));
    return foundNode ? foundNode.data.label : pid;
  });

  const topicName = treeTopic || 'concept';
  const youtubeLink = `https://www.youtube.com/results?search_query=Learn+${encodeURIComponent(data.label)}+of+${encodeURIComponent(topicName)}`;

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
    setIsMastering(true);
    // Give the animation 1.2 seconds of "fanfare" before actually closing
    setTimeout(() => {
      onMarkLearned();
      handleClose();
    }, 1200);
  };

  const handleDenialClick = () => {
    setIsDeniedGlitching(true);
    setTimeout(() => setIsDeniedGlitching(false), 400);
  };

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: isActive ? 'auto' : 'none', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes mastery-glitch {
          0% { transform: translate(0); filter: hue-rotate(0deg); }
          20% { transform: translate(-5px, 5px); filter: hue-rotate(90deg); }
          40% { transform: translate(-5px, -5px); }
          60% { transform: translate(5px, 5px); filter: hue-rotate(180deg); }
          80% { transform: translate(5px, -5px); }
          100% { transform: translate(0); filter: hue-rotate(360deg); }
        }

        @keyframes particle-burst {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }

        @keyframes white-wash {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; }
          100% { opacity: 0; transform: scale(2); }
        }

        .mastery-active {
          animation: mastery-glitch 0.2s linear infinite;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          pointer-events: none;
        }
      `}</style>

      {/* Background Overlay */}
      <div 
        onClick={handleClose} 
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: isMastering ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.7)', 
          backdropFilter: 'blur(4px)',
          opacity: isActive ? 1 : 0, transition: 'all 0.3s ease'
        }} 
      />

      {/* FANFARE FX: White Flash Expansion */}
      {isMastering && (
        <div style={{
            position: 'absolute', width: '200px', height: '200px', background: '#fff', 
            borderRadius: '50%', filter: 'blur(40px)', zIndex: 1001,
            animation: 'white-wash 0.8s ease-out forwards'
        }} />
      )}

      {/* Main Modal Card */}
      <div className={isMastering ? 'mastery-active' : ''} style={{
        position: 'relative', width: '420px', background: '#000', border: '1px solid #222',
        borderRadius: '12px', padding: '35px', boxShadow: isMastering ? '0 0 100px #fff' : '0 20px 50px rgba(0,0,0,0.8)',
        transform: isActive ? 'translate(0, 0) scale(1)' : `translate(${startX}px, ${startY}px) scale(0.8)`,
        opacity: isActive ? 1 : 0, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        color: '#fff', fontFamily: 'inherit'
      }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', letterSpacing: '-0.5px', paddingRight: '15px' }}>
            {data.label}
          </h2>
          <span style={{ 
            fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', 
            fontWeight: 'bold', border: '1px solid #333', padding: '4px 10px', borderRadius: '4px', background: '#111',
            whiteSpace: 'nowrap', marginTop: '6px'
          }}>
            {data.difficulty || 'Intermediate'}
          </span>
        </div>

        {/* Description */}
        <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '14px', margin: '0 0 30px 0' }}>
          {data.description}
        </p>

        {/* Prerequisites */}
        {prerequisites.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Prerequisites</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {prerequisites.map((prereq, i) => (
                <span key={i} style={{ 
                  fontSize: '12px', color: '#ccc', fontWeight: '500', background: '#111', 
                  padding: '6px 12px', borderRadius: '6px', border: '1px solid #222' 
                }}>
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stacked Resources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '35px' }}>
          <a href={youtubeLink} target="_blank" rel="noopener noreferrer" style={{ 
            width: '100%', boxSizing: 'border-box', textAlign: 'center', padding: '12px 0', background: '#111', 
            border: '1px solid #333', borderRadius: '6px', color: '#fff', 
            textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s' 
          }}
          onMouseEnter={e => { e.target.style.background = '#222'; e.target.style.borderColor = '#555'; }} 
          onMouseLeave={e => { e.target.style.background = '#111'; e.target.style.borderColor = '#333'; }}>
            Watch YouTube Video ▶
          </a>

          {data.resource_link ? (
             <a href={data.resource_link} target="_blank" rel="noopener noreferrer" style={{ 
               width: '100%', boxSizing: 'border-box', textAlign: 'center', padding: '12px 0', background: '#111', 
               border: '1px solid #333', borderRadius: '6px', color: '#fff', textDecoration: 'none', 
               fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s' 
             }}
             onMouseEnter={e => { e.target.style.background = '#222'; e.target.style.borderColor = '#555'; }} 
             onMouseLeave={e => { e.target.style.background = '#111'; e.target.style.borderColor = '#333'; }}>
               Read Documentation / Guide ↗
             </a>
          ) : (
             <span style={{ 
               width: '100%', boxSizing: 'border-box', textAlign: 'center', padding: '12px 0', background: '#0a0a0a', 
               border: '1px solid #1a1a1a', borderRadius: '6px', color: '#444', fontSize: '13px', fontWeight: 'bold' 
             }}>No Guide Available</span>
          )}
        </div>

        {/* Footer Div: Close & Mark Mastered */}
        <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid #222', paddingTop: '20px' }}>
          
          <button onClick={handleClose} style={{ 
            flex: 1, padding: '12px 0', borderRadius: '6px', border: '1px solid #333', 
            background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s' 
          }}
          onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = '#666'; }} 
          onMouseLeave={e => { e.target.style.color = '#888'; e.target.style.borderColor = '#333'; }}>
            Close
          </button>

          {isMastered ? (
            <button disabled style={{ 
              flex: 1, padding: '12px 0', borderRadius: '6px', border: '1px solid #222', 
              background: '#111', color: '#555', cursor: 'not-allowed', fontSize: '13px', fontWeight: 'bold' 
            }}>
              ✓ Mastered
            </button>
          ) : isUnlockable ? (
            <button onClick={handleMarkLearned} style={{
                flex: 1, padding: '12px 0', borderRadius: '6px', border: 'none', 
                background: isMastering ? '#fff' : '#ededed', 
                boxShadow: isMastering ? '0 0 20px #fff' : 'none',
                color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', 
                transition: 'all 0.2s'
              }}>
              {isMastering ? 'SYNCHRONIZING...' : 'Mark Mastered'}
            </button>
          ) : (
            <button onClick={handleDenialClick} style={{
                flex: 1, padding: '12px 0', borderRadius: '6px', border: '1px solid #441111', background: '#1a0505', 
                color: '#ff4444', cursor: 'not-allowed', fontSize: '14px', fontWeight: 'bold'
              }}>
              Locked
            </button>
          )}

        </div>
      </div>
    </div>
  );
}