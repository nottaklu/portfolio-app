import React, { useState, useEffect, useRef } from 'react';
import { calcStockMetrics } from '../../utils/calculations';
import { formatCurrency, formatCurrencyDecimal, formatPercent, getArrow, getPnLClass, getInitials } from '../../utils/formatters';
import { SECTOR_COLORS } from '../../data/mockData';
import './StockModal.css';

export default function StockModal({ stock, onClose, onEditStock, onRemoveStock, portfolioId }) {
  const [isVisible, setIsVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editQty, setEditQty] = useState('');
  const [editAvg, setEditAvg] = useState('');
  const overlayRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const handleStartEdit = () => {
    setEditQty(String(stock.qty));
    setEditAvg(String(stock.avgPrice));
    setEditing(true);
  };

  const handleSaveEdit = () => {
    const newQty = parseInt(editQty);
    const newAvg = parseFloat(editAvg);
    if (newQty > 0 && newAvg > 0 && onEditStock) {
      onEditStock(stock.ticker, newQty, newAvg);
    }
    setEditing(false);
  };

  const handleRemove = () => {
    if (onRemoveStock && confirm('Remove this stock from the portfolio?')) {
      onRemoveStock(stock.ticker);
      handleClose();
    }
  };

  if (!stock) return null;

  const metrics = calcStockMetrics(stock);
  const pnlClass = getPnLClass(metrics.totalPnL);
  const dayClass = getPnLClass(metrics.dayGainValue);
  const sectorColor = SECTOR_COLORS[stock.sector] || '#6B7280';

  return (
    <div
      className={`stock-modal-overlay ${isVisible ? 'visible' : ''}`}
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className={`stock-modal ${isVisible ? 'visible' : ''}`}>
        <div className="stock-modal-handle-bar">
          <div className="stock-modal-handle" />
        </div>

        <div className="stock-modal-scroll">
          {/* ── Header ── */}
          <div className="stock-modal-header">
            <div className="stock-modal-header-left">
              <div
                className="stock-modal-avatar"
                style={{ backgroundColor: sectorColor + '18', color: sectorColor }}
              >
                {getInitials(stock.name)}
              </div>
              <div>
                <h2 className="stock-modal-name">{stock.name}</h2>
                <div className="stock-modal-ticker-row">
                  <span className="stock-modal-ticker">{stock.ticker}</span>
                  <span className="sector-badge" style={{ backgroundColor: sectorColor + '18', color: sectorColor }}>
                    {stock.sector}
                  </span>
                </div>
              </div>
            </div>
            <button className="stock-modal-close pressable" onClick={handleClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* ── Price Section ── */}
          <div className="stock-modal-price-section">
            <div className="stock-modal-price tabular-nums">
              {formatCurrencyDecimal(stock.currentPrice)}
            </div>
            <div className={`stock-modal-day-badge ${dayClass}`}>
              {getArrow(metrics.dayGainValue)} {formatCurrency(Math.abs(metrics.dayGainValue))}{' '}
              ({formatPercent(metrics.dayChangePct, false)})
            </div>
          </div>

          {/* ── Metrics Grid ── */}
          <div className="stock-modal-metrics">
            <div className="stock-modal-metric">
              <span className="stock-modal-metric-label">Qty</span>
              <span className="stock-modal-metric-value tabular-nums">{stock.qty}</span>
            </div>
            <div className="stock-modal-metric">
              <span className="stock-modal-metric-label">Avg Price</span>
              <span className="stock-modal-metric-value tabular-nums">{formatCurrencyDecimal(stock.avgPrice)}</span>
            </div>
            <div className="stock-modal-metric">
              <span className="stock-modal-metric-label">Invested</span>
              <span className="stock-modal-metric-value tabular-nums">{formatCurrency(metrics.invested)}</span>
            </div>
            <div className="stock-modal-metric">
              <span className="stock-modal-metric-label">Current Value</span>
              <span className="stock-modal-metric-value tabular-nums">{formatCurrency(metrics.currentValue)}</span>
            </div>
            <div className="stock-modal-metric">
              <span className="stock-modal-metric-label">Total P&L</span>
              <span className={`stock-modal-metric-value tabular-nums ${pnlClass}`}>
                {getArrow(metrics.totalPnL)} {formatCurrency(metrics.totalPnL, true)}
              </span>
            </div>
            <div className="stock-modal-metric">
              <span className="stock-modal-metric-label">Return %</span>
              <span className={`stock-modal-metric-value tabular-nums ${pnlClass}`}>
                {formatPercent(metrics.totalPnLPct)}
              </span>
            </div>
          </div>

          {/* ── Day Range ── */}
          {(stock.dayHigh > 0 || stock.dayLow > 0) && (
            <div className="stock-modal-range-section">
              <span className="stock-modal-section-title">Day Range</span>
              <div className="stock-modal-range-bar">
                <span className="stock-modal-range-label tabular-nums">{formatCurrencyDecimal(stock.dayLow)}</span>
                <div className="stock-modal-range-track">
                  <div
                    className="stock-modal-range-fill"
                    style={{
                      width: stock.dayHigh > stock.dayLow
                        ? `${((stock.currentPrice - stock.dayLow) / (stock.dayHigh - stock.dayLow)) * 100}%`
                        : '50%',
                    }}
                  />
                  <div
                    className="stock-modal-range-dot"
                    style={{
                      left: stock.dayHigh > stock.dayLow
                        ? `${((stock.currentPrice - stock.dayLow) / (stock.dayHigh - stock.dayLow)) * 100}%`
                        : '50%',
                    }}
                  />
                </div>
                <span className="stock-modal-range-label tabular-nums">{formatCurrencyDecimal(stock.dayHigh)}</span>
              </div>
            </div>
          )}

          {/* ── 52 Week Range ── */}
          {(stock.fiftyTwoWeekHigh > 0 || stock.fiftyTwoWeekLow > 0) && (
            <div className="stock-modal-range-section">
              <span className="stock-modal-section-title">52 Week Range</span>
              <div className="stock-modal-range-bar">
                <span className="stock-modal-range-label tabular-nums">{formatCurrencyDecimal(stock.fiftyTwoWeekLow)}</span>
                <div className="stock-modal-range-track">
                  <div
                    className="stock-modal-range-fill"
                    style={{
                      width: stock.fiftyTwoWeekHigh > stock.fiftyTwoWeekLow
                        ? `${((stock.currentPrice - stock.fiftyTwoWeekLow) / (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow)) * 100}%`
                        : '50%',
                    }}
                  />
                  <div
                    className="stock-modal-range-dot"
                    style={{
                      left: stock.fiftyTwoWeekHigh > stock.fiftyTwoWeekLow
                        ? `${((stock.currentPrice - stock.fiftyTwoWeekLow) / (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow)) * 100}%`
                        : '50%',
                    }}
                  />
                </div>
                <span className="stock-modal-range-label tabular-nums">{formatCurrencyDecimal(stock.fiftyTwoWeekHigh)}</span>
              </div>
            </div>
          )}

          {/* ── Transaction / Edit Section ── */}
          <div className="stock-modal-transactions">
            <div className="stock-modal-tx-header">
              <span className="stock-modal-section-title">Transaction</span>
              {!editing && onEditStock && (
                <button className="stock-modal-edit-btn pressable" onClick={handleStartEdit}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M8.5 2.5l3 3M2 9l5.5-5.5 3 3L5 12H2V9z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="stock-modal-edit-form">
                <div className="stock-modal-edit-field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    min="1"
                    className="stock-modal-edit-input"
                  />
                </div>
                <div className="stock-modal-edit-field">
                  <label>Avg Buy Price</label>
                  <input
                    type="number"
                    value={editAvg}
                    onChange={(e) => setEditAvg(e.target.value)}
                    min="0"
                    step="0.01"
                    className="stock-modal-edit-input"
                  />
                </div>
                <div className="stock-modal-edit-actions">
                  <button className="stock-modal-cancel-btn pressable" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button className="stock-modal-save-btn pressable" onClick={handleSaveEdit}>
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="stock-modal-tx-list">
                <div className="stock-modal-tx-row">
                  <div className="stock-modal-tx-left">
                    <span className="stock-modal-tx-type buy">BUY</span>
                    <span className="stock-modal-tx-date">Manual entry</span>
                  </div>
                  <div className="stock-modal-tx-right">
                    <span className="stock-modal-tx-qty tabular-nums">{stock.qty} x {formatCurrencyDecimal(stock.avgPrice)}</span>
                    <span className="stock-modal-tx-total tabular-nums">{formatCurrency(stock.qty * stock.avgPrice)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Remove Stock Button ── */}
          {onRemoveStock && (
            <div className="stock-modal-remove-section">
              <button className="stock-modal-remove-btn pressable" onClick={handleRemove}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M13 4v9a1 1 0 01-1 1H4a1 1 0 01-1-1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M6.5 7v4M9.5 7v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                Remove Stock
              </button>
            </div>
          )}

          <div style={{ height: '40px' }} />
        </div>
      </div>
    </div>
  );
}
