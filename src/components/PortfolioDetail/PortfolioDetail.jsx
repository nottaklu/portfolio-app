import React, { useState } from 'react';
import TileView from './TileView';
import RowView from './RowView';
import ViewToggle from '../common/ViewToggle';
import { calcPortfolioTotals, sortStocks } from '../../utils/calculations';
import { formatCurrency, formatPercent, getPnLClass, getArrow } from '../../utils/formatters';
import { TileViewSkeleton, RowViewSkeleton } from '../SkeletonLoader/SkeletonLoader';
import './PortfolioDetail.css';

export default function PortfolioDetail({
  portfolio,
  stocks,
  onBack,
  onStockClick,
  onOpenSort,
  onAddStock,
  sortBy,
  loading,
  tickerPortfolioMap, // Only for "All Portfolios" view
}) {
  const [view, setView] = useState('tile');

  const rawStocks = portfolio.stockTickers
    .map((t) => stocks[t])
    .filter(Boolean);
  const sortedStocks = sortBy ? sortStocks(rawStocks, sortBy) : rawStocks;
  const totals = calcPortfolioTotals(rawStocks);
  const pnlClass = getPnLClass(totals.totalPnL);
  const isAllView = portfolio.id === '__all__';

  return (
    <div className="portfolio-detail screen-enter">
      {/* ── Top Bar ── */}
      <div className="detail-top-bar">
        <button className="detail-back-btn pressable" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="detail-top-title">
          <div
            className="detail-top-dot"
            style={{ backgroundColor: portfolio.color }}
          />
          <h1 className="detail-top-name">{portfolio.name}</h1>
        </div>

        <div className="detail-top-actions">
          <button className="detail-sort-btn pressable" onClick={onOpenSort}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17M6 10H14M9 15H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <ViewToggle view={view} onToggle={setView} />
        </div>
      </div>

      {/* ── Summary Strip ── */}
      <div className="detail-summary-strip">
        <div className="detail-summary-value-row">
          <span className="detail-summary-big tabular-nums">
            {formatCurrency(totals.totalCurrentValue)}
          </span>
          <span className={`pill ${pnlClass}`}>
            {getArrow(totals.totalPnL)} {formatPercent(totals.totalPnLPct)}
          </span>
        </div>

        <div className="detail-summary-metrics">
          <div className="detail-summary-metric">
            <span className="detail-summary-metric-label">Invested</span>
            <span className="detail-summary-metric-value tabular-nums">
              {formatCurrency(totals.totalInvested)}
            </span>
          </div>
          <div className="detail-summary-metric-divider" />
          <div className="detail-summary-metric">
            <span className="detail-summary-metric-label">P&L</span>
            <span className={`detail-summary-metric-value tabular-nums ${pnlClass}`}>
              {formatCurrency(totals.totalPnL, true)}
            </span>
          </div>
          <div className="detail-summary-metric-divider" />
          <div className="detail-summary-metric">
            <span className="detail-summary-metric-label">Day</span>
            <span className={`detail-summary-metric-value tabular-nums ${getPnLClass(totals.totalDayGain)}`}>
              {formatCurrency(totals.totalDayGain, true)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stock Views ── */}
      <div className="detail-stocks-section">
        <div className="detail-stocks-header">
          <span className="detail-stocks-count">
            {sortedStocks.length} stock{sortedStocks.length !== 1 ? 's' : ''}
          </span>
          <div className="detail-stocks-header-right">
            {sortBy && (
              <span className="detail-sort-active">
                {sortBy === 'alpha' ? 'A-Z' : sortBy === 'dayGainPct' ? 'Day %' : sortBy === 'totalPnLPct' ? 'P&L %' : sortBy === 'currentValue' ? 'Value' : 'Invested'}
              </span>
            )}
            {onAddStock && (
              <button className="detail-add-stock-btn pressable" onClick={onAddStock}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          view === 'tile' ? <TileViewSkeleton /> : <RowViewSkeleton />
        ) : sortedStocks.length === 0 ? (
          <div className="detail-empty-state">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
              <path d="M14 24H34M24 18V30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p>{isAllView ? 'No stocks in any portfolio yet' : 'No stocks in this portfolio yet'}</p>
            {!isAllView && onAddStock && (
              <button className="detail-empty-add-btn pressable" onClick={onAddStock}>
                Add your first stock
              </button>
            )}
          </div>
        ) : view === 'tile' ? (
          <TileView stocks={sortedStocks} onStockClick={onStockClick} tickerPortfolioMap={tickerPortfolioMap} />
        ) : (
          <RowView stocks={sortedStocks} onStockClick={onStockClick} tickerPortfolioMap={tickerPortfolioMap} />
        )}
      </div>

      <div style={{ height: '40px' }} />
    </div>
  );
}
