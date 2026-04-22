import React from 'react';
import './BottomNav.css';

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
        onClick={() => onTabChange('portfolio')}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="7" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7 7V5a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span>Portfolio</span>
      </button>
      <button
        className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onTabChange('dashboard')}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          <rect x="13" y="3" width="6" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3" y="14" width="6" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
          <rect x="13" y="11" width="6" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span>Dashboard</span>
      </button>
    </nav>
  );
}
