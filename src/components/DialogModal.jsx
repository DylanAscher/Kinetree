import React from 'react';

export default function DialogModal({ 
  isOpen, title, message, onConfirm, onCancel, 
  confirmText = "Okay", cancelText = "Cancel", isDanger = false 
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#111', padding: '30px', borderRadius: '8px',
        border: '1px solid #333', width: '100%', maxWidth: '450px',
        color: '#fff', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '15px', fontSize: '20px', fontWeight: 'bold' }}>{title}</h2>
        <p style={{ color: '#aaa', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>{message}</p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {onCancel && (
            <button onClick={onCancel} style={{
                padding: '10px 20px', background: 'transparent', color: '#888', border: '1px solid #333', 
                borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.color = '#fff'; e.target.style.borderColor = '#555'; }}
              onMouseLeave={(e) => { e.target.style.color = '#888'; e.target.style.borderColor = '#333'; }}
            >{cancelText}</button>
          )}
          <button onClick={onConfirm} style={{
              padding: '10px 20px', color: isDanger ? '#fff' : '#000', background: isDanger ? '#cc0000' : '#ededed',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >{confirmText}</button>
        </div>
      </div>
    </div>
  );
}