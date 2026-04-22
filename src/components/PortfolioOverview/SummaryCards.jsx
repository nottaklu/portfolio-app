import React from 'react';
import { formatCurrency, formatPercent, getArrow, getPnLClass } from '../../utils/formatters';
import './SummaryCards.css';

function InvestedIcon() {
  return (
    <svg className="summary-card-svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5V13M6.5 8.5L9 5.5L11.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CurrentValueIcon() {
  return (
    <svg className="summary-card-svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7H16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 11H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PnLIcon() {
  return (
    <svg className="summary-card-svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 14L7 9L10 12L15 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4H15V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DayGainIcon() {
  return (
    <svg className="summary-card-svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 6L9 2L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const ICONS = [InvestedIcon, CurrentValueIcon, PnLIcon, DayGainIcon];
const GRADIENT_CLASSES = ['gradient-blue', 'gradient-purple', 'gradient-green', 'gradient-amber'];

export default function SummaryCards({ totals, loading }) {
  const cards = [
    {
      label: 'Invested',
      value: formatCurrency(totals.grandInvested || totals.totalInvested),
      className: '',
    },
    {
      label: 'Current Value',
      value: formatCurrency(totals.grandCurrentValue || totals.totalCurrentValue),
      className: '',
    },
    {
      label: 'Total P&L',
      value: formatCurrency(totals.grandPnL || totals.totalPnL, true),
      sub: formatPercent(totals.grandPnLPct || totals.totalPnLPct),
      className: getPnLClass(totals.grandPnL || totals.totalPnL),
    },
    {
      label: "Today's Gain",
      value: formatCurrency(totals.grandDayGain || totals.totalDayGain, true),
      sub: formatPercent(totals.dayGainPct),
      className: getPnLClass(totals.grandDayGain || totals.totalDayGain),
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, i) => {
        const Icon = ICONS[i];
        return (
          <div
            key={card.label}
            className={`summary-card fade-in stagger-${i + 1}`}
          >
            <div className="summary-card-header">
              <div className={`summary-card-icon-wrap ${GRADIENT_CLASSES[i]}`}>
                <Icon />
              </div>
              <span className="summary-card-label">{card.label}</span>
            </div>
            <div className={`summary-card-value tabular-nums ${card.className}`}>
              {card.value}
            </div>
            {card.sub && (
              <div className={`summary-card-sub tabular-nums ${card.className}`}>
                {getArrow(totals.grandPnL || totals.totalPnL)} {card.sub}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
