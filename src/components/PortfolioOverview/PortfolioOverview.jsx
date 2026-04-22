import React from 'react';
import SummaryCards from './SummaryCards';
import PortfolioList from './PortfolioList';
import { calcGrandTotals } from '../../utils/calculations';
import { formatCurrency, formatPercent, getArrow, getPnLClass } from '../../utils/formatters';
import { HeaderSkeleton, SummaryCardsSkeleton, PortfolioListSkeleton } from '../SkeletonLoader/SkeletonLoader';
import './PortfolioOverview.css';

export default function PortfolioOverview({
  portfolios,
  stocks,
  onSelectPortfolio,
  onAddPortfolio,
  loading,
  priceStatus,
  onRefresh,
  displayName,
  onLogout,
}) {
  // Build portfolio → stocks map for grand totals
  const portfolioStocksMap = {};
  portfolios.forEach((pf) => {
    portfolioStocksMap[pf.id] = pf.stockTickers
      .map((t) => stocks[t])
      .filter(Boolean);
  });

  const grandTotals = calcGrandTotals(portfolioStocksMap);
  const pnlClass = getPnLClass(grandTotals.grandDayGain);

  if (loading) {
    return (
      <div className="portfolio-overview">
        <HeaderSkeleton />
        <SummaryCardsSkeleton />
        <PortfolioListSkeleton />
      </div>
    );
  }

  return (
    <div className="portfolio-overview">
      {/* ── Header ── */}
      <div className="overview-header fade-in">
        <div className="overview-header-top">
          <div className="overview-header-greeting">
            <span className="overview-header-label">{displayName ? `Hi, ${displayName}` : 'My Portfolio'}</span>
            <div className={`overview-header-live ${priceStatus === 'live' ? '' : priceStatus === 'stale' ? 'stale' : ''}`}>
              <span className={`live-dot ${priceStatus !== 'live' ? 'stale' : ''}`} />
              <span className="live-text">
                {priceStatus === 'live' ? 'Live' : priceStatus === 'stale' ? 'Stale' : priceStatus === 'error' ? 'Offline' : 'Loading'}
              </span>
            </div>
          </div>
          <div className="overview-header-actions">
            <button className="overview-refresh-btn pressable" onClick={onRefresh} title="Refresh prices">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15 3V7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 15V11H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.51 6.5A6 6 0 0114.13 4.37L15 7M2.87 13.63A6 6 0 0014.49 11.5L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="overview-logout-btn pressable" onClick={onLogout} title="Logout">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M6.5 15.5H3.5A1 1 0 012.5 14.5V3.5A1 1 0 013.5 2.5H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M12 12.5L15.5 9L12 5.5M6 9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overview-header-value tabular-nums count-pulse">
          {formatCurrency(grandTotals.grandCurrentValue)}
        </div>

        <div className={`overview-header-change ${pnlClass}`}>
          <span className={`pill ${pnlClass}`}>
            {getArrow(grandTotals.grandDayGain)}{' '}
            {formatCurrency(Math.abs(grandTotals.grandDayGain))}{' '}
            ({formatPercent(grandTotals.dayGainPct, false)})
          </span>
          <span className="overview-header-change-label">today</span>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <SummaryCards totals={grandTotals} />

      {/* ── Portfolio List ── */}
      <PortfolioList
        portfolios={portfolios}
        stocks={stocks}
        onSelectPortfolio={onSelectPortfolio}
        onAddPortfolio={onAddPortfolio}
      />

      <div style={{ height: '40px' }} />
    </div>
  );
}
