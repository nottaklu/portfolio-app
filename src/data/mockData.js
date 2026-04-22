// ─── STOCK DATA ────────────────────────────────────────────────
export const STOCKS = {
  RELIANCE: {
    ticker: 'RELIANCE',
    name: 'Reliance Industries',
    sector: 'Energy',
    industry: 'Oil & Gas',
    qty: 25,
    avgPrice: 2380.50,
    currentPrice: 2934.75,
    previousClose: 2912.40,
    dayHigh: 2948.00,
    dayLow: 2905.10,
    fiftyTwoWeekHigh: 3024.90,
    fiftyTwoWeekLow: 2220.30,
    marketCap: '19,88,432 Cr',
    pe: 28.4,
  },
  TCS: {
    ticker: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'Technology',
    industry: 'IT Services',
    qty: 15,
    avgPrice: 3420.00,
    currentPrice: 3892.60,
    previousClose: 3878.20,
    dayHigh: 3910.00,
    dayLow: 3865.50,
    fiftyTwoWeekHigh: 4243.80,
    fiftyTwoWeekLow: 3311.00,
    marketCap: '14,12,560 Cr',
    pe: 32.1,
  },
  INFY: {
    ticker: 'INFY',
    name: 'Infosys',
    sector: 'Technology',
    industry: 'IT Services',
    qty: 40,
    avgPrice: 1380.25,
    currentPrice: 1578.90,
    previousClose: 1592.40,
    dayHigh: 1595.00,
    dayLow: 1570.20,
    fiftyTwoWeekHigh: 1953.90,
    fiftyTwoWeekLow: 1358.40,
    marketCap: '6,55,120 Cr',
    pe: 27.6,
  },
  HDFCBANK: {
    ticker: 'HDFCBANK',
    name: 'HDFC Bank',
    sector: 'Finance',
    industry: 'Banking',
    qty: 30,
    avgPrice: 1520.00,
    currentPrice: 1678.35,
    previousClose: 1665.80,
    dayHigh: 1685.00,
    dayLow: 1660.20,
    fiftyTwoWeekHigh: 1794.00,
    fiftyTwoWeekLow: 1427.00,
    marketCap: '12,78,340 Cr',
    pe: 19.2,
  },
  ICICIBANK: {
    ticker: 'ICICIBANK',
    name: 'ICICI Bank',
    sector: 'Finance',
    industry: 'Banking',
    qty: 50,
    avgPrice: 920.00,
    currentPrice: 1124.50,
    previousClose: 1118.30,
    dayHigh: 1132.00,
    dayLow: 1112.40,
    fiftyTwoWeekHigh: 1362.35,
    fiftyTwoWeekLow: 895.15,
    marketCap: '7,89,120 Cr',
    pe: 17.8,
  },
  ITC: {
    ticker: 'ITC',
    name: 'ITC Limited',
    sector: 'Consumer',
    industry: 'FMCG',
    qty: 100,
    avgPrice: 385.60,
    currentPrice: 428.75,
    previousClose: 431.20,
    dayHigh: 433.00,
    dayLow: 426.50,
    fiftyTwoWeekHigh: 499.00,
    fiftyTwoWeekLow: 399.35,
    marketCap: '5,34,680 Cr',
    pe: 26.3,
  },
  LT: {
    ticker: 'LT',
    name: 'Larsen & Toubro',
    sector: 'Infrastructure',
    industry: 'Engineering',
    qty: 12,
    avgPrice: 2850.00,
    currentPrice: 3456.20,
    previousClose: 3432.80,
    dayHigh: 3470.00,
    dayLow: 3425.00,
    fiftyTwoWeekHigh: 3898.00,
    fiftyTwoWeekLow: 2880.55,
    marketCap: '4,74,890 Cr',
    pe: 33.5,
  },
  SBIN: {
    ticker: 'SBIN',
    name: 'State Bank of India',
    sector: 'Finance',
    industry: 'Banking',
    qty: 80,
    avgPrice: 580.00,
    currentPrice: 752.40,
    previousClose: 748.60,
    dayHigh: 758.00,
    dayLow: 745.20,
    fiftyTwoWeekHigh: 912.00,
    fiftyTwoWeekLow: 555.45,
    marketCap: '6,71,340 Cr',
    pe: 9.4,
  },
  BHARTIARTL: {
    ticker: 'BHARTIARTL',
    name: 'Bharti Airtel',
    sector: 'Telecom',
    industry: 'Telecom Services',
    qty: 20,
    avgPrice: 1250.00,
    currentPrice: 1534.80,
    previousClose: 1528.50,
    dayHigh: 1542.00,
    dayLow: 1522.30,
    fiftyTwoWeekHigh: 1779.00,
    fiftyTwoWeekLow: 1180.00,
    marketCap: '9,12,450 Cr',
    pe: 78.2,
  },
  ASIANPAINT: {
    ticker: 'ASIANPAINT',
    name: 'Asian Paints',
    sector: 'Consumer',
    industry: 'Paints',
    qty: 18,
    avgPrice: 3100.00,
    currentPrice: 2845.30,
    previousClose: 2862.10,
    dayHigh: 2870.00,
    dayLow: 2830.50,
    fiftyTwoWeekHigh: 3395.00,
    fiftyTwoWeekLow: 2670.10,
    marketCap: '2,72,980 Cr',
    pe: 52.8,
  },
};

// ─── PORTFOLIOS ────────────────────────────────────────────────
export const PORTFOLIOS = [
  {
    id: 'siddh',
    name: 'Siddh',
    color: '#4F46E5',
    type: 'manual',
    stockTickers: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'],
  },
  {
    id: 'pms1',
    name: 'PMS - 1',
    color: '#7C3AED',
    type: 'sheets',
    stockTickers: ['ICICIBANK', 'ITC', 'LT', 'SBIN'],
  },
  {
    id: 'pms2',
    name: 'PMS - 2',
    color: '#0EA5E9',
    type: 'sheets',
    stockTickers: ['BHARTIARTL', 'ASIANPAINT'],
  },
];

// ─── TRANSACTIONS ──────────────────────────────────────────────
export const TRANSACTIONS = {
  RELIANCE: [
    { id: 't1', type: 'BUY', qty: 15, price: 2320.00, date: '2024-06-15', notes: 'Initial buy' },
    { id: 't2', type: 'BUY', qty: 10, price: 2471.25, date: '2024-11-08', notes: 'Added more' },
  ],
  TCS: [
    { id: 't3', type: 'BUY', qty: 10, price: 3380.00, date: '2024-03-22', notes: 'Initial position' },
    { id: 't4', type: 'BUY', qty: 5, price: 3500.00, date: '2024-08-14', notes: 'Averaging up' },
  ],
  INFY: [
    { id: 't5', type: 'BUY', qty: 50, price: 1420.00, date: '2024-01-10', notes: 'Bulk buy' },
    { id: 't6', type: 'SELL', qty: 10, price: 1580.00, date: '2024-09-30', notes: 'Partial profit booking' },
  ],
  HDFCBANK: [
    { id: 't7', type: 'BUY', qty: 30, price: 1520.00, date: '2024-04-05', notes: 'Long term hold' },
  ],
  ICICIBANK: [
    { id: 't8', type: 'BUY', qty: 30, price: 940.00, date: '2024-02-18', notes: 'Banking bet' },
    { id: 't9', type: 'BUY', qty: 20, price: 890.00, date: '2024-07-22', notes: 'Dip buy' },
  ],
  ITC: [
    { id: 't10', type: 'BUY', qty: 100, price: 385.60, date: '2024-05-12', notes: 'Dividend play' },
  ],
  LT: [
    { id: 't11', type: 'BUY', qty: 12, price: 2850.00, date: '2024-08-28', notes: 'Infra theme' },
  ],
  SBIN: [
    { id: 't12', type: 'BUY', qty: 50, price: 620.00, date: '2024-01-25', notes: 'PSU bank rally' },
    { id: 't13', type: 'BUY', qty: 30, price: 513.33, date: '2024-06-10', notes: 'Averaged down' },
  ],
  BHARTIARTL: [
    { id: 't14', type: 'BUY', qty: 20, price: 1250.00, date: '2024-04-18', notes: '5G thesis' },
  ],
  ASIANPAINT: [
    { id: 't15', type: 'BUY', qty: 18, price: 3100.00, date: '2024-03-05', notes: 'Quality buy' },
  ],
};

// ─── MOCK HISTORICAL PRICES (for charts) ───────────────────────
function generateMockHistory(currentPrice, volatility = 0.015, days = 365) {
  const data = [];
  let price = currentPrice * (1 - Math.random() * 0.15 - 0.05);
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price + change, price * 0.5);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
    });
  }

  // Ensure last price matches current price
  if (data.length > 0) {
    data[data.length - 1].price = currentPrice;
  }

  return data;
}

export const PRICE_HISTORY = {};
Object.keys(STOCKS).forEach((ticker) => {
  PRICE_HISTORY[ticker] = generateMockHistory(STOCKS[ticker].currentPrice);
});

// ─── SECTOR COLORS ─────────────────────────────────────────────
export const SECTOR_COLORS = {
  Technology: '#4F46E5',
  Finance: '#6B7280',
  Energy: '#22C55E',
  Consumer: '#F59E0B',
  Infrastructure: '#0EA5E9',
  Telecom: '#7C3AED',
};
