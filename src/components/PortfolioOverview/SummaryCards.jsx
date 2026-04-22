import React from 'react';
import { formatCurrency, formatPercent, getArrow, getPnLClass } from '../../utils/formatters';
import './SummaryCards.css';

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
      {cards.map((card, i) => (
        <div key={card.label} className={`summary-card fade-in stagger-${i + 1}`}>
          <div className="summary-card-label">{card.label}</div>
          <div className="summary-card-bottom">
            <div className={`summary-card-value tabular-nums ${card.className}`}>
              {card.value}
            </div>
            {card.sub && (
              <div className={`summary-card-sub tabular-nums ${card.className}`}>
                {getArrow(totals.grandPnL || totals.totalPnL)} {card.sub}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
