import React, { useState, useEffect, useRef } from 'react';
import './AddPortfolioModal.css';

const COLORS = [
  '#4F46E5', '#7C3AED', '#0EA5E9', '#22C55E',
  '#F59E0B', '#EF4444', '#EC4899', '#14B8A6',
];

export default function AddPortfolioModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    document.body.style.overflow = 'hidden';
    setTimeout(() => inputRef.current?.focus(), 400);
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: name.trim(),
      color,
      type: 'manual',
      stockTickers: [],
    });
    handleClose();
  };

  return (
    <div
      className={`add-pf-overlay ${isVisible ? 'visible' : ''}`}
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
    >
      <div className={`add-pf-modal ${isVisible ? 'visible' : ''}`}>
        <div className="add-pf-handle-bar"><div className="add-pf-handle" /></div>

        <h2 className="add-pf-title">New Portfolio</h2>
        <p className="add-pf-subtitle">Create a new portfolio to track your investments</p>

        <form onSubmit={handleSubmit} className="add-pf-form">
          <div className="add-pf-field">
            <label className="add-pf-label">Portfolio Name</label>
            <input
              ref={inputRef}
              className="add-pf-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Growth Portfolio"
              maxLength={30}
            />
          </div>

          <div className="add-pf-field">
            <label className="add-pf-label">Color</label>
            <div className="add-pf-colors">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`add-pf-color-btn ${color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                >
                  {color === c && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="add-pf-preview">
            <div className="add-pf-preview-strip" style={{ backgroundColor: color }} />
            <div className="add-pf-preview-content">
              <div className="add-pf-preview-dot" style={{ backgroundColor: color }} />
              <span className="add-pf-preview-name">{name || 'Portfolio Name'}</span>
            </div>
          </div>

          <button
            type="submit"
            className="add-pf-submit pressable"
            disabled={!name.trim()}
          >
            Create Portfolio
          </button>
        </form>
      </div>
    </div>
  );
}
