import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';
import './TickerTape.css';

export default function TickerTape({ stocks }) {
  const tickerData = useMemo(() => {
    const allStocks = Object.values(stocks).filter((s) => s.currentPrice > 0);
    return allStocks.map((s) => ({
      ticker: s.ticker,
      price: s.currentPrice,
      change: s.currentPrice - (s.previousClose || s.currentPrice),
      changePct: s.previousClose ? ((s.currentPrice - s.previousClose) / s.previousClose) * 100 : 0,
    }));
  }, [stocks]);

  if (tickerData.length === 0) return null;

  return (
    <div className="ticker-tape-wrap">
      <div className="ticker-tape">
        <div className="ticker-tape-track">
          {[...tickerData, ...tickerData, ...tickerData].map((t, i) => (
            <div key={`${t.ticker}-${i}`} className="ticker-item">
              <span className="ticker-item-name">{t.ticker}</span>
              <span className="ticker-item-price tabular-nums">{formatCurrency(t.price)}</span>
              <span className={`ticker-item-change tabular-nums ${t.change >= 0 ? 'positive' : 'negative'}`}>
                {t.change >= 0 ? '▲' : '▼'} {Math.abs(t.changePct).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
