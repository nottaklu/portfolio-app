import React, { useMemo } from 'react';
import { formatCurrency, formatPercent, getArrow, getPnLClass } from '../../utils/formatters';
import './Dashboard.css';

export default function Dashboard({ stocks, portfolios, displayName, onLogout }) {
  // Get all stocks as array
  const allStocks = useMemo(() => {
    return Object.values(stocks).filter((s) => s.currentPrice > 0);
  }, [stocks]);

  // Ticker tape data — all stocks with day change
  const tickerData = useMemo(() => {
    return allStocks.map((s) => ({
      ticker: s.ticker,
      price: s.currentPrice,
      change: s.currentPrice - (s.previousClose || s.currentPrice),
      changePct: s.previousClose ? ((s.currentPrice - s.previousClose) / s.previousClose) * 100 : 0,
    }));
  }, [allStocks]);

  // Top gainers (by day change %)
  const topGainers = useMemo(() => {
    return [...allStocks]
      .filter((s) => s.previousClose && s.currentPrice > s.previousClose)
      .sort((a, b) => {
        const aPct = ((a.currentPrice - a.previousClose) / a.previousClose) * 100;
        const bPct = ((b.currentPrice - b.previousClose) / b.previousClose) * 100;
        return bPct - aPct;
      })
      .slice(0, 3);
  }, [allStocks]);

  // Top losers (by day change %)
  const topLosers = useMemo(() => {
    return [...allStocks]
      .filter((s) => s.previousClose && s.currentPrice < s.previousClose)
      .sort((a, b) => {
        const aPct = ((a.currentPrice - a.previousClose) / a.previousClose) * 100;
        const bPct = ((b.currentPrice - b.previousClose) / b.previousClose) * 100;
        return aPct - bPct;
      })
      .slice(0, 3);
  }, [allStocks]);

  // Best overall P&L
  const bestPnL = useMemo(() => {
    return [...allStocks]
      .filter((s) => s.avgPrice > 0)
      .sort((a, b) => {
        const aPct = ((a.currentPrice - a.avgPrice) / a.avgPrice) * 100;
        const bPct = ((b.currentPrice - b.avgPrice) / b.avgPrice) * 100;
        return bPct - aPct;
      })
      .slice(0, 3);
  }, [allStocks]);

  // Worst overall P&L
  const worstPnL = useMemo(() => {
    return [...allStocks]
      .filter((s) => s.avgPrice > 0)
      .sort((a, b) => {
        const aPct = ((a.currentPrice - a.avgPrice) / a.avgPrice) * 100;
        const bPct = ((b.currentPrice - b.avgPrice) / b.avgPrice) * 100;
        return aPct - bPct;
      })
      .slice(0, 3);
  }, [allStocks]);

  // Total invested & current
  const totals = useMemo(() => {
    const invested = allStocks.reduce((sum, s) => sum + (s.avgPrice * s.qty), 0);
    const current = allStocks.reduce((sum, s) => sum + (s.currentPrice * s.qty), 0);
    return { invested, current, pnl: current - invested };
  }, [allStocks]);

  return (
    <div className="dashboard">
      <div className="dashboard-header fade-in">
        <h1 className="dashboard-title">Dashboard</h1>
      </div>



      {/* ── Overview Tile ── */}
      <div className="dashboard-grid fade-in">
        <div className="dash-tile dash-tile-wide">
          <div className="dash-tile-header">
            <div className="dash-tile-icon gradient-purple">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 14L7 9L10 12L15 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 4H15V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="dash-tile-label">Overall P&L</span>
          </div>
          <div className={`dash-tile-value tabular-nums ${getPnLClass(totals.pnl)}`}>
            {getArrow(totals.pnl)} {formatCurrency(Math.abs(totals.pnl))}
          </div>
          <div className="dash-tile-meta">
            <span>Invested: {formatCurrency(totals.invested)}</span>
            <span>Current: {formatCurrency(totals.current)}</span>
          </div>
        </div>

        {/* ── Top Gainers ── */}
        <div className="dash-tile">
          <div className="dash-tile-header">
            <div className="dash-tile-icon gradient-green">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 12V4M5 6.5L8 3.5L11 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="dash-tile-label">Top Gainers</span>
          </div>
          <div className="dash-tile-list">
            {topGainers.length > 0 ? topGainers.map((s) => {
              const pct = ((s.currentPrice - s.previousClose) / s.previousClose) * 100;
              return (
                <div key={s.ticker} className="dash-stock-row">
                  <span className="dash-stock-name">{s.ticker}</span>
                  <span className="dash-stock-change positive tabular-nums">+{pct.toFixed(2)}%</span>
                </div>
              );
            }) : <div className="dash-empty">No gainers today</div>}
          </div>
        </div>

        {/* ── Top Losers ── */}
        <div className="dash-tile">
          <div className="dash-tile-header">
            <div className="dash-tile-icon gradient-red">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4V12M5 9.5L8 12.5L11 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="dash-tile-label">Top Losers</span>
          </div>
          <div className="dash-tile-list">
            {topLosers.length > 0 ? topLosers.map((s) => {
              const pct = ((s.currentPrice - s.previousClose) / s.previousClose) * 100;
              return (
                <div key={s.ticker} className="dash-stock-row">
                  <span className="dash-stock-name">{s.ticker}</span>
                  <span className="dash-stock-change negative tabular-nums">{pct.toFixed(2)}%</span>
                </div>
              );
            }) : <div className="dash-empty">No losers today</div>}
          </div>
        </div>

        {/* ── Best Holdings ── */}
        <div className="dash-tile">
          <div className="dash-tile-header">
            <div className="dash-tile-icon gradient-blue">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 14L6 8L9 11L14 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="dash-tile-label">Best Holdings</span>
          </div>
          <div className="dash-tile-list">
            {bestPnL.length > 0 ? bestPnL.map((s) => {
              const pct = ((s.currentPrice - s.avgPrice) / s.avgPrice) * 100;
              return (
                <div key={s.ticker} className="dash-stock-row">
                  <span className="dash-stock-name">{s.ticker}</span>
                  <span className={`dash-stock-change tabular-nums ${getPnLClass(pct)}`}>
                    {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
                  </span>
                </div>
              );
            }) : <div className="dash-empty">Add stocks to see</div>}
          </div>
        </div>

        {/* ── Worst Holdings ── */}
        <div className="dash-tile">
          <div className="dash-tile-header">
            <div className="dash-tile-icon gradient-amber">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5V9M8 11V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="dash-tile-label">Worst Holdings</span>
          </div>
          <div className="dash-tile-list">
            {worstPnL.length > 0 ? worstPnL.map((s) => {
              const pct = ((s.currentPrice - s.avgPrice) / s.avgPrice) * 100;
              return (
                <div key={s.ticker} className="dash-stock-row">
                  <span className="dash-stock-name">{s.ticker}</span>
                  <span className={`dash-stock-change tabular-nums ${getPnLClass(pct)}`}>
                    {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
                  </span>
                </div>
              );
            }) : <div className="dash-empty">Add stocks to see</div>}
          </div>
        </div>
      </div>

      <div style={{ height: '100px' }} />
    </div>
  );
}
