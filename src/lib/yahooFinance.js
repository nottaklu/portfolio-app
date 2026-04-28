// ─── YAHOO FINANCE API (via Vite proxy) ────────────────────────
// All requests go through /api/yahoo/* → proxied to query2.finance.yahoo.com
// This avoids CORS issues entirely

const PRICE_CACHE_KEY = 'portfolio_price_cache';
const SEARCH_CACHE_KEY = 'portfolio_search_cache';
const PRICE_CACHE_MS = 30000; // 30 seconds
const SEARCH_CACHE_MS = 300000; // 5 minutes

// ─── CACHE HELPERS ─────────────────────────────────────────────
function getCache(key, maxAge) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.ts > maxAge) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch { /* full */ }
}

// ─── FETCH LIVE PRICE (single ticker) ──────────────────────────
export async function fetchLivePrice(ticker) {
  const sym = ticker.includes('.') ? ticker : `${ticker}.NS`;
  const url = `/api/yahoo/chart/${sym}?interval=1d&range=1d`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${ticker}`);

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`No data for ${ticker}`);

  const m = result.meta;
  const prevClose = m.chartPreviousClose || m.previousClose || m.regularMarketPrice;

  return {
    ticker,
    currentPrice: m.regularMarketPrice,
    previousClose: prevClose,
    dayChange: m.regularMarketPrice - prevClose,
    dayChangePct: ((m.regularMarketPrice - prevClose) / prevClose) * 100,
    dayHigh: m.regularMarketDayHigh || m.regularMarketPrice,
    dayLow: m.regularMarketDayLow || m.regularMarketPrice,
    fiftyTwoWeekHigh: m.fiftyTwoWeekHigh || 0,
    fiftyTwoWeekLow: m.fiftyTwoWeekLow || 0,
    lastUpdated: new Date().toISOString(),
  };
}

export async function fetchStockInfo(ticker) {
  if (!ticker) return null;
  try {
    const results = await searchStocks(ticker);
    if (!results || results.length === 0) return null;

    const normalized = ticker.toUpperCase().replace(/\.NS$/, '');
    const exactMatch = results.find((item) => item.ticker.toUpperCase() === normalized);
    return exactMatch || results[0];
  } catch (err) {
    console.warn('Yahoo stock info lookup failed:', err?.message || err);
    return null;
  }
}

// ─── FETCH ALL LIVE PRICES (parallel, with cache) ──────────────
export async function fetchAllLivePrices(tickers) {
  if (!tickers || tickers.length === 0) return { prices: {}, errors: [] };

  const cached = getCache(PRICE_CACHE_KEY, PRICE_CACHE_MS) || {};
  const results = {};
  const errors = [];

  // Check which tickers we already have cached
  const needFetch = [];
  tickers.forEach((t) => {
    if (cached[t] && !cached[t].stale) {
      results[t] = cached[t];
    } else {
      needFetch.push(t);
    }
  });

  if (needFetch.length === 0) {
    return { prices: results, errors: [] };
  }

  // Fetch all in parallel via chart endpoint
  const promises = needFetch.map(async (ticker) => {
    try {
      results[ticker] = await fetchLivePrice(ticker);
    } catch (err) {
      errors.push({ ticker, error: err.message });
      if (cached[ticker]) {
        results[ticker] = { ...cached[ticker], stale: true };
      }
    }
  });
  await Promise.all(promises);

  // Update cache
  setCache(PRICE_CACHE_KEY, { ...cached, ...results });

  return { prices: results, errors };
}

// ─── FALLBACK NSE STOCKS (used when Yahoo search is unavailable) ──
const FALLBACK_NSE = [
  { ticker: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy' },
  { ticker: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology' },
  { ticker: 'INFY', name: 'Infosys', sector: 'Technology' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank', sector: 'Finance' },
  { ticker: 'ICICIBANK', name: 'ICICI Bank', sector: 'Finance' },
  { ticker: 'ITC', name: 'ITC Limited', sector: 'Consumer' },
  { ticker: 'LT', name: 'Larsen & Toubro', sector: 'Infrastructure' },
  { ticker: 'SBIN', name: 'State Bank of India', sector: 'Finance' },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom' },
  { ticker: 'ASIANPAINT', name: 'Asian Paints', sector: 'Consumer' },
  { ticker: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'Consumer' },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Finance' },
  { ticker: 'MARUTI', name: 'Maruti Suzuki', sector: 'Automobile' },
  { ticker: 'TITAN', name: 'Titan Company', sector: 'Consumer' },
  { ticker: 'WIPRO', name: 'Wipro', sector: 'Technology' },
  { ticker: 'HCLTECH', name: 'HCL Technologies', sector: 'Technology' },
  { ticker: 'SUNPHARMA', name: 'Sun Pharma', sector: 'Pharma' },
  { ticker: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automobile' },
  { ticker: 'ADANIENT', name: 'Adani Enterprises', sector: 'Infrastructure' },
  { ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Finance' },
  { ticker: 'AXISBANK', name: 'Axis Bank', sector: 'Finance' },
  { ticker: 'TATASTEEL', name: 'Tata Steel', sector: 'Metal' },
  { ticker: 'NTPC', name: 'NTPC', sector: 'Energy' },
  { ticker: 'POWERGRID', name: 'Power Grid Corp', sector: 'Energy' },
  { ticker: 'COALINDIA', name: 'Coal India', sector: 'Mining' },
  { ticker: 'ONGC', name: 'ONGC', sector: 'Energy' },
  { ticker: 'JSWSTEEL', name: 'JSW Steel', sector: 'Metal' },
  { ticker: 'TECHM', name: 'Tech Mahindra', sector: 'Technology' },
  { ticker: 'INDUSINDBK', name: 'IndusInd Bank', sector: 'Finance' },
  { ticker: 'DRREDDY', name: "Dr. Reddy's Labs", sector: 'Pharma' },
  { ticker: 'BAJAJFINSV', name: 'Bajaj Finserv', sector: 'Finance' },
  { ticker: 'ZOMATO', name: 'Zomato', sector: 'Consumer' },
  { ticker: 'PAYTM', name: 'One97 Communications (Paytm)', sector: 'Technology' },
  { ticker: 'ADANIPOWER', name: 'Adani Power', sector: 'Energy' },
  { ticker: 'ADANIPORTS', name: 'Adani Ports', sector: 'Infrastructure' },
  { ticker: 'TATAPOWER', name: 'Tata Power', sector: 'Energy' },
  { ticker: 'VEDL', name: 'Vedanta', sector: 'Metal' },
  { ticker: 'DIVISLAB', name: "Divi's Laboratories", sector: 'Pharma' },
  { ticker: 'CIPLA', name: 'Cipla', sector: 'Pharma' },
  { ticker: 'EICHERMOT', name: 'Eicher Motors', sector: 'Automobile' },
  { ticker: 'NESTLEIND', name: 'Nestle India', sector: 'Consumer' },
  { ticker: 'ULTRACEMCO', name: 'UltraTech Cement', sector: 'Cement' },
  { ticker: 'SHREECEM', name: 'Shree Cement', sector: 'Cement' },
  { ticker: 'DABUR', name: 'Dabur India', sector: 'Consumer' },
  { ticker: 'GODREJCP', name: 'Godrej Consumer Products', sector: 'Consumer' },
  { ticker: 'HEROMOTOCO', name: 'Hero MotoCorp', sector: 'Automobile' },
  { ticker: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automobile' },
  { ticker: 'BPCL', name: 'Bharat Petroleum', sector: 'Energy' },
  { ticker: 'IOC', name: 'Indian Oil Corporation', sector: 'Energy' },
  { ticker: 'GRASIM', name: 'Grasim Industries', sector: 'Cement' },
];

// ─── SEARCH NSE STOCKS ─────────────────────────────────────────
export async function searchStocks(query) {
  if (!query || query.trim().length < 1) return [];

  const q = query.toLowerCase();

  // Check cache
  const cacheKey = `${SEARCH_CACHE_KEY}_${q}`;
  const cached = getCache(cacheKey, SEARCH_CACHE_MS);
  if (cached) return cached;

  // Try Yahoo Finance search first
  try {
    const url = `/api/yahoo/search?q=${encodeURIComponent(query)}&quotesCount=15&newsCount=0&listsCount=0&enableFuzzyQuery=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const quotes = json?.quotes || [];

    const results = quotes
      .filter((r) =>
        r.quoteType === 'EQUITY' &&
        (r.exchange === 'NSI' || r.exchange === 'NSE' || r.exchange === 'BOM' || r.exchange === 'BSE' ||
         r.symbol?.endsWith('.NS') || r.symbol?.endsWith('.BO'))
      )
      .map((r) => ({
        ticker: r.symbol.replace('.NS', '').replace('.BO', ''),
        yahooSymbol: r.symbol,
        name: r.longname || r.shortname || r.symbol,
        exchange: r.exchange === 'NSI' || r.symbol?.endsWith('.NS') ? 'NSE' : 'BSE',
        sector: r.sector || r.industry || '-',
        industry: r.industry || '-',
      }))
      .reduce((acc, item) => {
        if (!acc.find((x) => x.ticker === item.ticker)) acc.push(item);
        return acc;
      }, []);

    if (results.length > 0) {
      setCache(cacheKey, results);
      return results;
    }
  } catch (err) {
    console.warn('Yahoo search failed, using fallback:', err.message);
  }

  // Fallback: search local list
  const fallback = FALLBACK_NSE
    .filter((s) =>
      s.ticker.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    )
    .map((s) => ({
      ...s,
      exchange: 'NSE',
      industry: s.sector,
    }));

  setCache(cacheKey, fallback);
  return fallback;
}

// ─── MARKET STATUS ─────────────────────────────────────────────
export function isMarketOpen() {
  const now = new Date();
  const istOffset = 5.5 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = utcMinutes + istOffset;
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;
  const day = now.getUTCDay();
  const istDay = istMinutes >= 1440 ? (day + 1) % 7 : day;
  if (istDay === 0 || istDay === 6) return false;
  const adj = istMinutes % 1440;
  return adj >= marketOpen && adj <= marketClose;
}

