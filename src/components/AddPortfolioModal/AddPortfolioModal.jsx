import React, { useState, useEffect, useRef } from 'react';
import './AddPortfolioModal.css';

const COLORS = [
  '#4F46E5', '#7C3AED', '#0EA5E9', '#22C55E',
  '#F59E0B', '#EF4444', '#EC4899', '#14B8A6',
];

export default function AddPortfolioModal({ onAdd, onClose }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [source, setSource] = useState('manual');
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [sheetRange, setSheetRange] = useState('A2:J1001');
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

    const portfolio = {
      name: name.trim(),
      color,
      type: source === 'sheets' ? 'sheets' : 'manual',
    };

    if (source === 'sheets') {
      if (!sheetUrl.trim() || !sheetName.trim()) return;
      const sheetConfig = {
        url: sheetUrl.trim(),
        sheetName: sheetName.trim(),
        sheetRange: sheetRange.trim() || 'A2:J1001',
      };
      onAdd(portfolio, sheetConfig);
    } else {
      onAdd(portfolio);
    }

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
              placeholder="e.g. Green Lantern PMS"
              maxLength={30}
            />
          </div>

          <div className="add-pf-field">
            <label className="add-pf-label">Source</label>
            <div className="add-pf-source-selector">
              <button
                type="button"
                className={`source-option ${source === 'manual' ? 'active' : ''}`}
                onClick={() => setSource('manual')}
              >
                Manual
              </button>
              <button
                type="button"
                className={`source-option ${source === 'sheets' ? 'active' : ''}`}
                onClick={() => setSource('sheets')}
              >
                Google Sheet
              </button>
            </div>
          </div>

          {source === 'sheets' && (
            <>
              <div className="add-pf-field">
                <label className="add-pf-label">Google Sheet URL</label>
                <input
                  className="add-pf-input"
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                />
              </div>

              <div className="add-pf-field">
                <label className="add-pf-label">Sheet Name</label>
                <input
                  className="add-pf-input"
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Green Lantern PMS"
                />
              </div>

              <div className="add-pf-field">
                <label className="add-pf-label">Sheet Range</label>
                <input
                  className="add-pf-input"
                  type="text"
                  value={sheetRange}
                  onChange={(e) => setSheetRange(e.target.value)}
                  placeholder="A2:J1001"
                />
                <p className="add-pf-field-note">Only columns A (ticker), B (qty) and J (cost price) are used.</p>
              </div>
            </>
          )}

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
            disabled={!name.trim() || (source === 'sheets' && (!sheetUrl.trim() || !sheetName.trim()))}
          >
            Create Portfolio
          </button>
        </form>
      </div>
    </div>
  );
}
