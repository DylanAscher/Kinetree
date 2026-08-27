import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function AuthModal({ onClose, message }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await login(email, password);
        
        if (error) throw error;
        onClose(); 
      } else {
        const { error } = await login(email, password);
        if (error) throw error;
        setError('Demo account created. You are now signed in.');
        setLoading(false);
        onClose();
        return;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#111', padding: '40px', borderRadius: '12px',
        border: '1px solid #333', width: '100%', maxWidth: '400px',
        color: '#fff', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        
        {/* EXIT BUTTON */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute', top: '15px', right: '15px',
            background: 'transparent', border: 'none', color: '#888',
            fontSize: '28px', cursor: 'pointer', lineHeight: '1',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#fff'}
          onMouseLeave={(e) => e.target.style.color = '#888'}
        >
          ×
        </button>

        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '28px', fontWeight: 'bold' }}>
          {isLogin ? 'Log In' : 'Sign Up'}
        </h2>

        {message && (
          <div style={{ background: 'rgba(255, 204, 0, 0.1)', border: '1px solid #ffcc00', padding: '12px', borderRadius: '6px', marginBottom: '20px', color: '#ffcc00', fontSize: '14px' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff4444', padding: '12px', borderRadius: '6px', marginBottom: '20px', color: '#ff4444', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '16px', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '14px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontSize: '16px', outline: 'none' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', padding: '14px', background: '#fff', color: '#000', 
              border: 'none', borderRadius: '6px', fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', fontSize: '16px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#888' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}