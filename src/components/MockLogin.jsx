import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function MockLogin({ onClose }) {
  const [email, setEmail] = useState('');
  const { login } = useAuth(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      login(email);
      if (onClose) onClose(); 
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(2px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#0a0a0a', padding: '40px', borderRadius: '6px', border: '1px solid #333', width: '380px', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#666', fontSize: '16px', cursor: 'pointer' }}>
          ✕
        </button>

        <h1 style={{ fontSize: '20px', margin: '0 0 5px 0', fontWeight: '500', letterSpacing: '-0.5px' }}>Kinetree</h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '30px' }}>Sign in to save your progress.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="user@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '4px', border: '1px solid #333', background: '#111', color: '#fff', fontSize: '14px', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = '#666'}
            onBlur={(e) => e.target.style.borderColor = '#333'}
            required
          />
          <button type="submit" style={{ padding: '12px', background: '#ededed', color: '#000', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}