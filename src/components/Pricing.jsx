import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Pricing({ onClose, onOpenLogin, onUpgrade }) {
  const { user, profile, setProfile, updateProfile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const userTier = profile?.tier || 'Free'; 

  // Helper to determine rank for unlocking logic
  const tierRank = { 'Free': 1, 'Pro': 2, 'Unlimited': 3 };
  const currentRank = tierRank[userTier] || 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleCheckout = async (tier) => {
    if (!user || user.id === 'guest') {
      handleClose();
      setTimeout(() => onOpenLogin("Create an account to lock in your upgrade."), 350);
    } else {
      try {
        if (setProfile) setProfile({ ...profile, tier });
        await updateProfile({ tier });

        alert(`Mock Checkout Successful! You have unlocked the ${tier} tier.`);
        if (onUpgrade) onUpgrade(tier);
        handleClose();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderButton = (tierName, buttonText) => {
    const thisRank = tierRank[tierName];
    
    if (currentRank > thisRank) {
      // Surpassed tier
      return (
        <button disabled style={{
          width: '100%', padding: '12px', background: 'transparent', color: '#666', border: '1px solid #333', borderRadius: '8px', fontWeight: 'bold', cursor: 'default'
        }}>
          Unlocked!
        </button>
      );
    } else if (currentRank === thisRank) {
      // Current tier
      return (
        <button onClick={handleClose} style={{
          width: '100%', padding: '12px', background: '#111', color: '#4caf50', border: '1px solid #333', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
        }}>
          Current Plan
        </button>
      );
    } else {
      // Upgrade tier
      const isUnlimited = tierName === 'Unlimited';
      return (
        <button onClick={() => handleCheckout(tierName)} style={{
          width: '100%', padding: '12px', 
          background: isUnlimited ? 'linear-gradient(45deg, #4caf50, #2e7d32)' : '#ededed', 
          color: isUnlimited ? '#fff' : '#000', 
          border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s'
        }} onMouseEnter={e => {
            if (isUnlimited) e.target.style.transform = 'scale(1.02)';
            else e.target.style.opacity = '0.8';
        }} onMouseLeave={e => {
            if (isUnlimited) e.target.style.transform = 'scale(1)';
            else e.target.style.opacity = '1';
        }}>
          {buttonText}
        </button>
      );
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: mounted && !isClosing ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000,
      transition: 'background-color 0.3s ease', backdropFilter: mounted && !isClosing ? 'blur(8px)' : 'blur(0px)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
      padding: '20px', boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(40px); } }
        
        /* Adjusted Grid & Card Sizing */
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .pricing-card { background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 30px 20px; display: flex; flex-direction: column; transition: transform 0.3s ease, border-color 0.3s ease; }
        .pricing-card:hover { transform: translateY(-6px); border-color: #555; }
        .pricing-pro { border-color: #ffd700; box-shadow: 0 10px 40px rgba(255, 215, 0, 0.08); }
        .pricing-pro:hover { border-color: #ffd700; box-shadow: 0 20px 50px rgba(255, 215, 0, 0.15); }
        .pricing-unlim { border-color: #4caf50; box-shadow: 0 10px 40px rgba(76, 175, 80, 0.08); }
        .pricing-unlim:hover { border-color: #4caf50; box-shadow: 0 20px 50px rgba(76, 175, 80, 0.15); }
        .feature-check { color: #4caf50; font-weight: bold; margin-right: 8px; }
        .feature-x { color: #ff4444; font-weight: bold; margin-right: 8px; opacity: 0.5; }
        @media (max-width: 900px) { .pricing-grid { grid-template-columns: 1fr; max-height: 65vh; overflow-y: auto; padding-right: 10px; } }
      `}</style>
      
      <div style={{
        background: '#050505', padding: '35px', borderRadius: '16px', border: '1px solid #222',
        width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', /* Scaled down maxWidth from 1100px */
        color: '#fff', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.9)',
        animation: isClosing ? 'slideDown 0.3s ease-in forwards' : 'slideUp 0.4s ease-out forwards'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>System Access Tiers</h2>
            <p style={{ color: '#888', margin: 0, fontSize: '15px' }}>Choose how deep you want to go.</p>
          </div>
          <button onClick={handleClose} style={{ background: 'transparent', color: '#888', border: 'none', fontSize: '28px', cursor: 'pointer', transition: 'color 0.2s', lineHeight: 1 }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#888'}>×</button>
        </div>

        <div className="pricing-grid">
          {/* TIER 1: FREE */}
          <div className="pricing-card">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold' }}>Free</h3>
            <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>$0 <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>/ mo</span></div>
            <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.5', marginBottom: '25px', minHeight: '40px' }}>
              Just enough information to realize you've been learning wrong your whole life.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', flexGrow: 1, fontSize: '13px', color: '#ccc' }}>
              <div><span className="feature-check">✓</span> Limit 3 Skill Trees</div>
              <div><span className="feature-check">✓</span> Base AI Generation</div>
              <div><span className="feature-check">✓</span> Global Leaderboard</div>
              <div style={{ color: '#666' }}><span className="feature-x">×</span> Branch Expansion Locked</div>
            </div>
            {renderButton('Free', 'Select Free')}
          </div>

          {/* TIER 2: PRO */}
          <div className="pricing-card pricing-pro">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: '#ffd700' }}>Pro</h3>
            <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>$4.99 <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>/ mo</span></div>
            <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.5', marginBottom: '25px', minHeight: '40px' }}>
              For those actually trying to escape tutorial hell and build something.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', flexGrow: 1, fontSize: '13px', color: '#ccc' }}>
              <div><span className="feature-check">✓</span> Limit 15 Skill Trees</div>
              <div><span className="feature-check">✓</span> <b>Dynamic Branch Expansion</b></div>
              <div><span className="feature-check">✓</span> Priority API Queue</div>
              <div><span className="feature-check">✓</span> Golden Name to Flex</div>
            </div>
            {renderButton('Pro', 'Upgrade to Pro')}
          </div>

          {/* TIER 3: UNLIMITED */}
          <div className="pricing-card pricing-unlim">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>Unlimited</h3>
            <div style={{ fontSize: '28px', fontWeight: '900', marginBottom: '20px' }}>$9.99 <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>/ mo</span></div>
            <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.5', marginBottom: '25px', minHeight: '40px' }}>
              Unrestricted access to the entire sum of human knowledge, mapped perfectly.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', flexGrow: 1, fontSize: '13px', color: '#ccc' }}>
              <div><span className="feature-check">✓</span> <b>Unlimited Skill Trees</b></div>
              <div><span className="feature-check">✓</span> Dynamic Branch Expansion</div>
              <div><span className="feature-check">✓</span> Maximum API Priority</div>
              <div><span className="feature-check">✓</span> Green Name to Flex</div>
            </div>
            {renderButton('Unlimited', 'Unlock Unlimited')}
          </div>
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid #222', paddingTop: '15px' }}>
          <p style={{ fontSize: '11px', color: '#444', fontFamily: 'monospace', margin: 0 }}>
            Are you broke? Email dylanascher2845@gmail.com with a blurb about why you want Kinetree. I read all of them. I'll consider your pleas.
          </p>
        </div>
      </div>
    </div>
  );
}