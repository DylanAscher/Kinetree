import React from 'react';
import { Handle, Position } from 'reactflow';

export default function Branch({ data }) {
  const isMastered = data.status === 'mastered';
  const isUnlockable = data.isUnlockable !== false; 
  
  const borderColor = isMastered ? '#ededed' : '#333'; 
  const bgColor = isMastered ? '#111' : '#0a0a0a';
  const textColor = isMastered ? '#fff' : '#a3a3a3';
  const labelColor = isMastered ? '#fff' : '#ededed';

  const nodeOpacity = (isMastered || isUnlockable) ? 1 : 0.85;
  const animationDelay = data.isNewTree ? data.colIndex * 0.5 : 0;

  return (
    <>
      <style>{`
        @keyframes place-node {
          0% { opacity: 0; transform: scale(0.6) translateX(-30px); }
          60% { opacity: 1; transform: scale(1.05) translateX(5px); }
          100% { opacity: ${nodeOpacity}; transform: scale(1) translateX(0); }
        }
        
        .mastered-glow {
          box-shadow: 0 0 15px rgba(255,255,255,0.05);
        }
      `}</style>

      <div 
        className={isMastered ? 'mastered-glow move-icon' : 'move-icon'}
        style={{ 
          position: 'relative', background: bgColor, border: `1px solid ${borderColor}`, 
          borderRadius: '4px', padding: '15px 12px 12px 15px', minWidth: '220px', 
          maxWidth: '220px', transition: 'all 0.3s ease',
          opacity: data.isNewTree ? 0 : nodeOpacity,
          animation: data.isNewTree ? `place-node 0.6s ease-out forwards ${animationDelay}s` : 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: labelColor, letterSpacing: '-0.5px' }}>
            {data.label}
          </h3>
          <span style={{ 
            fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold', textTransform: 'uppercase',
            border: `1px solid ${isMastered ? '#555' : '#333'}`, color: isMastered ? '#ededed' : '#666'
          }}>
            {data.difficulty}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '12px', color: textColor, lineHeight: '1.4' }}>
          {data.description?.length > 60 ? `${data.description.substring(0, 55)}...` : data.description}
        </p>

        <Handle type="target" position={Position.Left} style={{ 
            top: '50%', transform: 'translateY(-50%)', background: '#444', 
            width: '6px', height: '12px', borderRadius: '2px', border: 'none', left: '-3px'
        }} />
        
        <Handle type="source" position={Position.Right} onClick={(e) => { if (data.isLeaf && data.onExpand) { e.stopPropagation(); data.onExpand(); } }}
          style={{ 
              top: '50%', transform: 'translateY(-50%)', background: data.isLeaf ? '#ededed' : '#444', 
              width: data.isLeaf ? '16px' : '6px', height: data.isLeaf ? '16px' : '12px', 
              borderRadius: '2px', border: 'none', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: data.isLeaf ? 'pointer' : 'default', right: '-3px'
          }}
        >
          {data.isLeaf && <span style={{ color: '#000', fontSize: '14px', lineHeight: 1, fontWeight: 'bold', marginLeft: '1px' }}>+</span>}
        </Handle>
      </div>
    </>
  );
}