import React from 'react';
import { formatCurrency, formatPercent, getPnLClass, getArrow } from '../../utils/formatters';
import { calcPortfolioTotals } from '../../utils/calculations';
import './PortfolioList.css';

export default function PortfolioList({ portfolios, stocks, onSelectPortfolio, onAddPortfolio }) {
  return (
    <div className="portfolio-list">
      <div className="portfolio-list-header">
        <h2 className="portfolio-list-title">My Portfolios</h2>
        <span className="portfolio-list-count">{portfolios.length} portfolios</span>
      </div>

      <div className="portfolio-list-items">
        {portfolios.map((pf, i) => {
          const pfStocks = pf.stockTickers
            .map((t) => stocks[t])
            .filter(Boolean);
          const totals = calcPortfolioTotals(pfStocks);
          const pnlClass = getPnLClass(totals.totalPnL);

          return (
            <button
              key={pf.id}
              className={`portfolio-card pressable fade-in stagger-${i + 3}`}
              onClick={() => onSelectPortfolio(pf)}
            >
              <div
                className="portfolio-card-strip"
                style={{ backgroundColor: pf.color }}
              />
              <div className="portfolio-card-content">
                <div className="portfolio-card-top">
                  <div className="portfolio-card-name-row">
                    <div
                      className="portfolio-card-dot"
                      style={{ backgroundColor: pf.color }}
                    />
                    <h3 className="portfolio-card-name">{pf.name}</h3>
                    <span className="portfolio-card-type-badge">
                      {pf.type === 'manual' ? 'MANUAL' : 'SHEETS'}
                    </span>
                  </div>
                  <svg
                    className="portfolio-card-arrow"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M7.5 5L12.5 10L7.5 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="portfolio-card-value tabular-nums">
                  {formatCurrency(totals.totalCurrentValue)}
                </div>

                <div className="portfolio-card-details">
                  <div className="portfolio-card-detail">
                    <span className="portfolio-card-detail-label">Invested</span>
                    <span className="portfolio-card-detail-value tabular-nums">
                      {formatCurrency(totals.totalInvested)}
                    </span>
                  </div>
                  <div className="portfolio-card-detail">
                    <span className="portfolio-card-detail-label">P&L</span>
                    <span className={`portfolio-card-detail-value tabular-nums ${pnlClass}`}>
                      {getArrow(totals.totalPnL)} {formatPercent(totals.totalPnLPct)}
                    </span>
                  </div>
                  <div className="portfolio-card-detail">
                    <span className="portfolio-card-detail-label">Stocks</span>
                    <span className="portfolio-card-detail-value">
                      {pf.stockTickers.length}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* Add Portfolio Button */}
        <button className="add-portfolio-btn pressable fade-in" onClick={onAddPortfolio}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
            <path d="M11 7V15M7 11H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Add Portfolio</span>
        </button>
      </div>
    </div>
  );
}
