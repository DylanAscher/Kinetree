import React from 'react';

export default function BranchSubpage({ node, onClose, onMarkLearned, isUnlockable }) {
  if (!node) return null;

  const { data } = node;
  const isMastered = data.status === 'mastered';

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
    }}>
      <div style={{
        background: '#1e293b', padding: '30px', borderRadius: '16px',
        width: '500px', maxWidth: '90%', color: 'white',
        border: `2px solid ${isMastered ? '#10b981' : '#38bdf8'}`,
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
      }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', color: isMastered ? '#10b981' : '#f8fafc' }}>
            {data.label}
          </h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer'
          }}>✖</button>
        </div>

        {/* Description Section */}
        <div style={{ marginBottom: '20px', color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6' }}>
          {data.description}
        </div>

        {/* Resources Links Section */}
        {data.resources && data.resources.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px', letterSpacing: '1px' }}>
              Recommended Learning Resources
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.resources.map((res, i) => (
                <a 
                  key={i} 
                  href={res.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{
                    display: 'block', padding: '12px 16px', background: '#0f172a',
                    borderRadius: '8px', color: '#38bdf8', textDecoration: 'none',
                    border: '1px solid #334155', transition: 'all 0.2s', fontSize: '14px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = '#38bdf8'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = '#334155'}
                >
                  🔗 {res.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button onClick={onClose} style={{
            padding: '10px 20px', borderRadius: '8px', border: '1px solid #475569',
            background: 'transparent', color: '#e2e8f0', cursor: 'pointer'
          }}>
            Close
          </button>
          
          {isMastered ? (
            <button disabled style={{
              padding: '10px 20px', borderRadius: '8px', border: '1px solid #064e3b',
              background: '#064e3b', color: '#34d399', cursor: 'not-allowed', fontWeight: 'bold'
            }}>
              Mastered
            </button>
          ) : isUnlockable ? (
            <button onClick={onMarkLearned} style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 'bold'
            }}>
              ✓ Mark as Learned
            </button>
          ) : (
            <button disabled style={{
              padding: '10px 20px', borderRadius: '8px', border: '1px solid #475569',
              background: '#334155', color: '#94a3b8', cursor: 'not-allowed', fontWeight: 'bold'
            }}>
              🔒 Learn Prerequisites First
            </button>
          )}
        </div>
      </div>
    </div>
  );
}