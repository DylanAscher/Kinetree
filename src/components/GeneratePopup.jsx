import React, { useState, useEffect } from 'react';

const FUN_FACTS = [
  "The human brain can process images in as little as 13 milliseconds.",
  "Learning a new skill physically changes the structure of your brain.",
  "Spaced repetition can increase long-term memory retention by up to 200%.",
  "It takes about 10,000 hours to master a skill, but only 20 hours to get 'good' at it.",
  "Taking notes by hand improves comprehension more than typing them.",
  "Sleep is critical for learning; your brain reorganizes and consolidates memories while you rest."
];

export default function GeneratePopup() {
  const [dots, setDots] = useState('');
  const [fact, setFact] = useState('');

  useEffect(() => {
    setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 
      }}
    >
      <div 
        style={{
          background: '#1e293b', color: '#f8fafc', padding: '60px 40px',
          borderRadius: '20px', width: '500px', maxWidth: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          textAlign: 'center', border: '2px solid #3b82f6'
        }}
      >
        <h2 style={{ fontSize: '42px', margin: '0 0 50px 0', color: '#f8fafc' }}>
          Generating<span style={{ display: 'inline-block', width: '40px', textAlign: 'left' }}>{dots}</span>
        </h2>
        <div style={{ fontSize: '16px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#38bdf8' }}>Did you know?</p>
          <p style={{ margin: 0, fontStyle: 'italic', lineHeight: '1.5', color: '#cbd5e1' }}>"{fact}"</p>
        </div>
      </div>
    </div>
  );
}