import React, { useState, useEffect } from 'react';

export default function GeneratePopup({ topic, model, progressMessage }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(2px)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200
      }}
    >
      <div 
        style={{
          background: '#0a0a0a', color: '#ededed', padding: '40px',
          borderRadius: '6px', width: '450px', maxWidth: '90%',
          border: '1px solid #444', fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif'
        }}
      >
        <h2 style={{ fontSize: '18px', margin: '0 0 25px 0', fontWeight: '400', letterSpacing: '-0.5px' }}>
          Mapping out <span style={{ fontWeight: '600' }}>{topic}</span>{dots}
        </h2>

        <div style={{ 
            background: '#111', padding: '20px', borderRadius: '4px', textAlign: 'left', border: '1px solid #222'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Generation Progress
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0, color: '#a3a3a3', fontSize: '14px' }}>
              <span style={{ color: '#555', fontWeight: 'bold' }}>Status:</span> {progressMessage || "Initiating..."}
            </p>
            <p style={{ margin: 0, color: '#a3a3a3', fontSize: '14px' }}>
              <span style={{ color: '#555', fontWeight: 'bold' }}>Model:</span> {model || "Awaiting Node"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}