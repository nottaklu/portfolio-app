import React, { useState } from 'react';
import SummaryCards from './SummaryCards';
import PortfolioList from './PortfolioList';
import { calcGrandTotals } from '../../utils/calculations';
import { formatCurrency, formatPercent, getArrow, getPnLClass } from '../../utils/formatters';
import { HeaderSkeleton, SummaryCardsSkeleton, PortfolioListSkeleton } from '../SkeletonLoader/SkeletonLoader';
import './PortfolioOverview.css';

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const initial = displayValue;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setDisplayValue(initial + (value - initial) * easeProgress);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return formatCurrency(displayValue);
}

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Build portfolio → stocks map for grand totals
  const portfolioStocksMap = {};
  portfolios.forEach((pf) => {
    if (pf.id === '__all__') return; // skip "All" for calculation
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
          <h1 className="overview-header-name">
            {displayName ? `Hi, ${displayName}` : 'My Portfolio'}
          </h1>
          <button
            className="overview-logout-btn pressable"
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 14l4-4-4-4M7 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="overview-header-value tabular-nums count-pulse">
          <AnimatedNumber value={grandTotals.grandCurrentValue} />
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

      <div style={{ height: '100px' }} /> {/* spacing for bottom nav */}

      {/* ── Logout Confirmation ── */}
      {showLogoutConfirm && (
        <div className="logout-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 17l5-5-5-5M8 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="logout-modal-title">Sign Out?</h3>
            <p className="logout-modal-text">You'll need your username and password to sign back in.</p>
            <div className="logout-modal-actions">
              <button className="logout-cancel-btn pressable" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="logout-confirm-btn pressable" onClick={onLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
