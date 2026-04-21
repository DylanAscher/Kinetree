import React, { useEffect, useState } from 'react';
import { useAuth, supabase } from '../context/AuthContext';

export default function Leaderboard({ userXP, onClose }) {
  const { user, profile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  const currentUserName = profile?.username || profile?.full_name || user?.email?.split('@')[0] || 'Guest';

  useEffect(() => {
    setMounted(true);
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, xp');

      if (error) throw error;

      if (data) {
        let allPlayers = [...data];
        
        // Optimistic Update: Ensure the current user's latest XP is injected before sorting
        if (user) {
          const userIndex = allPlayers.findIndex(p => p.id === user.id);
          if (userIndex > -1) {
            allPlayers[userIndex].xp = Math.max(allPlayers[userIndex].xp || 0, userXP);
            allPlayers[userIndex].isCurrentUser = true;
          } else {
            allPlayers.push({
              id: user.id,
              username: profile?.username,
              full_name: profile?.full_name,
              xp: userXP,
              isCurrentUser: true
            });
          }
        }

        allPlayers.sort((a, b) => b.xp - a.xp);
        
        setPlayers(allPlayers.slice(0, 10)); // Top 10
        
        if (user) {
          const rank = allPlayers.findIndex(p => p.id === user.id) + 1;
          setUserRank(rank > 0 ? rank : 'Unranked');
        }
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const getDisplayName = (p) => p.username || p.full_name || (p.isCurrentUser ? currentUserName : `Player_${p.id.substring(0, 4)}`);

  const top1 = players[0] || { id: '1', xp: 0 };
  const top2 = players[1] || { id: '2', xp: 0 };
  const top3 = players[2] || { id: '3', xp: 0 };
  const rest = players.slice(3);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: mounted && !isClosing ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000,
      transition: 'background-color 0.3s ease', backdropFilter: mounted && !isClosing ? 'blur(8px)' : 'blur(0px)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif'
    }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(40px); } }
        
        /* The 'both' keyword prevents the split-second flash before the delay starts */
        @keyframes popIn { 
          0% { opacity: 0; transform: translateY(20px); } 
          100% { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
      
      <div style={{
        background: '#050505', padding: '40px', borderRadius: '16px', border: '1px solid #222',
        width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        color: '#fff', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.9)',
        animation: isClosing ? 'slideDown 0.3s ease-in forwards' : 'slideUp 0.4s ease-out forwards'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>Global Rankings</h2>
          <button onClick={handleClose} style={{
            background: 'transparent', color: '#888', border: 'none', fontSize: '24px', cursor: 'pointer', transition: 'color 0.2s'
          }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#888'}>×</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '50px 0', fontFamily: 'monospace' }}>Fetching telemetry...</div>
        ) : (
          <>
            {/* THE PODIUM */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '15px', marginBottom: '40px', height: '220px' }}>
              
              {/* 2nd Place */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', animation: 'popIn 0.5s ease-out 0.2s both' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#aaa', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>{getDisplayName(top2)}</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontFamily: 'monospace' }}>{top2.xp} XP</div>
                <div style={{ width: '100%', height: '120px', background: 'linear-gradient(to bottom, #222, #0a0a0a)', borderTop: '4px solid #c0c0c0', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '15px', fontSize: '24px', fontWeight: '900', color: '#c0c0c0' }}>2</div>
              </div>

              {/* 1st Place */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px', animation: 'popIn 0.5s ease-out 0s both' }}>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#ffd700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>{getDisplayName(top1)}</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontFamily: 'monospace' }}>{top1.xp} XP</div>
                <div style={{ width: '100%', height: '160px', background: 'linear-gradient(to bottom, #222, #0a0a0a)', borderTop: '4px solid #ffd700', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '15px', fontSize: '32px', fontWeight: '900', color: '#ffd700', boxShadow: '0 0 30px rgba(255, 215, 0, 0.1)' }}>1</div>
              </div>

              {/* 3rd Place */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', animation: 'popIn 0.5s ease-out 0.4s both' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a67d3d', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>{getDisplayName(top3)}</div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontFamily: 'monospace' }}>{top3.xp} XP</div>
                <div style={{ width: '100%', height: '90px', background: 'linear-gradient(to bottom, #222, #0a0a0a)', borderTop: '4px solid #cd7f32', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '10px', fontSize: '20px', fontWeight: '900', color: '#cd7f32' }}>3</div>
              </div>

            </div>

            {/* REST OF THE PACK (4-10) */}
            <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '10px', marginBottom: '20px' }}>
              {rest.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ color: '#666', fontWeight: 'bold', width: '20px' }}>{i + 4}</span>
                    <span style={{ fontWeight: '600', color: p.isCurrentUser ? '#4caf50' : '#ededed' }}>
                      {getDisplayName(p)} {p.isCurrentUser && '(You)'}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'monospace', color: '#888' }}>{p.xp} XP</span>
                </div>
              ))}
            </div>

            {/* CURRENT USER ANCHOR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#111', border: '1px solid #333', borderRadius: '8px', marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ color: '#4caf50', fontWeight: 'bold', width: '20px' }}>{userRank || '-'}</span>
                <span style={{ fontWeight: '900', color: '#fff' }}>{currentUserName} (You)</span>
              </div>
              <span style={{ fontFamily: 'monospace', color: '#4caf50', fontWeight: 'bold' }}>{userXP} XP</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}