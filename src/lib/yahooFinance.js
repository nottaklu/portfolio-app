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

// ─── SEARCH NSE STOCKS (live Yahoo Finance autocomplete) ───────
export async function searchStocks(query) {
  if (!query || query.trim().length < 1) return [];

  // Check search cache
  const cacheKey = `${SEARCH_CACHE_KEY}_${query.toLowerCase()}`;
  const cached = getCache(cacheKey, SEARCH_CACHE_MS);
  if (cached) return cached;

  try {
    const url = `/api/yahoo/search?q=${encodeURIComponent(query)}&quotesCount=15&newsCount=0&listsCount=0&enableFuzzyQuery=true&quotesQueryId=tss_match_phrase_query`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const json = await res.json();
    const quotes = json?.quotes || [];

    // Filter to only NSE/BSE Indian equities
    const results = quotes
      .filter((q) =>
        q.quoteType === 'EQUITY' &&
        (q.exchange === 'NSI' || q.exchange === 'NSE' || q.exchange === 'BOM' || q.exchange === 'BSE' ||
         (q.symbol && q.symbol.endsWith('.NS')) ||
         (q.symbol && q.symbol.endsWith('.BO')))
      )
      .map((q) => ({
        ticker: q.symbol.replace('.NS', '').replace('.BO', ''),
        yahooSymbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchange === 'NSI' || q.symbol?.endsWith('.NS') ? 'NSE' : 'BSE',
        sector: q.sector || q.industry || '-',
        industry: q.industry || '-',
      }))
      // Deduplicate — prefer NSE over BSE
      .reduce((acc, item) => {
        const existing = acc.find((x) => x.ticker === item.ticker);
        if (!existing) {
          acc.push(item);
        } else if (item.exchange === 'NSE' && existing.exchange !== 'NSE') {
          const idx = acc.indexOf(existing);
          acc[idx] = item;
        }
        return acc;
      }, []);

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.error('Search failed:', err);
    return [];
  }
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
