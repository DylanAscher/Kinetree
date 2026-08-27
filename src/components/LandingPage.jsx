import React, { useState, useEffect } from 'react';
import FeedbackModal from './FeedbackModal';

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
  "© 2026 KINETREE. Built as a thoughtful learning experiment.",
  "© 2026 KINETREE. Designed for curious minds and practical progress.",
  "© 2026 KINETREE. A small project with room to grow.",
  "© 2026 KINETREE. Clear paths for ambitious learning goals.",
  "© 2026 KINETREE. Built with care for independent learners.",
  "© 2026 KINETREE. Turn curiosity into a plan.",
  "© 2026 KINETREE. Explore a new way to organize learning.",
  "© 2026 KINETREE. Keep learning, one branch at a time."
];

const promptRow1 = ["Python", "Photography", "Quantum Physics", "Linear Algebra", "FL Studio", "Touch Typing", "Sourdough Bread", "Machine Learning"];
const promptRow2 = ["How to talk to people", "Tax Fraud (Just Kidding)", "Making a Good Cup of Coffee", "Existential Dread Mitigation", "C++ Pointers", "Video Editing"];

const processSteps = [
  { title: "1. The Spark", desc: "Tell Kinetree exactly what you want to learn. No topic is too niche." },
  { title: "2. AI Generation", desc: "Watch as the AI structures your curriculum into a chronological path." },
  { title: "3. The Map", desc: "Your custom skill tree is ready. See the full journey ahead." },
  { title: "4. Dive In", desc: "Access AI-generated, bite-sized lessons and interactive resources." },
  { title: "5. Mastery", desc: "Pass quizzes to prove your skills and unlock the next tier of knowledge." }
];

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
  },
  navArrowStyle: {
    background: '#111', color: '#fff', border: '1px solid #333',
    width: '50px', height: '50px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: '20px', fontWeight: 'bold',
    transition: 'all 0.2s', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    zIndex: 10, flexShrink: 0
  }
};

const StaticNode = ({ topic, difficulty, locked, isMastered, style, delay = 0, floatDelay = 0, isClickable = false, animateEntry = true }) => {
  const borderColor = isMastered ? '#ededed' : (locked ? '#333' : '#555');
  const bgColor = isMastered ? '#111' : '#0a0a0a';
  const shadow = isMastered ? '0 0 15px rgba(255,255,255,0.05)' : (locked ? 'none' : '0 10px 30px rgba(0,0,0,0.5)');
  const textColor = isMastered ? '#fff' : (locked ? '#888' : '#fff');
  const badgeBorder = isMastered ? '#555' : '#333';
  const badgeColor = isMastered ? '#ededed' : '#666';

  let anim = `floatNode 6s ease-in-out ${floatDelay}s infinite`;
  let startOpacity = locked ? 0.85 : 1;

  if (animateEntry) {
    anim = `nodeEntry 0.5s ease-out ${delay}s forwards, ` + anim;
    startOpacity = 0;
  }

  return (
    <div className={isClickable ? 'demo-clickable-node' : ''} style={{
        position: 'absolute', background: bgColor, border: `1px solid ${borderColor}`,
        borderRadius: '8px', padding: '15px', width: '200px', height: '100px',
        boxShadow: shadow, zIndex: 2, boxSizing: 'border-box', pointerEvents: 'none',
        opacity: startOpacity, 
        animation: anim,
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

const StaticConnection = ({ d, delay = 0, animateEntry = true }) => (
  <g style={animateEntry ? { animation: `nodeEntry 0.5s ease-out ${delay}s forwards`, opacity: 0 } : { opacity: 1 }}>
    <path d={d} fill="transparent" stroke="#333" strokeWidth="2" />
  </g>
);

export default function LandingPage({ onOpenLogin, onOpenPricing, onGoToDashboard, isLoggedIn }) {
  const [theme, setTheme] = useState(previewThemes[0]);
  const [footerText, setFooterText] = useState(footerMessages[0]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  const openFeedback = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    requestAnimationFrame(() => setShowFeedback(true));
  };

  useEffect(() => {
    setTheme(previewThemes[Math.floor(Math.random() * previewThemes.length)]);
    setFooterText(footerMessages[Math.floor(Math.random() * footerMessages.length)]);
  }, []);

  const renderStep0 = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
       <h3 style={{ fontSize: '32px', marginBottom: '40px', fontWeight: '900', letterSpacing: '-1px' }}>What do you want to learn?</h3>
       <div style={{ background: '#0a0a0a', border: '1px solid #333', padding: '20px 30px', borderRadius: '40px', width: '80%', maxWidth: '600px', display: 'flex', alignItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
           <span style={{ fontSize: '24px', marginRight: '15px', color: '#666' }}>🔍</span>
           <div style={{ position: 'relative', flex: 1, height: '30px', display: 'flex', alignItems: 'center' }}>
            {/* This wrapper ensures the animation width matches the text exactly */}
            <div style={{ position: 'relative', width: 'fit-content' }}>
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                height: '100%', 
                overflow: 'hidden', 
                whiteSpace: 'nowrap', 
                borderRight: '2px solid #fff', 
                animation: 'typingText 4s steps(40, end) infinite, blinkCursor 0.75s step-end infinite', 
                fontSize: '22px', 
                fontWeight: '600', 
                color: '#ededed', 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                {theme[0].topic} and {theme[1].topic}...
              </div>
              
              {/* Invisible ghost text to hold the container's width */}
              <div style={{ visibility: 'hidden', whiteSpace: 'nowrap', fontSize: '22px', fontWeight: '600' }}>
                {theme[0].topic} and {theme[1].topic}...
              </div>
            </div>
          </div>
       </div>
    </div>
  );

  // EXACT REPLICA OF GeneratePopup.jsx
  const renderStep1 = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div 
        style={{
          background: '#0a0a0a', color: '#ededed', padding: '40px',
          borderRadius: '6px', width: '450px', maxWidth: '90%',
          border: '1px solid #444', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
        }}
      >
        <h2 style={{ fontSize: '18px', margin: '0 0 25px 0', fontWeight: '400', letterSpacing: '-0.5px' }}>
          Mapping out <span style={{ fontWeight: '600' }}>{theme[0].topic}</span><span style={{ animation: 'blinkCursor 1s infinite' }}>...</span>
        </h2>

        <div style={{ 
            background: '#111', padding: '20px', borderRadius: '4px', textAlign: 'left', border: '1px solid #222'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Generation Progress
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0, color: '#a3a3a3', fontSize: '14px' }}>
              <span style={{ color: '#555', fontWeight: 'bold' }}>Status:</span> Analyzing and generating structure...
            </p>
            <p style={{ margin: 0, color: '#a3a3a3', fontSize: '14px' }}>
              <span style={{ color: '#555', fontWeight: 'bold' }}>Model:</span> Gemini 3.1 Flash
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTree = (step) => {
    const isSpawning = step === 2; // Map spawns on step index 2
    const showSubpageMock = step === 3;
    const showCursor = step === 4;

    return (
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
          <StaticConnection animateEntry={isSpawning} d="M 240 250 C 265 250, 265 130, 290 130" delay={0.2} />
          <StaticConnection animateEntry={isSpawning} d="M 240 250 C 265 250, 265 370, 290 370" delay={0.3} />
          <StaticConnection animateEntry={isSpawning} d="M 490 130 C 515 130, 515 130, 540 130" delay={0.5} />
          <StaticConnection animateEntry={isSpawning} d="M 490 130 C 515 130, 515 250, 540 250" delay={0.6} />
          <StaticConnection animateEntry={isSpawning} d="M 490 370 C 515 370, 515 250, 540 250" delay={0.7} />
          <StaticConnection animateEntry={isSpawning} d="M 490 370 C 515 370, 515 370, 540 370" delay={0.8} />
          <StaticConnection animateEntry={isSpawning} d="M 740 130 C 765 130, 765 190, 790 190" delay={0.9} />
          <StaticConnection animateEntry={isSpawning} d="M 740 250 C 765 250, 765 190, 790 190" delay={1.0} />
          <StaticConnection animateEntry={isSpawning} d="M 740 250 C 765 250, 765 310, 790 310" delay={1.1} />
          <StaticConnection animateEntry={isSpawning} d="M 740 370 C 765 370, 765 310, 790 310" delay={1.2} />
        </svg>
        
        <StaticNode animateEntry={isSpawning} topic={theme[0].topic} difficulty={theme[0].diff} isMastered={true} style={{ top: '200px', left: '40px' }} delay={0.1} floatDelay={0} />
        
        <StaticNode animateEntry={isSpawning} topic={theme[1].topic} difficulty={theme[1].diff} isClickable={showCursor} style={{ top: '80px', left: '290px' }} delay={0.3} floatDelay={1} />
        <StaticNode animateEntry={isSpawning} topic={theme[2].topic} difficulty={theme[2].diff} style={{ top: '320px', left: '290px' }} delay={0.4} floatDelay={2} />
        
        <StaticNode animateEntry={isSpawning} topic={theme[3].topic} difficulty={theme[3].diff} locked style={{ top: '80px', left: '540px' }} delay={0.5} floatDelay={0.5} />
        <StaticNode animateEntry={isSpawning} topic={theme[4].topic} difficulty={theme[4].diff} locked style={{ top: '200px', left: '540px' }} delay={0.6} floatDelay={1.5} />
        <StaticNode animateEntry={isSpawning} topic={theme[5].topic} difficulty={theme[5].diff} locked style={{ top: '320px', left: '540px' }} delay={0.7} floatDelay={2.5} />
        
        <StaticNode animateEntry={isSpawning} topic={theme[6].topic} difficulty={theme[6].diff} locked style={{ top: '140px', left: '790px' }} delay={0.9} floatDelay={1.2} />
        <StaticNode animateEntry={isSpawning} topic={theme[7].topic} difficulty={theme[7].diff} locked style={{ top: '260px', left: '790px' }} delay={1.1} floatDelay={0.8} />

        {/* EXACT REPLICA OF BranchSubpage.jsx */}
        {showSubpageMock && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 2000, transition: 'background-color 0.3s ease'
          }}>
            <div style={{
              background: '#0a0a0a', padding: '40px', borderRadius: '12px',
              border: '1px solid #333', width: '100%', maxWidth: '500px', color: '#fff', position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              animation: 'popIn 0.3s ease-out forwards',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '-0.5px' }}>{theme[1].topic}</h2>
                <span style={{ 
                  fontSize: '12px', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase',
                  border: `1px solid #333`, color: '#888',
                  background: '#111'
                }}>
                  {theme[1].diff}
                </span>
              </div>

              <p style={{ color: '#aaa', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
                A foundational understanding of {theme[1].topic.toLowerCase()} is essential for mastering {theme[0].topic.toLowerCase()}. Let's break down how it works and why it matters before attempting the mastery check.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '35px' }}>
                  <div style={{
                      display: 'block', padding: '14px', background: '#111', border: '1px solid #222',
                      color: '#ededed', borderRadius: '6px', fontSize: '14px',
                      textAlign: 'center', fontWeight: '600'
                  }}>
                      ► Search YouTube Tutorials
                  </div>
                  <div style={{
                      display: 'block', padding: '14px', background: '#111', border: '1px solid #222',
                      color: '#ededed', borderRadius: '6px', fontSize: '14px',
                      textAlign: 'center', fontWeight: '600'
                  }}>
                      🌐 View Documentation / Guides
                  </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #222', paddingTop: '20px' }}>
                <button style={{
                  padding: '10px 20px', borderRadius: '4px', border: 'none', background: 'transparent', 
                  color: '#888', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
                }}>Close</button>
                <button style={{
                    padding: '10px 20px', borderRadius: '4px', border: 'none', background: '#ededed', 
                    color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
                  }}
                >Mark as Mastered</button>
              </div>
            </div>
          </div>
        )}

        {showCursor && (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, animation: 'swoopAndClick 8s infinite', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.8))', pointerEvents: 'none' }}>
            <path d="M5.5 2.5L20.5 11L12.5 13.5L10 21.5L5.5 2.5Z" fill="#ffffff" stroke="#000000" strokeWidth="1.5"/>
          </svg>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', color: '#fff', overflowX: 'hidden', position: 'relative', zIndex: 1, animation: 'pageFadeIn 0.35s ease-out forwards' }}>
      <style>{`
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(10px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes panelTransition {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes nodeEntry { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes floatNode { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes scrollRight { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        @keyframes popIn { 0% { opacity: 0; transform: translateY(20px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        @keyframes typingText {
          0% { width: 0%; }
          50% { width: 100%; }
          100% { width: 100%; }
        }
        @keyframes blinkCursor {
          0%, 100% { border-right-color: #fff; }
          50% { border-right-color: transparent; }
        }

        @keyframes swoopAndClick {
          0% { transform: translate(800px, 450px); opacity: 0; } 
          10% { transform: translate(600px, 300px); opacity: 1; }
          30% { transform: translate(370px, 130px); scale: 1; } 
          35% { transform: translate(370px, 130px) scale(0.85); }
          40% { transform: translate(370px, 130px) scale(1); } 
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

        .demo-clickable-node { animation: floatNode 6s ease-in-out 1s infinite, masterNodeBody 8s infinite !important; }
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
          <button onClick={isLoggedIn ? onGoToDashboard : onOpenLogin} style={{ background: '#ededed', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }} className="btn-glow">
            {isLoggedIn ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </nav>

      <section style={{ textAlign: 'center', padding: '30px 20px 60px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: '900', lineHeight: '1.1', marginBottom: '25px', letterSpacing: '-2px' }}>
          <span style={{ color: '#f1efef' }}>Stop doomscrolling.</span> <br/><span style={{ color: '#4caf50' }}>Learn something.</span>
        </h1>
        <p style={{ fontSize: '20px', color: '#888', marginBottom: '40px', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto 40px auto' }}>
          You don't know what you don't know. We force an AI to map human knowledge into a skill tree so you can stop guessing and start actually learning.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '40px' }}>
          <button onClick={isLoggedIn ? onGoToDashboard : onOpenLogin} style={{ background: '#fff', color: '#000', border: 'none', padding: '18px 45px', borderRadius: '8px', fontWeight: '900', fontSize: '18px', cursor: 'pointer', transition: 'all 0.3s' }} className="btn-glow">
            {isLoggedIn ? 'Go to Dashboard →' : 'Start for Free →'}
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

      {/* HOW IT WORKS PROCESS CAROUSEL */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', marginBottom: '120px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ color: '#4caf50', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px', marginBottom: '10px' }}>The Process</div>
          <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>{processSteps[processStep].title}</h2>
          <p style={{ color: '#888', fontSize: '18px', marginTop: '15px' }}>{processSteps[processStep].desc}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px' }}>
          <button 
            onClick={() => setProcessStep(p => Math.max(0, p - 1))} 
            disabled={processStep === 0}
            style={{ ...styles.navArrowStyle, opacity: processStep === 0 ? 0.3 : 1, cursor: processStep === 0 ? 'not-allowed' : 'pointer' }}
            onMouseEnter={e => { if(processStep !== 0) e.target.style.background = '#222' }}
            onMouseLeave={e => e.target.style.background = '#111'}
          >
            ←
          </button>

          <div style={{ flex: 1, maxWidth: '1000px', background: '#050505', border: '1px solid #222', borderRadius: '12px', height: '500px', position: 'relative', overflow: 'hidden', boxShadow: '0 30px 100px rgba(0,0,0,0.8)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <div key={`step-panel-${processStep}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', animation: 'panelTransition 0.3s ease-out forwards' }}>
              {processStep === 0 && renderStep0()}
              {processStep === 1 && renderStep1()}
              {processStep >= 2 && renderTree(processStep)}
            </div>
            
          </div>

          <button 
            onClick={() => setProcessStep(p => Math.min(4, p + 1))} 
            disabled={processStep === 4}
            style={{ ...styles.navArrowStyle, opacity: processStep === 4 ? 0.3 : 1, cursor: processStep === 4 ? 'not-allowed' : 'pointer' }}
            onMouseEnter={e => { if(processStep !== 4) e.target.style.background = '#222' }}
            onMouseLeave={e => e.target.style.background = '#111'}
          >
            →
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
          {[0, 1, 2, 3, 4].map(step => (
            <button 
              key={step} 
              onClick={() => setProcessStep(step)}
              style={{ 
                width: processStep === step ? '30px' : '10px', height: '10px', borderRadius: '5px', 
                background: processStep === step ? '#4caf50' : '#333', border: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease'
              }} 
              aria-label={`Go to step ${step + 1}`}
            />
          ))}
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
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', animation: 'popIn 0.5s ease-out 0.2s both' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#aaa', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>M. Hamilton</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontFamily: 'monospace' }}>8900 XP</div>
              <div style={{ width: '100%', height: '120px', background: 'linear-gradient(to bottom, #222, #0a0a0a)', borderTop: '4px solid #c0c0c0', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '15px', fontSize: '24px', fontWeight: '900', color: '#c0c0c0' }}>2</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px', animation: 'popIn 0.5s ease-out 0s both' }}>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#ffd700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>A. Turing</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontFamily: 'monospace' }}>12450 XP</div>
              <div style={{ width: '100%', height: '160px', background: 'linear-gradient(to bottom, #222, #0a0a0a)', borderTop: '4px solid #ffd700', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '15px', fontSize: '32px', fontWeight: '900', color: '#ffd700', boxShadow: '0 0 30px rgba(255, 215, 0, 0.1)' }}>1</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', animation: 'popIn 0.5s ease-out 0.4s both' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a67d3d', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>C. Babbage</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontFamily: 'monospace' }}>5200 XP</div>
              <div style={{ width: '100%', height: '90px', background: 'linear-gradient(to bottom, #222, #0a0a0a)', borderTop: '4px solid #cd7f32', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', paddingTop: '10px', fontSize: '20px', fontWeight: '900', color: '#cd7f32' }}>3</div>
            </div>
          </div>

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
        <div style={{ textAlign: 'center', padding: '20px 0 20px 0', position: 'relative', zIndex: 10 }}>
          
          <button 
            onClick={openFeedback}
            style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#ededed'} 
            onMouseLeave={e => e.target.style.color = '#888'}
          >
            Give Feedback
          </button>

        </div>
      </footer>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      
    </div>
  );
}