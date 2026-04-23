import React, { useState, useEffect } from 'react'; // Added useEffect

export default function FeedbackModal({ onClose }) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('bug');
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // --- SCROLL LOCK LOGIC ---
  useEffect(() => {
    // Save original styles
    const originalBodyOverflow = window.getComputedStyle(document.body).overflow;
    const originalHtmlOverflow = window.getComputedStyle(document.documentElement).overflow;
    
    // Kill scrolling universally
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);
  // -------------------------

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000, backdropFilter: 'blur(5px)' }}>
      <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', padding: '40px', maxWidth: '500px', width: '90%', color: '#fff', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '28px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#888'}>×</button>

        {!submitted ? (
          <>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '900' }}>Give Feedback</h2>
            <p style={{ color: '#aaa', marginBottom: '25px', fontSize: '15px', lineHeight: '1.5' }}>
              Report found bugs and request new features. I want to hear what you have to say. Even if you need to vent. I'll read it eventually.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '14px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px', outline: 'none', fontSize: '15px', cursor: 'pointer' }}>
                <option value="bug"> Report a Bug</option>
                <option value="feature"> Request a Feature</option>
                <option value="vent"> Standard Message</option>
              </select>

              <textarea
                required
                placeholder="Type your unfiltered thoughts here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ padding: '15px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px', minHeight: '140px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', fontSize: '15px' }}
              />

              <button type="submit" disabled={isSending} style={{ padding: '16px', background: '#ededed', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSending ? 'wait' : 'pointer', fontSize: '16px', marginTop: '10px', transition: 'opacity 0.2s', opacity: isSending ? 0.7 : 1 }}>
                {isSending ? 'Transmitting...' : 'Send into the Void'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>🛰️</div>
            <h2 style={{ margin: '0 0 10px 0', color: '#4caf50', fontWeight: '900' }}>Transmission Received!</h2>
            <p style={{ color: '#aaa', lineHeight: '1.5' }}>Feedback sent. I'll get to it when I get to it.</p>
            <button onClick={onClose} style={{ marginTop: '25px', padding: '12px 24px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Close Panel</button>
          </div>
        )}
      </div>
    </div>
  );
}