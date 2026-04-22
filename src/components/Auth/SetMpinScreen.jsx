import React, { useState, useRef, useEffect } from 'react';
import './MpinScreen.css'; // Reuse same styles

export default function SetMpinScreen({ displayName, onSetMpin, loading }) {
  const [step, setStep] = useState('set'); // 'set' | 'confirm'
  const [pin1, setPin1] = useState(['', '', '', '']);
  const [pin2, setPin2] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const refs1 = [useRef(), useRef(), useRef(), useRef()];
  const refs2 = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    setTimeout(() => refs1[0].current?.focus(), 300);
  }, []);

  const handleChange = (pinArr, setPinArr, refs, index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pinArr];
    newPin[index] = value.slice(-1);
    setPinArr(newPin);
    setError('');

    if (value && index < 3) {
      refs[index + 1].current?.focus();
    }

    // Auto-advance to confirm step
    if (value && index === 3 && step === 'set') {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        setTimeout(() => {
          setStep('confirm');
          setTimeout(() => refs2[0].current?.focus(), 200);
        }, 200);
      }
    }

    // Auto-submit on confirm
    if (value && index === 3 && step === 'confirm') {
      const confirm = newPin.join('');
      const original = pin1.join('');
      if (confirm.length === 4) {
        if (confirm === original) {
          onSetMpin(confirm);
        } else {
          setError("PINs don't match — try again");
          setPinArr(['', '', '', '']);
          setTimeout(() => refs2[0].current?.focus(), 100);
        }
      }
    }
  };

  const handleKeyDown = (pinArr, refs, index, e) => {
    if (e.key === 'Backspace' && !pinArr[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const activePin = step === 'set' ? pin1 : pin2;
  const activeRefs = step === 'set' ? refs1 : refs2;
  const activeSetPin = step === 'set' ? setPin1 : setPin2;

  return (
    <div className="mpin-screen">
      <div className="mpin-bg-glow" />

      <div className="mpin-content">
        <div className="mpin-avatar">
          {(displayName || 'U')[0].toUpperCase()}
        </div>
        <h2 className="mpin-greeting">
          {step === 'set' ? 'Set Your MPIN' : 'Confirm MPIN'}
        </h2>
        <p className="mpin-subtitle">
          {step === 'set'
            ? 'Create a 4-digit PIN for quick access'
            : 'Enter the same PIN again to confirm'}
        </p>

        {/* Step indicator */}
        <div className="set-mpin-steps">
          <div className={`set-mpin-step ${step === 'set' ? 'active' : 'done'}`}>1</div>
          <div className="set-mpin-line" />
          <div className={`set-mpin-step ${step === 'confirm' ? 'active' : ''}`}>2</div>
        </div>

        <div className="mpin-inputs">
          {activePin.map((digit, i) => (
            <input
              key={`${step}-${i}`}
              ref={activeRefs[i]}
              className={`mpin-digit ${digit ? 'filled' : ''}`}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(activePin, activeSetPin, activeRefs, i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(activePin, activeRefs, i, e)}
              autoComplete="off"
            />
          ))}
        </div>

        {error && <div className="mpin-error">{error}</div>}
        {loading && <div className="mpin-loading-bar" />}

        {step === 'confirm' && (
          <button
            className="mpin-not-you"
            onClick={() => {
              setStep('set');
              setPin1(['', '', '', '']);
              setPin2(['', '', '', '']);
              setError('');
              setTimeout(() => refs1[0].current?.focus(), 100);
            }}
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
