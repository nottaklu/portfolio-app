import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { calcStockMetrics } from '../../utils/calculations';
import { formatCurrency, formatCurrencyDecimal, formatPercent, getArrow, getPnLClass, formatDate, getInitials } from '../../utils/formatters';
import { TRANSACTIONS, PRICE_HISTORY, SECTOR_COLORS } from '../../data/mockData';
import './StockModal.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const TIME_RANGES = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
];

export default function StockModal({ stock, onClose }) {
  const [timeRange, setTimeRange] = useState('3M');
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    // Delay to trigger slide-up animation
    requestAnimationFrame(() => setIsVisible(true));
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  if (!stock) return null;

  const metrics = calcStockMetrics(stock);
  const pnlClass = getPnLClass(metrics.totalPnL);
  const dayClass = getPnLClass(metrics.dayGainValue);
  const sectorColor = SECTOR_COLORS[stock.sector] || '#6B7280';
  const transactions = TRANSACTIONS[stock.ticker] || [];

  // Chart data
  const rangeDays = TIME_RANGES.find((r) => r.label === timeRange)?.days || 90;
  const history = (PRICE_HISTORY[stock.ticker] || []).slice(-rangeDays);
  const chartLabels = history.map((h) => h.date);
  const chartPrices = history.map((h) => h.price);
  const isPositive = chartPrices.length > 1 && chartPrices[chartPrices.length - 1] >= chartPrices[0];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartPrices,
        borderColor: isPositive ? '#22C55E' : '#EF4444',
        backgroundColor: isPositive
          ? 'rgba(34, 197, 94, 0.08)'
          : 'rgba(239, 68, 68, 0.08)',
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 10,
        tension: 0.4,
        fill: true,
      },
      // Avg buy price line
      {
        data: Array(chartLabels.length).fill(stock.avgPrice),
        borderColor: '#9CA3AF',
        borderWidth: 1,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        backgroundColor: '#1C1F2A',
        titleColor: '#FFF',
        bodyColor: '#FFF',
        titleFont: { family: 'Inter', size: 11 },
        bodyFont: { family: 'Inter', size: 13, weight: 600 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (ctx) => {
            const date = new Date(ctx[0].label);
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          },
          label: (ctx) => {
            if (ctx.datasetIndex === 1) return `Avg: ₹${ctx.raw.toLocaleString('en-IN')}`;
            return `₹${ctx.raw.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  return (
    <div
      className={`stock-modal-overlay ${isVisible ? 'visible' : ''}`}
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className={`stock-modal ${isVisible ? 'visible' : ''}`}>
        {/* Drag handle */}
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

          {/* ── Chart ── */}
          <div className="stock-modal-chart-section">
            <div className="stock-modal-chart-header">
              <span className="stock-modal-chart-title">Price History</span>
              <div className="stock-modal-time-tabs">
                {TIME_RANGES.map((r) => (
                  <button
                    key={r.label}
                    className={`stock-modal-time-tab ${timeRange === r.label ? 'active' : ''}`}
                    onClick={() => setTimeRange(r.label)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="stock-modal-chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="stock-modal-chart-legend">
              <span className="stock-modal-chart-legend-item">
                <span className="stock-modal-chart-legend-line" style={{ borderColor: '#9CA3AF', borderStyle: 'dashed' }} />
                Avg Buy: {formatCurrencyDecimal(stock.avgPrice)}
              </span>
            </div>
          </div>

          {/* ── 52 Week Range ── */}
          <div className="stock-modal-range-section">
            <span className="stock-modal-section-title">52 Week Range</span>
            <div className="stock-modal-range-bar">
              <span className="stock-modal-range-label tabular-nums">{formatCurrencyDecimal(stock.fiftyTwoWeekLow)}</span>
              <div className="stock-modal-range-track">
                <div
                  className="stock-modal-range-fill"
                  style={{
                    width: `${((stock.currentPrice - stock.fiftyTwoWeekLow) / (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow)) * 100}%`,
                  }}
                />
                <div
                  className="stock-modal-range-dot"
                  style={{
                    left: `${((stock.currentPrice - stock.fiftyTwoWeekLow) / (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow)) * 100}%`,
                  }}
                />
              </div>
              <span className="stock-modal-range-label tabular-nums">{formatCurrencyDecimal(stock.fiftyTwoWeekHigh)}</span>
            </div>
          </div>

          {/* ── Transactions ── */}
          <div className="stock-modal-transactions">
            <span className="stock-modal-section-title">Transaction History</span>
            {transactions.length === 0 ? (
              <div className="stock-modal-empty">No transactions recorded</div>
            ) : (
              <div className="stock-modal-tx-list">
                {transactions.map((tx) => (
                  <div key={tx.id} className="stock-modal-tx-row">
                    <div className="stock-modal-tx-left">
                      <span className={`stock-modal-tx-type ${tx.type === 'BUY' ? 'buy' : 'sell'}`}>
                        {tx.type}
                      </span>
                      <span className="stock-modal-tx-date">{formatDate(tx.date)}</span>
                    </div>
                    <div className="stock-modal-tx-right">
                      <span className="stock-modal-tx-qty tabular-nums">{tx.qty} × {formatCurrencyDecimal(tx.price)}</span>
                      <span className="stock-modal-tx-total tabular-nums">{formatCurrency(tx.qty * tx.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Bottom spacer ── */}
          <div style={{ height: '40px' }} />
        </div>
      </div>
    </div>
  );
}
