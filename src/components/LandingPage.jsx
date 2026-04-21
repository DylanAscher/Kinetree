import React, { useState, useEffect } from 'react';

const previewThemes = [
  [
    { topic: "Python Syntax", diff: "Beginner" },
    { topic: "Data Structures", diff: "Beginner" },
    { topic: "Object Oriented", diff: "Intermediate" },
    { topic: "Web Scraping", diff: "Intermediate" },
    { topic: "REST APIs", diff: "Advanced" },
    { topic: "Async / Await", diff: "Advanced" },
    { topic: "Metaprogramming", diff: "Expert" },
    { topic: "Machine Learning", diff: "Expert" }
  ],
  [
    { topic: "FL Studio Basics", diff: "Beginner" },
    { topic: "Pattern Sequencing", diff: "Beginner" },
    { topic: "Mixer Routing", diff: "Intermediate" },
    { topic: "Sound Design", diff: "Intermediate" },
    { topic: "Vocal Processing", diff: "Advanced" },
    { topic: "Mastering Chain", diff: "Advanced" },
    { topic: "FM Synthesis", diff: "Expert" },
    { topic: "Live Performance", diff: "Expert" }
  ],
  [
    { topic: "Culinary Arts", diff: "Beginner" },
    { topic: "Knife Skills", diff: "Beginner" },
    { topic: "Heat Management", diff: "Intermediate" },
    { topic: "Mother Sauces", diff: "Intermediate" },
    { topic: "Flavor Profiling", diff: "Advanced" },
    { topic: "Emulsions", diff: "Advanced" },
    { topic: "Molecular Gastronomy", diff: "Expert" },
    { topic: "Menu Architecture", diff: "Expert" }
  ]
];

const footerMessages = [
  "© 2026 KINETREE. WE FED THE AI COFFEE AND IT BUILT THIS.",
  "© 2026 KINETREE. PLEASE DON'T SUE US, GOOGLE.",
  "© 2026 KINETREE. WE MADE THIS IN A MONSTER ENERGY FUELED RAMPAGE.",
  "© 2026 KINETREE. ALL RIGHTS RESERVED, INCLUDING THE RIGHT TO COMPLAIN ABOUT THIS COPYRIGHT NOTICE.",
  "© 2026 KINETREE. THIS PRODUCT IS PROTECTED BY INTERNATIONAL COPYRIGHT LAWS AND WE'RE TOO LAZY TO ENFORCE THEM.",
  "© 2026 KINETREE. how to use react to make an ai skill tree si oh shit this isnt google my bad",
  "© 2026 KINETREE. If you're seeing this, listen to Since I Left You by The Avalances. Great Album.",
  "© 2026 KINETREE. WANT TO SUPPORT US? UPGRADE YOUR ACCOUNT. DON'T WANT TO SUPPORT US? ...YOU'RE THE ONE ON OUR SITE."
];

const promptRow1 = ["Python", "Photography", "Quantum Physics", "Linear Algebra", "FL Studio", "Touch Typing", "Sourdough Bread", "Machine Learning"];
const promptRow2 = ["How to talk to people", "Tax Fraud (Just Kidding)", "Making a Good Cup of Coffee", "Existential Dread Mitigation", "C++ Pointers", "Video Editing"];

const styles = {
  navButton: {
    background: '#fff', color: '#000', border: 'none', padding: '10px 25px', 
    borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px',
    transition: 'transform 0.2s',
  },
  ctaButtonPrimary: {
    padding: '18px 35px', background: '#fff', color: '#000', border: '1px solid transparent', 
    borderRadius: '8px', fontWeight: '900', fontSize: '18px', cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    boxShadow: '0 10px 30px rgba(255,255,255,0.1)', transition: 'all 0.2s',
    boxSizing: 'border-box'
  },
  ctaButtonSecondary: {
    padding: '18px 35px', background: 'rgba(255,255,255,0.05)', color: '#fff', 
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px',
    cursor: 'pointer', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
    transition: 'all 0.2s', boxSizing: 'border-box'
  }
};

const StaticNode = ({ topic, difficulty, locked, isMastered, style, delay = 0, floatDelay = 0, isClickable = false }) => {
  const borderColor = isMastered ? '#ededed' : (locked ? '#333' : '#555');
  const bgColor = isMastered ? '#111' : '#0a0a0a';
  const shadow = isMastered ? '0 0 15px rgba(255,255,255,0.05)' : (locked ? 'none' : '0 10px 30px rgba(0,0,0,0.5)');
  const textColor = isMastered ? '#fff' : (locked ? '#888' : '#fff');
  const badgeBorder = isMastered ? '#555' : '#333';
  const badgeColor = isMastered ? '#ededed' : '#666';

  return (
    <div className={isClickable ? 'demo-clickable-node' : ''} style={{
        position: 'absolute', background: bgColor, border: `1px solid ${borderColor}`,
        borderRadius: '8px', padding: '15px', width: '200px', height: '100px',
        boxShadow: shadow, zIndex: 2, boxSizing: 'border-box', pointerEvents: 'none',
        opacity: locked ? 0.85 : 1, 
        animation: `nodeEntry 0.5s ease-out ${delay}s forwards, floatNode 6s ease-in-out ${floatDelay}s infinite`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', ...style
      }}>
      <div className={isClickable ? 'demo-text-title' : ''} style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', color: textColor, transition: 'all 0.2s' }}>
        {topic}
      </div>
      <div className={isClickable ? 'demo-text-badge' : ''} style={{ 
        display: 'inline-block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase',
        color: badgeColor, border: `1px solid ${badgeBorder}`, padding: '3px 8px', borderRadius: '4px', 
        background: 'transparent', alignSelf: 'flex-start', transition: 'all 0.2s'
      }}>
        {difficulty}
      </div>
    </div>
  );
};

// Flowing connection line with absolutely NO unlock animations
const FlowingConnection = ({ d, speed = '1.5s', delay = 0 }) => (
  <g style={{ animation: `nodeEntry 0.5s ease-out ${delay}s forwards`, opacity: 0 }}>
    <path d={d} fill="transparent" stroke="#333" strokeWidth="2" />
    <path d={d} fill="transparent" stroke="#ededed" strokeWidth="2.5" strokeDasharray="8 15"
      style={{ animation: `flowData ${speed} linear infinite`, opacity: 0.2 }} />
  </g>
);

export default function LandingPage({ onOpenLogin, onOpenPricing }) {
  const [theme, setTheme] = useState(previewThemes[0]);
  const [footerText, setFooterText] = useState(footerMessages[0]);

  useEffect(() => {
    setTheme(previewThemes[Math.floor(Math.random() * previewThemes.length)]);
    setFooterText(footerMessages[Math.floor(Math.random() * footerMessages.length)]);
  }, []);

  return (
    <div style={{ width: '100%', minHeight: '100vh', color: '#fff', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
      <style>{`
        @keyframes nodeEntry { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes floatNode { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes flowData { from { stroke-dashoffset: 46; } to { stroke-dashoffset: 0; } }
        @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes scrollRight { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        @keyframes popIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        
        @keyframes swoopAndClick {
          0% { transform: translate(900px, 450px); opacity: 0; } 
          10% { transform: translate(600px, 300px); opacity: 1; }
          30% { transform: translate(400px, 145px); scale: 1; } 
          35% { transform: translate(400px, 145px) scale(0.85); }
          40% { transform: translate(400px, 145px) scale(1); } 
          60% { transform: translate(650px, 200px); opacity: 1; } 
          80%, 100% { transform: translate(900px, 500px); opacity: 0; } 
        }

        @keyframes masterNodeBody {
          0%, 34% { background: #0a0a0a; border-color: #555; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          35% { background: #fff; border-color: #fff; box-shadow: 0 0 50px rgba(255,255,255,0.8); }
          40%, 100% { background: #111; border-color: #ededed; box-shadow: 0 0 20px rgba(255,255,255,0.05); }
        }
        @keyframes masterNodeText { 
          0%, 34% { color: #fff; } 
          35% { color: #000; } 
          40%, 100% { color: #fff; } 
        }
        @keyframes masterNodeBadge {
          0%, 34% { color: #666; border-color: #333; } 
          35% { color: #000; border-color: #000; }
          40%, 100% { color: #ededed; border-color: #555; }
        }

        .demo-clickable-node { animation: nodeEntry 0.5s ease-out 0.3s forwards, floatNode 6s ease-in-out 1s infinite, masterNodeBody 8s infinite !important; }
        .demo-text-title { animation: masterNodeText 8s infinite; }
        .demo-text-badge { animation: masterNodeBadge 8s infinite; }

        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          border-color: #444 !important;
        }

        .chip { display: inline-block; padding: 12px 24px; margin: 0 10px; background: rgba(17, 17, 17, 0.8); border: 1px solid #333; border-radius: 50px; font-weight: 500; font-size: 16px; color: #aaa; backdrop-filter: blur(5px); }
      `}</style>

      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 50px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '1px' }}>KINETREE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <button onClick={() => onOpenPricing()} style={{ background: 'transparent', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#aaa'} onMouseLeave={e => e.target.style.color = '#fff'}>
            Pricing
          </button>
          <button onClick={() => onOpenLogin()} style={styles.navButton} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
            Log In / Sign Up
          </button>
        </div>
      </nav>

      <section style={{ textAlign: 'center', padding: '30px 20px 60px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: '900', lineHeight: '1.1', marginBottom: '25px', letterSpacing: '-2px' }}>
          <span style={{ color: '#888' }}>Stop doomscrolling.</span> <br/><span style={{ color: '#888' }}>Learn something.</span>
        </h1>
        <p style={{ fontSize: '20px', color: '#888', marginBottom: '40px', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto 40px auto' }}>
          You don't know what you don't know. We force an AI to map human knowledge into a skill tree so you can stop guessing and start actually learning.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '40px' }}>
          <button onClick={() => onOpenLogin()} style={styles.ctaButtonPrimary} onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
            Get Started for Free
          </button>
          <button 
            onClick={() => onOpenPricing()} 
            style={styles.ctaButtonSecondary} 
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)'; 
              e.target.style.borderColor = 'rgba(255,255,255,0.2)';
            }} 
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.05)'; 
              e.target.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            View Pricing
          </button>
        </div>
      </section>

      {/* ANIMATED PREVIEW CANVAS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 50px', marginBottom: '120px' }}>
        <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', height: '500px', position: 'relative', overflow: 'hidden', boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
            <FlowingConnection d="M 240 250 C 280 250, 280 130, 320 130" speed="2s" delay={0.2} />
            <FlowingConnection d="M 240 250 C 280 250, 280 370, 320 370" speed="2.5s" delay={0.3} />
            
            <FlowingConnection d="M 520 130 C 560 130, 560 130, 600 130" speed="1.5s" delay={0.5} />
            <FlowingConnection d="M 520 130 C 560 130, 560 250, 600 250" speed="2s" delay={0.6} />

            <FlowingConnection d="M 520 370 C 560 370, 560 250, 600 250" speed="2.2s" delay={0.7} />
            <FlowingConnection d="M 520 370 C 560 370, 560 370, 600 370" speed="3s" delay={0.8} />
            
            <FlowingConnection d="M 800 130 C 840 130, 840 190, 880 190" speed="1.8s" delay={0.9} />
            <FlowingConnection d="M 800 250 C 840 250, 840 190, 880 190" speed="2.3s" delay={1.0} />
            <FlowingConnection d="M 800 250 C 840 250, 840 310, 880 310" speed="2.1s" delay={1.1} />
            <FlowingConnection d="M 800 370 C 840 370, 840 310, 880 310" speed="2.6s" delay={1.2} />
          </svg>
          
          <StaticNode topic={theme[0].topic} difficulty={theme[0].diff} isMastered={true} style={{ top: '200px', left: '40px' }} delay={0.1} floatDelay={0} />
          
          <StaticNode topic={theme[1].topic} difficulty={theme[1].diff} isClickable={true} style={{ top: '80px', left: '320px' }} delay={0.3} floatDelay={1} />
          <StaticNode topic={theme[2].topic} difficulty={theme[2].diff} style={{ top: '320px', left: '320px' }} delay={0.4} floatDelay={2} />
          
          <StaticNode topic={theme[3].topic} difficulty={theme[3].diff} locked style={{ top: '80px', left: '600px' }} delay={0.5} floatDelay={0.5} />
          <StaticNode topic={theme[4].topic} difficulty={theme[4].diff} locked style={{ top: '200px', left: '600px' }} delay={0.6} floatDelay={1.5} />
          <StaticNode topic={theme[5].topic} difficulty={theme[5].diff} locked style={{ top: '320px', left: '600px' }} delay={0.7} floatDelay={2.5} />
          
          <StaticNode topic={theme[6].topic} difficulty={theme[6].diff} locked style={{ top: '140px', left: '880px' }} delay={0.9} floatDelay={1.2} />
          <StaticNode topic={theme[7].topic} difficulty={theme[7].diff} locked style={{ top: '260px', left: '880px' }} delay={1.1} floatDelay={0.8} />
          
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, animation: 'swoopAndClick 8s infinite', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.8))', pointerEvents: 'none' }}>
            <path d="M5.5 2.5L20.5 11L12.5 13.5L10 21.5L5.5 2.5Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5"/>
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100px', background: 'linear-gradient(transparent, #050505)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '100%', background: 'linear-gradient(to right, transparent, #0a0a0a)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '150px', height: '100%', background: 'linear-gradient(to left, transparent, #0a0a0a)', pointerEvents: 'none' }} />
        </div>
      </section>

      {/* LEADERBOARD DEMO SECTION */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 50px', marginBottom: '120px' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '900', textAlign: 'center', marginBottom: '60px', letterSpacing: '-1px' }}>Dominate the Global Rankings</h2>
        
        <div className="hover-card" style={{
          background: '#050505', padding: '50px', borderRadius: '16px', border: '1px solid #222',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column'
        }}>
          {/* PODIUM ANIMATION */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '15px', marginBottom: '40px', height: '220px' }}>
            
            {/* 2nd Place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', animation: 'popIn 0.5s ease-out 0.2s both' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#aaa', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>M. Hamilton</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontFamily: 'monospace' }}>8900 XP</div>
              <div style={{ width: '100%', height: '120px', background: 'linear-gradient(to bottom, #222, #0a0a0a)', borderTop: '4px solid #c0c0c0', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '15px', fontSize: '24px', fontWeight: '900', color: '#c0c0c0' }}>2</div>
            </div>

            {/* 1st Place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px', animation: 'popIn 0.5s ease-out 0s both' }}>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#ffd700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>A. Turing</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontFamily: 'monospace' }}>12450 XP</div>
              <div style={{ width: '100%', height: '160px', background: 'linear-gradient(to bottom, #222, #0a0a0a)', borderTop: '4px solid #ffd700', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '15px', fontSize: '32px', fontWeight: '900', color: '#ffd700', boxShadow: '0 0 30px rgba(255, 215, 0, 0.1)' }}>1</div>
            </div>

            {/* 3rd Place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', animation: 'popIn 0.5s ease-out 0.4s both' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a67d3d', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>C. Babbage</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontFamily: 'monospace' }}>5200 XP</div>
              <div style={{ width: '100%', height: '90px', background: 'linear-gradient(to bottom, #222, #0a0a0a)', borderTop: '4px solid #cd7f32', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '10px', fontSize: '20px', fontWeight: '900', color: '#cd7f32' }}>3</div>
            </div>
          </div>

          {/* MOCK LIST */}
          <div style={{ borderTop: '1px solid #222', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}><span style={{ color: '#666', fontWeight: 'bold', width: '20px' }}>4</span><span style={{ fontWeight: '600', color: '#ededed' }}>A. Lovelace</span></div>
              <span style={{ fontFamily: 'monospace', color: '#888' }}>2150 XP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}><span style={{ color: '#666', fontWeight: 'bold', width: '20px' }}>5</span><span style={{ fontWeight: '600', color: '#ededed' }}>R. Hopper</span></div>
              <span style={{ fontFamily: 'monospace', color: '#888' }}>850 XP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ROTATING PROMPT COLLAGE */}
      <section style={{ overflow: 'hidden', padding: '60px 0 100px 0', background: '#050505', borderTop: '1px solid #111' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', textAlign: 'center', marginBottom: '40px', color: '#fff' }}>We can map literally anything. Try us.</h2>
        <div style={{ whiteSpace: 'nowrap', marginBottom: '20px' }}>
          <div style={{ display: 'inline-block', width: 'max-content', animation: 'scrollLeft 35s linear infinite' }}>
            {[...promptRow1, ...promptRow1, ...promptRow1].map((text, i) => <span key={i} className="chip hover-card">{text}</span>)}
          </div>
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <div style={{ display: 'inline-block', width: 'max-content', animation: 'scrollRight 40s linear infinite' }}>
            {[...promptRow2, ...promptRow2, ...promptRow2].map((text, i) => <span key={i} className="chip hover-card">{text}</span>)}
          </div>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '80px 20px', borderTop: '1px solid #222', color: '#444', fontSize: '14px', fontWeight: 'bold' }}>
        {footerText}
      </footer>
    </div>
  );
}