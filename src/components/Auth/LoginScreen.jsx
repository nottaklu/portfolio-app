import React, { useState, useRef } from 'react';
import './LoginScreen.css';

export default function LoginScreen({ onLogin, loading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const passRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    if (isSignup && !displayName.trim()) return;
    onLogin(username.trim().toLowerCase(), password, isSignup ? displayName.trim() : null);
  };

  return (
    <div className="login-screen">
      <div className="login-bg-glow" />

      <div className="login-content">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="8" width="28" height="20" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M8 22L13 15L17 19L24 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 10H24V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="login-title">Portfolio Tracker</h1>
          <p className="login-subtitle">Track your investments with precision</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Username</label>
            <div className="login-input-wrap">
              <svg className="login-input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2.5 16C2.5 12.5 5.5 10 9 10s6.5 2.5 6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                className="login-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                autoCapitalize="off"
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <svg className="login-input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 8V5.5C6 3.5 7.3 2 9 2s3 1.5 3 3.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={passRef}
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 9s3-5 7-5 7 5 7 5-3 5-7 5S2 9 2 9z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 9s3-5 7-5 7 5 7 5-3 5-7 5S2 9 2 9z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 15L15 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {isSignup && (
            <div className="login-field">
              <label className="login-label">Display Name</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 9H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  className="login-input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            </div>
          )}

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-submit pressable"
            disabled={loading || !username.trim() || !password.trim()}
          >
            {loading ? (
              <div className="login-spinner" />
            ) : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="login-switch">
          <span className="login-switch-text">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button
            className="login-switch-btn"
            onClick={() => { setIsSignup(!isSignup); setDisplayName(''); }}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
