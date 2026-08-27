import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard({ userXP, onClose }) {
  const { user, profile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [viewMode, setViewMode] = useState('global'); // 'global' or 'local'

  const currentUserName = profile?.username || profile?.full_name || user?.email?.split('@')[0] || 'Guest';

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    fetchLeaderboard();
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const fetchLeaderboard = async () => {
    try {
        const localPlayers = JSON.parse(localStorage.getItem('iterarbor_local_leaderboard') || '[]');
        let allPlayers = [...localPlayers];
        
        if (user) {
          const userIndex = allPlayers.findIndex(p => p.id === user.id);
          if (userIndex > -1) {
            allPlayers[userIndex].xp = Math.max(allPlayers[userIndex].xp || 0, userXP);
            allPlayers[userIndex].isCurrentUser = true;
          } else {
            allPlayers.push({
              id: user.id, username: profile?.username, full_name: profile?.full_name,
              avatar_url: profile?.avatar_url, xp: userXP, isCurrentUser: true
            });
          }
        }
        
        allPlayers.sort((a, b) => (b.xp || 0) - (a.xp || 0));
        localStorage.setItem('iterarbor_local_leaderboard', JSON.stringify(allPlayers));
        setPlayers(allPlayers);
        
        if (user) {
          const rank = allPlayers.findIndex(p => p.id === user.id) + 1;
          setUserRank(rank);
        }
    } catch (err) {
      console.error('Unable to load local leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (p) => p.username || p.full_name || 'Anonymous User';

  const getNameColor = (tier) => {
    if (tier === 'Pro') return '#ffd700';
    if (tier === 'Unlimited') return '#4caf50';
    return '#fff';
  };

  const renderPodium = () => {
    if (players.length === 0 || viewMode === 'local') return null;
    
    const top3 = players.slice(0, 3);
    // Visual order: 2nd, 1st, 3rd to keep the #1 in the middle
    const podiumOrder = [
        { ...top3[1], displayRank: 2 },
        { ...top3[0], displayRank: 1 },
        { ...top3[2], displayRank: 3 }
    ];

    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end', 
        gap: '15px', marginBottom: '40px', marginTop: '10px', width: '100%' 
      }}>
        {podiumOrder.map((p, index) => {
          if (!p.id) return <div key={index} style={{ width: '120px' }} />;
          
          const rank = p.displayRank;
          const height = rank === 1 ? '160px' : rank === 2 ? '110px' : '80px';
          const colors = rank === 1 ? '#ffd700' : rank === 2 ? '#c0c0c0' : '#cd7f32'; 
          const avatarSize = rank === 1 ? '85px' : '65px';
          const delay = rank === 1 ? '0.1s' : rank === 2 ? '0.2s' : '0.3s';

          return (
            <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px', opacity: 0, animation: `slideUpFade 0.5s ease forwards ${delay}` }}>
              <div style={{ 
                width: avatarSize, height: avatarSize, borderRadius: '50%', background: '#222', 
                border: `3px solid ${colors}`, overflow: 'hidden', marginBottom: '12px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: `0 0 25px ${colors}30`
              }}>
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                ) : (
                  <span style={{ color: '#666', fontSize: rank === 1 ? '26px' : '20px', fontWeight: 'bold' }}>
                    {getDisplayName(p).charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <span style={{ fontWeight: 'bold', color: p.isCurrentUser ? '#4caf50' : '#fff', textAlign: 'center', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                {getDisplayName(p)}
              </span>
              <span style={{ fontFamily: 'monospace', color: '#888', fontSize: '11px', marginBottom: '15px' }}>{p.xp} XP</span>

              <div style={{ 
                width: '100%', height: height, background: `linear-gradient(to top, #111, #1a1a1a)`, 
                border: `1px solid #333`, borderTop: `3px solid ${colors}`, 
                borderTopLeftRadius: '8px', borderTopRightRadius: '8px', 
                display: 'flex', justifyContent: 'center', paddingTop: '15px',
                transformOrigin: 'bottom', animation: `growUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}`
              }}>
                <span style={{ color: colors, fontWeight: '900', fontSize: '24px', textShadow: `0 2px 10px ${colors}50` }}>{rank}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPlayerList = () => {
    let listPlayers = [];
    
    if (viewMode === 'global') {
      // Global View: Ranks 4 through 10
      listPlayers = players.slice(3, 10).map((p, i) => ({ ...p, actualRank: i + 4 }));
    } else {
      // Local View: User in the 3rd slot, 2 above, 2 below
      const userIdx = players.findIndex(p => p.id === user?.id);
      if (userIdx === -1) return <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>Log in to see local rankings.</div>;
      
      let start = Math.max(0, userIdx - 2);
      let end = start + 5;
      
      if (end > players.length) {
        end = players.length;
        start = Math.max(0, end - 5);
      }
      
      listPlayers = players.slice(start, end).map((p, i) => ({ ...p, actualRank: start + i + 1 }));
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {listPlayers.map((p, i) => (
          <div key={p.id} style={{ 
            display: 'flex', justifyContent: 'space-between', padding: '16px 24px', 
            background: p.isCurrentUser ? 'rgba(76,175,80,0.1)' : '#0a0a0a', 
            border: p.isCurrentUser ? '1px solid #4caf50' : '1px solid #1a1a1a', 
            borderRadius: '10px', opacity: 0, animation: `slideUpFade 0.4s ease forwards ${0.4 + (i * 0.05)}s`
          }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <span style={{ color: p.isCurrentUser ? '#4caf50' : '#666', fontWeight: '900', width: '24px', fontSize: '16px' }}>{p.actualRank}</span>
              
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#222', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                 {p.avatar_url ? (
                   <img src={p.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <span style={{ color: '#666', fontSize: '14px', fontWeight: 'bold' }}>{getDisplayName(p).charAt(0).toUpperCase()}</span>
                 )}
              </div>

              <span style={{ fontWeight: '600', color: p.isCurrentUser ? '#4caf50' : '#ededed', fontSize: '16px' }}>
                {getDisplayName(p)} {p.isCurrentUser && '(You)'}
              </span>
            </div>
            <span style={{ fontFamily: 'monospace', color: p.isCurrentUser ? '#4caf50' : '#888', fontSize: '15px', display: 'flex', alignItems: 'center' }}>{p.xp} XP</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: mounted && !isClosing ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000,
      transition: 'all 0.4s ease', backdropFilter: mounted && !isClosing ? 'blur(8px)' : 'blur(0px)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif', padding: '20px', boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes scaleUp { 0% { opacity: 0; transform: scale(0.95) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes scaleDown { 0% { opacity: 1; transform: scale(1) translateY(0); } 100% { opacity: 0; transform: scale(0.95) translateY(20px); } }
        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes growUp { 0% { transform: scaleY(0); } 100% { transform: scaleY(1); } }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .tab-btn { background: transparent; border: none; color: #666; font-weight: bold; cursor: pointer; padding: 10px 20px; transition: all 0.2s; border-bottom: 2px solid transparent; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .tab-btn.active { color: #fff; border-bottom: 2px solid #fff; }
      `}</style>
      
      <div style={{
        background: '#050505', width: '100%', maxWidth: '700px', maxHeight: '90vh',
        borderRadius: '16px', border: '1px solid #222', display: 'flex', flexDirection: 'column',
        animation: isClosing ? 'scaleDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)', overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '30px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>Rankings</h2>
            <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Telemetry from the Kinetree network.</p>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '32px', cursor: 'pointer', transition: 'color 0.2s' }}>×</button>
        </div>

        {/* View Toggles */}
        <div style={{ display: 'flex', background: '#0a0a0a', padding: '0 30px', gap: '10px' }}>
          <button className={`tab-btn ${viewMode === 'global' ? 'active' : ''}`} onClick={() => setViewMode('global')}>Global Top 10</button>
          <button className={`tab-btn ${viewMode === 'local' ? 'active' : ''}`} onClick={() => setViewMode('local')}>Rank Near Me</button>
        </div>

        {/* Content */}
        <div className="scroll-hide" style={{ flex: 1, overflowY: 'auto', padding: '30px', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px 0', fontWeight: 'bold' }}>Syncing telemetry...</div>
          ) : (
            <>
              {renderPodium()}
              {renderPlayerList()}
            </>
          )}
        </div>

        {/* User Stats Bottom Bar */}
        <div style={{ padding: '20px 30px', background: '#111', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <span style={{ color: '#4caf50', fontWeight: '900', fontSize: '16px' }}>#{userRank || '-'}</span>
              <span style={{ fontWeight: '900', color: '#fff' }}>{currentUserName}</span>
           </div>
           <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#888', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Accrued</span>
              <span style={{ fontFamily: 'monospace', color: '#4caf50', fontWeight: 'bold', fontSize: '18px' }}>{userXP} XP</span>
           </div>
        </div>
      </div>
    </div>
  );
}