import React, { useState, useRef, useEffect } from 'react';
import './MpinScreen.css';

export default function MpinScreen({ displayName, onVerify, onLogout, loading, error }) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    setTimeout(() => inputRefs[0].current?.focus(), 300);
  }, []);

  // If error comes in, trigger shake
  useEffect(() => {
    if (error) {
      setShake(true);
      setAttempts((p) => p + 1);
      setTimeout(() => {
        setShake(false);
        setPin(['', '', '', '']);
        inputRefs[0].current?.focus();
      }, 600);
    }
  }, [error]);

  // 3 wrong → force logout
  useEffect(() => {
    if (attempts >= 3) {
      setTimeout(() => onLogout(), 500);
    }
  }, [attempts, onLogout]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 filled
    if (value && index === 3) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        onVerify(fullPin);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const newPin = pasted.split('');
      setPin(newPin);
      inputRefs[3].current?.focus();
      setTimeout(() => onVerify(pasted), 100);
    }
  };

  return (
    <div className="mpin-screen">
      <div className="mpin-bg-glow" />

      <div className="mpin-content">
        <div className="mpin-avatar">
          {(displayName || 'U')[0].toUpperCase()}
        </div>
        <h2 className="mpin-greeting">Welcome back, {displayName || 'User'}</h2>
        <p className="mpin-subtitle">Enter your 4-digit MPIN to continue</p>

        <div className={`mpin-inputs ${shake ? 'shake' : ''}`}>
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              className={`mpin-digit ${digit ? 'filled' : ''}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              autoComplete="off"
            />
          ))}
        </div>

        {error && (
          <div className="mpin-error">
            {error} {attempts > 0 && `(${3 - attempts} attempts left)`}
          </div>
        )}

        {loading && <div className="mpin-loading-bar" />}

        <button className="mpin-not-you" onClick={onLogout}>
          Not you? Sign in with a different account
        </button>
      </div>
    </div>
  );
}
