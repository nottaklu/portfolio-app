import React, { useEffect, useState } from 'react';
import './WelcomeScreen.css';

export default function WelcomeScreen({ displayName }) {
  const [phase, setPhase] = useState('animating');

  useEffect(() => {
    // The text zooms in over 1.5s, then we fade out the white background.
    const timer1 = setTimeout(() => {
      setPhase('done');
    }, 1500);

    return () => {
      clearTimeout(timer1);
    };
  }, []);

  return (
    <div className={`welcome-screen ${phase === 'done' ? 'fade-out' : ''}`}>
      <h1 className="welcome-text">
        <span className="welcome-light">Welcome</span> <span className="welcome-bold">{displayName}</span>
      </h1>
    </div>
  );
}
