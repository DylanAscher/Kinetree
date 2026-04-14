import React from 'react';

// Mocking React Flow components for the preview environment
const Position = { Top: 'top', Bottom: 'bottom' };
const Handle = ({ type, position, style }) => (
  <div 
    style={{
      ...style,
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      position: 'absolute',
      [position]: '-6px',
      left: '50%',
      transform: 'translateX(-50%)',
      border: '1px solid #64748b'
    }} 
  />
);

export default function Branch({ data = { label: 'Sample Skill', difficulty: 'Beginner', status: 'unlocked' } }) {
  // If we add 'mastered' logic later, we can change this color dynamically
  const isMastered = data.status === 'mastered';
  
  return (
    <div style={{
      position: 'relative',
      background: isMastered ? '#064e3b' : '#1e293b',
      color: '#f8fafc',
      padding: '15px 20px',
      borderRadius: '12px',
      border: `2px solid ${isMastered ? '#10b981' : '#3b82f6'}`,
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      textAlign: 'center',
      minWidth: '160px'
    }}>
      {/* Target Handle: Where lines come IN (Top) */}
      <Handle type="target" position={Position.Top} style={{ background: '#cbd5e1' }} />
      
      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
        {data.label}
      </div>
      
      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8' }}>
        {data.difficulty || 'Unknown'}
      </div>
      
      {/* Source Handle: Where lines go OUT (Bottom) */}
      <Handle type="source" position={Position.Bottom} style={{ background: '#cbd5e1' }} />
    </div>
  );
}