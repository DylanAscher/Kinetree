import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export default function XpModal({ savedTrees, userXP, onClose }) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = user ? user.email.split('@')[0] : 'GUEST_USER';

  // Calculate XP breakdown from trees
  const xpBreakdown = savedTrees.map(tree => {
    const masteredCount = tree.nodes.filter(n => n.data?.status === 'mastered').length;
    return { topic: tree.topic, xp: masteredCount * 50 };
  }).filter(t => t.xp > 0).sort((a, b) => b.xp - a.xp);

  // Generate Mock Leaderboard
  const baseLeaderboard = [
    { name: 'A.Turing', xp: 12450 },
    { name: 'M.Hamilton', xp: 8900 },
    { name: 'C.Babbage', xp: 5200 },
    { name: 'A.Lovelace', xp: 2150 },
    { name: 'R.Hopper', xp: 850 }
  ];
  
  const leaderboard = [...baseLeaderboard, { name: `${userName} (YOU)`, xp: userXP }]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 6); // Keep top 6

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: mounted ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0)',
      backdropFilter: mounted ? 'blur(2px)' : 'blur(0px)',
      transition: 'all 0.3s ease',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#0a0a0a', padding: '35px', borderRadius: '6px',
        width: '450px', maxWidth: '90%', color: '#ededed',
        border: '1px solid #333',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(0.95)',
        transition: 'all 0.3s ease',
        position: 'relative'
      }}>
        
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', background: 'transparent',
          border: 'none', color: '#666', fontSize: '16px', cursor: 'pointer'
        }}>✕</button>

        <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '500', letterSpacing: '-0.5px' }}>
          Telemetry Data
        </h2>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '25px', fontFamily: 'monospace' }}>
          XP Distribution and Rankings
        </p>

        {/* Global XP Header */}
        <div style={{ background: '#111', border: '1px solid #333', padding: '15px', borderRadius: '4px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#a3a3a3', fontFamily: 'monospace' }}>TOTAL_XP</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ededed', fontFamily: 'monospace' }}>{userXP}</span>
        </div>

        {/* Breakdown Section */}
        <h3 style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace', marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '5px' }}>
          [Source Breakdown]
        </h3>
        <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '25px', paddingRight: '5px' }}>
          {xpBreakdown.length === 0 ? (
            <p style={{ color: '#555', fontSize: '13px', fontFamily: 'monospace' }}>No skill nodes mastered yet.</p>
          ) : (
            xpBreakdown.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#a3a3a3' }}>
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>{item.topic}</span>
                <span style={{ fontFamily: 'monospace', color: '#ededed' }}>+{item.xp}</span>
              </div>
            ))
          )}
        </div>

        {/* Leaderboard Section */}
        <h3 style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace', marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '5px' }}>
          [Global Leaderboard]
        </h3>
        <div>
          {leaderboard.map((entry, index) => {
            const isUser = entry.name.includes('(YOU)');
            return (
              <div key={index} style={{ 
                display: 'flex', justifyContent: 'space-between', padding: '8px 10px', 
                fontSize: '14px', fontFamily: 'monospace',
                background: isUser ? '#1a1a1a' : 'transparent',
                borderLeft: isUser ? '2px solid #ededed' : '2px solid transparent',
                color: isUser ? '#ededed' : '#888'
              }}>
                <span>{index + 1}. {entry.name}</span>
                <span>{entry.xp.toLocaleString()}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}