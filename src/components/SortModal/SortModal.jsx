import React, { useState, useEffect, useRef } from 'react';
import './SortModal.css';

const SORT_OPTIONS = [
  {
    id: 'alpha',
    label: 'Alphabetical (A-Z)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 6H10M4 10H8M4 14H6M14 4L17 14M14.5 11H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'dayGainPct',
    label: 'Day Gain %',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6V10L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'totalPnLPct',
    label: 'Total P&L %',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 15L8 9L11 12L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 5H17V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'currentValue',
    label: 'Current Value',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8H17" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'invested',
    label: 'Invested Amount',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6V14M8 8.5C8 7.67 8.9 7 10 7S12 7.67 12 8.5 11.1 10 10 10 8 10.67 8 11.5 8.9 13 10 13s2-.67 2-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function SortModal({ currentSort, onApply, onClose }) {
  const [selected, setSelected] = useState(currentSort || null);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleApply = () => {
    onApply(selected);
    handleClose();
  };

  const handleClear = () => {
    setSelected(null);
    onApply(null);
    handleClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  return (
    <div
      className={`sort-modal-overlay ${isVisible ? 'visible' : ''}`}
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className={`sort-modal ${isVisible ? 'visible' : ''}`}>
        <div className="sort-modal-handle-bar">
          <div className="sort-modal-handle" />
        </div>

        <div className="sort-modal-header">
          <h2 className="sort-modal-title">Sort By</h2>
          {selected && (
            <button className="sort-modal-clear" onClick={handleClear}>
              Clear
            </button>
          )}
        </div>

        <div className="sort-modal-options">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className={`sort-modal-option pressable ${selected === opt.id ? 'active' : ''}`}
              onClick={() => setSelected(opt.id)}
            >
              <span className="sort-modal-option-icon">{opt.icon}</span>
              <span className="sort-modal-option-label">{opt.label}</span>
              <div className={`sort-modal-radio ${selected === opt.id ? 'checked' : ''}`}>
                {selected === opt.id && <div className="sort-modal-radio-dot" />}
              </div>
            </button>
          ))}
        </div>

        <button className="sort-modal-apply pressable" onClick={handleApply}>
          Apply Sort
        </button>
      </div>
    </div>
  );
}
