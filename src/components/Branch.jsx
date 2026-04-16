import React from 'react';
import { Handle, Position } from 'reactflow';

export default function Branch({ data }) {
  const isMastered = data.status === 'mastered';
  
  const borderColor = isMastered ? '#ededed' : '#333'; 
  const bgColor = isMastered ? '#111' : '#0a0a0a';
  const textColor = isMastered ? '#fff' : '#a3a3a3';
  const labelColor = isMastered ? '#fff' : '#ededed';

  const animationDelay = data.isNewTree ? data.colIndex * 0.5 : 0;

  return (
    <>
      <style>{`
        @keyframes place-node {
          0% { opacity: 0; transform: scale(0.6) translateX(-30px); }
          60% { opacity: 1; transform: scale(1.05) translateX(5px); }
          100% { opacity: 1; transform: scale(1) translateX(0); }
        }
      `}</style>

      <div 
        style={{ 
          position: 'relative',
          background: bgColor, 
          border: `1px solid ${borderColor}`, 
          borderRadius: '4px', 
          padding: '25px 20px 20px 20px', 
          minWidth: '240px',
          maxWidth: '300px',
          boxShadow: isMastered ? '0 0 10px rgba(255, 255, 255, 0.1)' : 'none',
          transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          animation: data.isNewTree ? `place-node 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${animationDelay}s both` : 'none'
        }}
      >
        
        <div 
          onClick={(e) => {
            e.stopPropagation(); 
            if (data.onCenter) data.onCenter();
          }}
          style={{ 
            position: 'absolute', top: '12px', left: '12px', cursor: 'pointer', 
            color: '#555', transition: 'color 0.2s', zIndex: 10, display: 'flex'
          }}
          title="Focus Branch"
          onMouseEnter={(e) => e.currentTarget.style.color = '#ededed'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#555'}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
             <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>

        <div 
          className="move-icon" 
          style={{ 
            position: 'absolute', top: '10px', right: '10px', cursor: 'grab', 
            color: '#444', fontSize: '14px', fontFamily: 'monospace'
          }}
          title="Drag to move"
        >
          [+]
        </div>

        <h3 style={{ margin: '15px 0 0 0', fontSize: '19px', color: labelColor, fontWeight: '600', letterSpacing: '-0.5px', lineHeight: '1.3' }}>
          {data.label}
        </h3>
        
        {data.difficulty && (
          <span style={{ 
            display: 'inline-block',
            background: '#111',
            padding: '4px 8px',
            borderRadius: '2px',
            border: '1px solid #222',
            fontSize: '10px',
            fontFamily: 'monospace',
            textTransform: 'uppercase', 
            color: '#888',
            width: 'fit-content'
          }}>
            DIF: {data.difficulty}
          </span>
        )}
        
        <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: textColor, lineHeight: '1.5' }}>
          {data.description && data.description.length > 70 
            ? `${data.description.substring(0, 70)}...` 
            : data.description}
        </p>

        <Handle 
          type="target" 
          position={Position.Left} 
          style={{ 
            top: '50%',                     
            transform: 'translateY(-50%)', 
            background: '#444', 
            width: '6px', 
            height: '12px', 
            borderRadius: '2px', 
            border: 'none',
            left: '-3px'
          }} 
        />
        
        <Handle 
          type="source" 
          position={Position.Right} 
          onClick={(e) => {
              if (data.isLeaf && data.onExpand) {
                  e.stopPropagation(); 
                  data.onExpand();
              }
          }}
          style={{ 
              top: '50%',
              transform: 'translateY(-50%)',
              background: data.isLeaf ? '#ededed' : '#444', 
              width: data.isLeaf ? '16px' : '6px', 
              height: data.isLeaf ? '16px' : '12px', 
              borderRadius: '2px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: data.isLeaf ? 'pointer' : 'default',
              right: data.isLeaf ? '-8px' : '-3px'
          }}
        >
          {data.isLeaf && <span style={{ color: '#000', fontSize: '12px', fontWeight: 'bold', lineHeight: 1 }}>+</span>}
        </Handle>
      </div>
    </>
  );
}