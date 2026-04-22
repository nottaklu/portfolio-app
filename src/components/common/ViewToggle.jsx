import React from 'react';
import './ViewToggle.css';

export default function ViewToggle({ view, onToggle }) {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn ${view === 'tile' ? 'active' : ''}`}
        onClick={() => onToggle('tile')}
        aria-label="Tile view"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="10" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <button
        className={`view-toggle-btn ${view === 'row' ? 'active' : ''}`}
        onClick={() => onToggle('row')}
        aria-label="Row view"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="2" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1" y="7.5" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="1" y="13" width="16" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}
