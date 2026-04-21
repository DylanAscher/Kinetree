import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Pricing({ onClose, onOpenLogin, onUpgrade }) {
  // Pulling profile to check the user's current tier (assuming it's stored in profile.tier)
  const { user, profile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Defaulting to 'Free' if no tier is found on the profile
  const userTier = profile?.tier || 'Free'; 

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleCheckout = (tier) => {
    if (!user || user.id === 'guest') {
      handleClose();
      setTimeout(() => onOpenLogin("Create an account to lock in your upgrade."), 350);
    } else {
      // Mock successful purchase for testing
      alert(`Mock Checkout Successful! You have unlocked the ${tier} tier.`);
      if (onUpgrade) onUpgrade(tier);
      handleClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: mounted && !isClosing ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000,
      transition: 'background-color 0.3s ease', backdropFilter: mounted && !isClosing ? 'blur(8px)' : 'blur(0px)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
      padding: '20px', boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(40px); } }
        
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .pricing-card {
          background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 40px 30px;
          display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .pricing-card:hover { transform: translateY(-8px); border-color: #555; }
        
        .pricing-pro { border-color: #4caf50; box-shadow: 0 10px 40px rgba(76, 175, 80, 0.1); }
        .pricing-pro:hover { border-color: #4caf50; box-shadow: 0 20px 50px rgba(76, 175, 80, 0.2); }
        
        .feature-check { color: #4caf50; font-weight: bold; margin-right: 10px; }
        .feature-x { color: #ff4444; font-weight: bold; margin-right: 10px; opacity: 0.5; }

        @media (max-width: 900px) {
          .pricing-grid { grid-template-columns: 1fr; max-height: 60vh; overflow-y: auto; padding-right: 10px; }
        }
      `}</style>
      
      <div style={{
        background: '#050505', padding: '50px', borderRadius: '16px', border: '1px solid #222',
        width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column',
        color: '#fff', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.9)',
        animation: isClosing ? 'slideDown 0.3s ease-in forwards' : 'slideUp 0.4s ease-out forwards'
      }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '36px', fontWeight: '900', letterSpacing: '-1px' }}>System Access Tiers</h2>
            <p style={{ color: '#888', margin: 0, fontSize: '16px' }}>Choose how deep you want to go.</p>
          </div>
          <button onClick={handleClose} style={{
            background: 'transparent', color: '#888', border: 'none', fontSize: '32px', cursor: 'pointer', transition: 'color 0.2s', lineHeight: 1
          }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#888'}>×</button>
        </div>

        {/* PRICING GRID */}
        <div className="pricing-grid">
          
          {/* TIER 1: FREE */}
          <div className="pricing-card">
            <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: 'bold' }}>Free</h3>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '25px' }}>$0 <span style={{ fontSize: '16px', color: '#666', fontWeight: 'normal' }}>/ mo</span></div>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.5', marginBottom: '30px', minHeight: '42px' }}>
              Just enough compute to realize you've been learning wrong your whole life.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px', flexGrow: 1, fontSize: '14px', color: '#ccc' }}>
              <div><span className="feature-check">✓</span> Limit 3 Skill Trees</div>
              <div><span className="feature-check">✓</span> Base AI Generation</div>
              <div><span className="feature-check">✓</span> Global Leaderboard</div>
              <div style={{ color: '#666' }}><span className="feature-x">×</span> Branch Expansion Locked</div>
              <div style={{ color: '#666' }}><span className="feature-x">×</span> Single-Tier Progression</div>
            </div>
            {userTier === 'Free' ? (
              <button onClick={handleClose} style={{
                width: '100%', padding: '14px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
              }} onMouseEnter={e => e.target.style.background = '#222'} onMouseLeave={e => e.target.style.background = '#111'}>
                Current Plan
              </button>
            ) : (
              <button style={{
                width: '100%', padding: '14px', background: 'transparent', color: '#666', border: '1px solid #333', borderRadius: '8px', fontWeight: 'bold', cursor: 'default'
              }}>
                Included
              </button>
            )}
          </div>

          {/* TIER 2: PRO */}
          <div className="pricing-card">
            <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: 'bold' }}>Pro</h3>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '25px' }}>$4.99 <span style={{ fontSize: '16px', color: '#666', fontWeight: 'normal' }}>/ mo</span></div>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.5', marginBottom: '30px', minHeight: '42px' }}>
              For those actually trying to escape tutorial hell and build something.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px', flexGrow: 1, fontSize: '14px', color: '#ccc' }}>
              <div><span className="feature-check">✓</span> Limit 15 Skill Trees</div>
              <div><span className="feature-check">✓</span> <b>Dynamic Branch Expansion</b></div>
              <div><span className="feature-check">✓</span> Priority API Queue</div>
              <div><span className="feature-check">✓</span> Global Leaderboard</div>
              <div style={{ color: '#666' }}><span className="feature-x">×</span> Full Progression Trees Locked</div>
            </div>
            {userTier === 'Pro' ? (
              <button onClick={handleClose} style={{
                width: '100%', padding: '14px', background: '#111', color: '#4caf50', border: '1px solid #333', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                Current Plan
              </button>
            ) : (
              <button onClick={() => handleCheckout('Pro')} style={{
                width: '100%', padding: '14px', background: '#ededed', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s'
              }} onMouseEnter={e => e.target.style.opacity = '0.8'} onMouseLeave={e => e.target.style.opacity = '1'}>
                {userTier === 'Unlimited' ? 'Downgrade to Pro' : 'Upgrade to Pro'}
              </button>
            )}
          </div>

          {/* TIER 3: UNLIMITED */}
          <div className="pricing-card pricing-pro">
            <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: 'bold', color: '#4caf50' }}>Unlimited</h3>
            <div style={{ fontSize: '36px', fontWeight: '900', marginBottom: '25px' }}>$9.99 <span style={{ fontSize: '16px', color: '#666', fontWeight: 'normal' }}>/ mo</span></div>
            <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.5', marginBottom: '30px', minHeight: '42px' }}>
              Unrestricted access to the entire sum of human knowledge, mapped perfectly.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px', flexGrow: 1, fontSize: '14px', color: '#ccc' }}>
              <div><span className="feature-check">✓</span> <b>Unlimited Skill Trees</b></div>
              <div><span className="feature-check">✓</span> <b>Full Progression Mode</b></div>
              <div style={{ color: '#888', fontSize: '12px', marginLeft: '22px', marginTop: '-8px', marginBottom: '4px' }}>Generates Beginner → Intermediate → Advanced in one tree</div>
              <div><span className="feature-check">✓</span> Dynamic Branch Expansion</div>
              <div><span className="feature-check">✓</span> Maximum API Priority</div>
            </div>
            {userTier === 'Unlimited' ? (
              <button onClick={handleClose} style={{
                width: '100%', padding: '14px', background: '#111', color: '#4caf50', border: '1px solid #333', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                Current Plan
              </button>
            ) : (
              <button onClick={() => handleCheckout('Unlimited')} style={{
                width: '100%', padding: '14px', background: 'linear-gradient(45deg, #4caf50, #2e7d32)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s'
              }} onMouseEnter={e => e.target.style.transform = 'scale(1.02)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                Unlock Unlimited
              </button>
            )}
          </div>

        </div>

        {/* FINE PRINT */}
        <div style={{ textAlign: 'center', borderTop: '1px solid #222', paddingTop: '20px' }}>
          <p style={{ fontSize: '12px', color: '#444', fontFamily: 'monospace', margin: 0 }}>
            Are you broke? Email dylanascher2845@gmail.com with a blurb about why you want Kinetree. I read all of them. I'll consider your pleas.
          </p>
        </div>
      </div>
    </div>
  );
}