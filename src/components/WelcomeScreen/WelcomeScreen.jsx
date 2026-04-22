import React, { useEffect, useState } from 'react';
import './WelcomeScreen.css';

export default function WelcomeScreen({ displayName, onComplete }) {
  const [phase, setPhase] = useState('animating');

  useEffect(() => {
    // The animation takes about 1.8s, wait before fading background
    const timer1 = setTimeout(() => {
      setPhase('done');
    }, 1500);

    const timer2 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className={`welcome-screen ${phase === 'done' ? 'fade-out' : ''}`}>
      <h1 className="welcome-text">Welcome {displayName}</h1>
    </div>
  );
}
