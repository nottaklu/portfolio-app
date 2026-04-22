import React, { useState } from 'react';
import { calcStockMetrics } from '../../utils/calculations';
import { formatCurrency, formatCurrencyDecimal, formatPercent, getArrow, getPnLClass } from '../../utils/formatters';
import './TileView.css';

const CYCLE_LABELS = ['Day Gain', 'Total P&L', 'Current Value'];

function StockTile({ stock, onClick, portfolioIndicators }) {
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

  const getCycleData = () => {
    switch (cycleIndex) {
      case 0:
        return {
          label: 'Day Gain',
          value: formatCurrency(metrics.dayGainValue, true),
          sub: formatPercent(metrics.dayChangePct),
          className: getPnLClass(metrics.dayGainValue),
        };
      case 1:
        return {
          label: 'Total P&L',
          value: formatCurrency(metrics.totalPnL, true),
          sub: formatPercent(metrics.totalPnLPct),
          className: getPnLClass(metrics.totalPnL),
        };
      case 2:
        return {
          label: 'Current Value',
          value: formatCurrency(metrics.currentValue),
          sub: '',
          className: '',
        };
      default:
        return {};
    }
  };

  const cycleData = getCycleData();

  return (
    <div
      className={`stock-tile pressable fade-in`}
      onClick={() => onClick(stock)}
    >
      {/* Color strip */}
      <div
        className="stock-tile-strip"
        style={{ backgroundColor: pnlClass === 'positive' ? 'var(--green)' : pnlClass === 'negative' ? 'var(--red)' : 'var(--border-color)' }}
      />

      {/* Cycling data area */}
      <button className="stock-tile-cycle" onClick={handleCycle}>
        <div className={`stock-tile-cycle-content ${animating ? '' : 'cycle-enter'}`}>
          <span className="stock-tile-cycle-label">{cycleData.label}</span>
          <span className={`stock-tile-cycle-value tabular-nums ${cycleData.className}`}>
            {getArrow(cycleIndex === 2 ? 0 : (cycleIndex === 0 ? metrics.dayGainValue : metrics.totalPnL))}{' '}
            {cycleData.value}
          </span>
          {cycleData.sub && (
            <span className={`stock-tile-cycle-sub tabular-nums ${cycleData.className}`}>
              {cycleData.sub}
            </span>
          )}
        </div>
        {/* Dot indicators */}
        <div className="stock-tile-dots">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className={`stock-tile-dot ${d === cycleIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </button>

      {/* Stock name */}
      <div className="stock-tile-name">{stock.ticker}</div>
      <div className="stock-tile-fullname">{stock.name}</div>

      {/* Live price */}
      <div className="stock-tile-price tabular-nums">
        {formatCurrencyDecimal(stock.currentPrice)}
      </div>

      {/* Bottom: Qty + Avg */}
      <div className="stock-tile-bottom">
        <div className="stock-tile-meta">
          <span className="stock-tile-meta-label">Qty</span>
          <span className="stock-tile-meta-value tabular-nums">{stock.qty}</span>
        </div>
        <div className="stock-tile-meta">
          <span className="stock-tile-meta-label">Avg</span>
          <span className="stock-tile-meta-value tabular-nums">
            {formatCurrencyDecimal(stock.avgPrice)}
          </span>
        </div>
      </div>
      {/* Portfolio indicator for All view */}
      {portfolioIndicators && portfolioIndicators.length > 0 && (
        <div className="stock-tile-pf-tags">
          {portfolioIndicators.map((pf, i) => (
            <span key={i} className="stock-tile-pf-dot" style={{ background: pf.color }} title={pf.name} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TileView({ stocks, onStockClick, tickerPortfolioMap }) {
  return (
    <div className="tile-view-grid">
      {stocks.map((stock, i) => (
        <div key={stock.ticker} className={`stagger-${(i % 6) + 1}`}>
          <StockTile
            stock={stock}
            onClick={onStockClick}
            portfolioIndicators={tickerPortfolioMap ? tickerPortfolioMap[stock.ticker] : null}
          />
        </div>
      ))}
    </div>
  );
}
