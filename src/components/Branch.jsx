import React from 'react';
import { Handle, Position } from 'reactflow';

export default function Branch({ data }) {
  const isMastered = data?.status === 'mastered';
  
  return (
    <div style={{
      position: 'relative', 
      background: isMastered ? '#064e3b' : '#1e293b',
      color: '#f8fafc', 
      padding: '15px 30px', 
      borderRadius: '50px', 
      border: `2px solid ${isMastered ? '#10b981' : '#3b82f6'}`,
      boxShadow: '0 4px 10px rgba(0,0,0,0.3)', 
      textAlign: 'center',
      minWidth: '180px', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      cursor: 'inherit'
    }}>
      {/* Target Handle: Where lines come IN (Left) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ background: '#cbd5e1', width: '8px', height: '8px', border: 'none' }} 
      />
      
      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
        {data?.label || 'Skill Node'}
      </div>
      
      {/* The new Difficulty Badge */}
      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>
        {data?.difficulty || 'Unknown'}
      </div>
      
      {/* Source Handle: Where lines go OUT (Right) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ background: '#cbd5e1', width: '8px', height: '8px', border: 'none' }} 
      />
    </div>
  );
}