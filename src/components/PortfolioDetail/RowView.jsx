import React, { useState } from 'react';
import { calcStockMetrics } from '../../utils/calculations';
import { formatCurrency, formatCurrencyDecimal, formatPercent, getArrow, getPnLClass } from '../../utils/formatters';
import './RowView.css';

function StockRow({ stock, onClick, index }) {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const metrics = calcStockMetrics(stock);
  const pnlClass = getPnLClass(metrics.totalPnL);

  const handleCycle = (e) => {
    e.stopPropagation();
    setAnimating(true);
    setTimeout(() => {
      setCycleIndex((prev) => (prev + 1) % 3);
      setAnimating(false);
    }, 100);
  };

  const getCycleDisplay = () => {
    switch (cycleIndex) {
      case 0:
        return {
          value: formatCurrency(metrics.dayGainValue, true),
          pct: formatPercent(metrics.dayChangePct),
          className: getPnLClass(metrics.dayGainValue),
          label: 'Day',
        };
      case 1:
        return {
          value: formatCurrency(metrics.totalPnL, true),
          pct: formatPercent(metrics.totalPnLPct),
          className: getPnLClass(metrics.totalPnL),
          label: 'P&L',
        };
      case 2:
        return {
          value: formatCurrency(metrics.currentValue),
          pct: '',
          className: '',
          label: 'Value',
        };
      default:
        return {};
    }
  };

  const cycleDisplay = getCycleDisplay();

  return (
    <div
      className={`stock-row pressable fade-in stagger-${(index % 8) + 1}`}
      onClick={() => onClick(stock)}
    >
      {/* Left strip */}
      <div
        className="stock-row-strip"
        style={{ backgroundColor: pnlClass === 'positive' ? 'var(--green)' : pnlClass === 'negative' ? 'var(--red)' : 'var(--border-color)' }}
      />

      {/* Info — no avatar */}
      <div className="stock-row-info">
        <div className="stock-row-name-row">
          <span className="stock-row-name">{stock.name}</span>
          <span className="stock-row-ticker">{stock.ticker}</span>
        </div>
        <div className="stock-row-meta-row">
          <span className="stock-row-qty">{stock.qty} shares</span>
          <span className="stock-row-separator">·</span>
          <span className="stock-row-avg tabular-nums">Avg {formatCurrencyDecimal(stock.avgPrice)}</span>
        </div>
      </div>

      {/* Right side — cycleable */}
      <button className="stock-row-right" onClick={handleCycle}>
        <div className={`stock-row-price tabular-nums ${animating ? '' : 'cycle-enter'}`}>
          {formatCurrencyDecimal(stock.currentPrice)}
        </div>
        <div className={`stock-row-pnl-pill ${cycleDisplay.className} ${animating ? '' : 'cycle-enter'}`}>
          <span className="stock-row-pnl-label">{cycleDisplay.label}</span>
          <span className="tabular-nums">
            {getArrow(cycleIndex === 2 ? 0 : (cycleIndex === 0 ? metrics.dayGainValue : metrics.totalPnL))}{' '}
            {cycleDisplay.pct || cycleDisplay.value}
          </span>
        </div>
        {/* Mini dots */}
        <div className="stock-row-dots">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className={`stock-row-dot ${d === cycleIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </button>
    </div>
  );
}

export default function RowView({ stocks, onStockClick }) {
  return (
    <div className="row-view-list">
      {stocks.map((stock, i) => (
        <StockRow
          key={stock.ticker}
          stock={stock}
          onClick={onStockClick}
          index={i}
        />
      ))}
    </div>
  );
}
