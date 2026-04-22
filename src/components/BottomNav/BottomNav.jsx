import React from 'react';
import './BottomNav.css';

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
        onClick={() => onTabChange('portfolio')}
        aria-label="Portfolio"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6 7V5a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <button
        className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onTabChange('dashboard')}
        aria-label="Dashboard"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="5.5" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          <rect x="11.5" y="3" width="5.5" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3" y="12.5" width="5.5" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          <rect x="11.5" y="10" width="5.5" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
    </nav>
  );
}
