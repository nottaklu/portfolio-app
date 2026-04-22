// ─── STOCK-LEVEL CALCULATIONS ──────────────────────────────────

export function calcStockMetrics(stock) {
  const invested = stock.qty * stock.avgPrice;
  const currentValue = stock.qty * stock.currentPrice;
  const totalPnL = currentValue - invested;
  const totalPnLPct = invested > 0 ? (totalPnL / invested) * 100 : 0;
  const dayChange = stock.currentPrice - stock.previousClose;
  const dayChangePct = stock.previousClose > 0 ? (dayChange / stock.previousClose) * 100 : 0;
  const dayGainValue = stock.qty * dayChange;

  return {
    invested,
    currentValue,
    totalPnL,
    totalPnLPct,
    dayChange,
    dayChangePct,
    dayGainValue,
  };
}

// ─── PORTFOLIO-LEVEL CALCULATIONS ──────────────────────────────

export function calcPortfolioTotals(stocks) {
  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalDayGain = 0;

  stocks.forEach((stock) => {
    const metrics = calcStockMetrics(stock);
    totalInvested += metrics.invested;
    totalCurrentValue += metrics.currentValue;
    totalDayGain += metrics.dayGainValue;
  });

  const totalPnL = totalCurrentValue - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const dayGainPct = totalInvested > 0 ? (totalDayGain / totalInvested) * 100 : 0;

  return {
    totalInvested,
    totalCurrentValue,
    totalPnL,
    totalPnLPct,
    totalDayGain,
    dayGainPct,
    stockCount: stocks.length,
  };
}

// ─── GRAND TOTALS (ALL PORTFOLIOS) ────────────────────────────

export function calcGrandTotals(portfolioStocksMap) {
  let grandInvested = 0;
  let grandCurrentValue = 0;
  let grandDayGain = 0;

  Object.values(portfolioStocksMap).forEach((stocks) => {
    const totals = calcPortfolioTotals(stocks);
    grandInvested += totals.totalInvested;
    grandCurrentValue += totals.totalCurrentValue;
    grandDayGain += totals.totalDayGain;
  });

  const grandPnL = grandCurrentValue - grandInvested;
  const grandPnLPct = grandInvested > 0 ? (grandPnL / grandInvested) * 100 : 0;
  const dayGainPct = grandInvested > 0 ? (grandDayGain / grandInvested) * 100 : 0;

  return {
    grandInvested,
    grandCurrentValue,
    grandPnL,
    grandPnLPct,
    grandDayGain,
    dayGainPct,
  };
}

// ─── SORTING ───────────────────────────────────────────────────

export function sortStocks(stocks, sortBy, sortDir = 'desc') {
  const sorted = [...stocks];
  const dir = sortDir === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    const mA = calcStockMetrics(a);
    const mB = calcStockMetrics(b);

    switch (sortBy) {
      case 'alpha':
        return dir * a.name.localeCompare(b.name);
      case 'dayGainPct':
        return dir * (mA.dayChangePct - mB.dayChangePct);
      case 'totalPnLPct':
        return dir * (mA.totalPnLPct - mB.totalPnLPct);
      case 'currentValue':
        return dir * (mA.currentValue - mB.currentValue);
      case 'invested':
        return dir * (mA.invested - mB.invested);
      default:
        return 0;
    }
  });

  return sorted;
}
