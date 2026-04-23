import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import DialogModal from './DialogModal';
import FeedbackModal from './FeedbackModal';

export default function Dashboard({ savedTrees = [], userXP, onOpenTree, onOpenLogin, onGenerate, onDeleteTree, onOpenLeaderboard, onOpenPricing, onOpenUserInfo, onOpenLanding }) {  
  const { user, profile, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner'); 
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [deleteId, setDeleteId] = useState(null);

  const filteredTrees = (savedTrees || []).filter(tree => 
    tree.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoggedIn = user && user.id !== 'guest';

  // Handle click-outside to close custom dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleGenerateClick = () => {
    if (!isLoggedIn) {
      onOpenLogin("An account is required to generate and save your own skill trees.");
    } else {
      onGenerate(newTopic, skillLevel); 
    }
  };

  // Helper for name colors
  const getNameColor = (tier) => {
    if (tier === 'Pro') return '#ffd700'; // Gold
    if (tier === 'Unlimited') return '#4caf50'; // Green
    return '#ededed'; // Default
  };

  const difficultyOptions = [
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Advanced', value: 'Advanced' }
  ];

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff', animation: 'pageFadeIn 0.35s ease-out forwards' }}>
      
      <style>{`
        @keyframes pageFadeIn {
            from { opacity: 0; transform: translateY(10px); filter: blur(5px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
        .custom-dropdown-option {
          padding: 12px 20px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          color: #aaa;
          font-weight: 500;
          font-size: 16px;
          text-align: left;
        }
        .custom-dropdown-option:hover {
          background: #1a1a1a;
          color: #fff;
        }
        .chevron {
          width: 0; 
          height: 0; 
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #666;
          transition: transform 0.3s ease;
        }
        .chevron.open { transform: rotate(180deg); border-top-color: #fff; }
      `}</style>

      <DialogModal 
        isOpen={!!deleteId}
        title="Delete Skill Tree"
        message="Are you sure you want to permanently delete this skill tree?"
        confirmText="Delete"
        onConfirm={() => { onDeleteTree(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
        isDanger={true}
      />

      {/* FIXED: Modal now renders here */}
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      {/* FULL WIDTH NAVBAR */}
      <div style={{ 
        background: '#000', borderBottom: '1px solid #222', padding: '30px 50px', 
        width: '100%', boxSizing: 'border-box', flexShrink: 0, zIndex: 100 
      }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 onClick={onOpenLanding} style={{ fontSize: '36px', fontWeight: '900', margin: 0, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>KINETREE</h1>
            <p style={{ color: '#888', fontSize: '16px', margin: '5px 0 0 0' }}>Adaptive Learning Infrastructure</p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', padding: '6px 14px', borderRadius: '50px', border: '1px solid #333' }}>
                   <span style={{ color: '#888', fontWeight: 'bold', fontSize: '12px' }}>XP</span>
                   <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ededed' }}>{userXP}</span>
                </div>
                
                <button onClick={onOpenLeaderboard} style={{ background: '#ededed', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                   Rankings
                </button>

                <button onClick={onOpenPricing} style={{ background: 'linear-gradient(45deg, #4caf50, #2e7d32)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => e.target.style.transform = 'scale(1.05)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                   Upgrade
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button 
                    onClick={() => onOpenUserInfo()} 
                    style={{ background: 'none', border: 'none', color: getNameColor(profile?.tier), fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    {profile?.username || user.email?.split('@')[0]}
                  </button>
                  <button onClick={logout} style={{ background: '#000', border: '1px solid #ff4444', color: '#ff4444', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '16px', color: '#aaa' }}>Log in to save your progress</span>
                <button onClick={() => onOpenLogin()} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                  Log In
                </button>
              </div>
            )}
          </div>
        </header>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: '40px 50px 50px 50px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* GENERATION BAR */}
        <div style={{ 
          background: 'rgba(17, 17, 17, 0.7)', border: '1px solid #333', 
          padding: '60px', borderRadius: '16px', marginBottom: '40px', textAlign: 'center', 
          width: '100%', boxSizing: 'border-box', backdropFilter: 'blur(10px)' 
        }}>
          <h2 style={{ margin: '0 0 35px 0', fontSize: '32px' }}>What do you want to learn today?</h2>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            
            <input 
              type="text" 
              placeholder="e.g., Python, Video Editing, Cooking..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateClick()} 
              style={{ flex: 1, padding: '20px 30px', background: '#0a0a0a', border: '1px solid #444', color: '#fff', borderRadius: '10px', fontSize: '22px', outline: 'none' }}
            />

            {/* CUSTOM DESIGN DROPDOWN */}
            <div ref={dropdownRef} style={{ position: 'relative', width: '300px' }}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ 
                  height: '100%', padding: '0 25px', background: '#0a0a0a', border: `1px solid ${isDropdownOpen ? '#888' : '#444'}`, 
                  color: '#fff', borderRadius: '10px', fontSize: '20px', cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
              >
                <span>{skillLevel}</span>
                <div className={`chevron ${isDropdownOpen ? 'open' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div style={{ 
                  position: 'absolute', top: 'calc(100% + 10px)', left: 0, width: '100%', 
                  background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', 
                  overflow: 'hidden', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  animation: 'slideDownFade 0.2s ease-out forwards'
                }}>
                  {difficultyOptions.map((opt) => (
                    <div 
                      key={opt.value} 
                      className="custom-dropdown-option"
                      onClick={() => {
                        setSkillLevel(opt.value);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleGenerateClick}
              style={{ padding: '20px 45px', background: '#fff', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '22px' }}
            >
              Generate
            </button>
          </div>
        </div>

        {/* SAVED TREES GRID */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '22px' }}>Saved Trees</h3>
          <input 
            type="text" placeholder="Search trees..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 20px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '6px', width: '300px', fontSize: '16px', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px', paddingBottom: '50px' }}>
          {filteredTrees.length > 0 ? filteredTrees.map(tree => {
            const totalNodes = tree.nodes?.length || 0;
            const masteredNodes = tree.nodes?.filter(n => n.data?.status === 'mastered').length || 0;
            const progress = totalNodes === 0 ? 0 : Math.round((masteredNodes / totalNodes) * 100);

            return (
              <div key={tree.id} onClick={() => onOpenTree(tree)} style={{ background: 'rgba(17, 17, 17, 0.7)', border: '1px solid #333', padding: '30px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s ease', backdropFilter: 'blur(5px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '180px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '22px', fontWeight: 'bold' }}>{tree.topic}</h3>
                <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: '#4caf50' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Created: {tree.dateCreated || (tree.created_at ? new Date(tree.created_at).toLocaleDateString() : 'Unknown')}</span>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(tree.id); }} style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>Delete</button>
                    <span style={{ fontSize: '14px', color: '#444', fontWeight: 'bold' }}>View Tree →</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ width: '100%', gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#666' }}>
              <p style={{ fontSize: '18px' }}>No skill trees found.</p>
            </div>
          )}
        </div>

        {/* FOOTER SECTION */}
        <footer>
          <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '40px', paddingBottom: '10px' }}>
            <p style={{ color: '#555', fontSize: '14px', margin: '0 0 10px 0' }}>© {new Date().getFullYear()} KINETREE. ALL RIGHTS RESERVED.</p>
            <button 
              onClick={() => setShowFeedback(true)} 
              style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px', transition: 'color 0.2s' }} 
              onMouseEnter={e => e.target.style.color = '#ededed'} 
              onMouseLeave={e => e.target.style.color = '#888'}
            >
              Feedback
            </button>
        </div>
        </footer>
      </div>
    </div>
  );
}