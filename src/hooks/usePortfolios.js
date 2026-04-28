import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchGoogleSheetHoldings } from '../lib/googleSheets';

const SHEET_CONFIGS_KEY = 'portfolio_sheet_configs';
const SHEET_CACHE_KEY = 'portfolio_sheet_cache';

function readLocalStorage(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

function loadSheetConfigs() {
  return readLocalStorage(SHEET_CONFIGS_KEY) || {};
}

function saveSheetConfigs(configs) {
  writeLocalStorage(SHEET_CONFIGS_KEY, configs);
}

function loadSheetCache() {
  return readLocalStorage(SHEET_CACHE_KEY) || {};
}

function saveSheetCache(cache) {
  writeLocalStorage(SHEET_CACHE_KEY, cache);
}

function shouldRefreshSheet(lastSync) {
  if (!lastSync) return true;
  const now = new Date();
  const last = new Date(lastSync);
  if (now.toDateString() === last.toDateString()) return false;

  const today8 = new Date(now);
  today8.setHours(8, 0, 0, 0);
  return now.getTime() >= today8.getTime();
}

function buildStockMap(stockData) {
  const stockMap = {};
  stockData.forEach((s) => {
    stockMap[s.ticker] = {
      ticker: s.ticker,
      name: s.name,
      sector: s.sector || '-',
      industry: s.sector || '-',
      qty: s.qty,
      avgPrice: parseFloat(s.avg_price),
      currentPrice: parseFloat(s.avg_price),
      previousClose: parseFloat(s.avg_price),
      dayHigh: 0,
      dayLow: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      marketCap: '-',
      pe: 0,
    };
  });
  return stockMap;
}

function mapSheetHoldingsToStockRows(portfolioId, holdings) {
  return holdings.map((holding) => ({
    portfolio_id: portfolioId,
    ticker: holding.ticker,
    name: holding.name,
    sector: '-',
    qty: holding.qty,
    avg_price: holding.avgPrice,
  }));
}

export function usePortfolios(userId) {
  const [portfolios, setPortfolios] = useState([]);
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState(true);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [sheetConfigs, setSheetConfigs] = useState({});

  const writeSheetConfig = useCallback((portfolioId, config) => {
    const nextConfigs = {
      ...loadSheetConfigs(),
      [portfolioId]: config,
    };
    saveSheetConfigs(nextConfigs);
    setSheetConfigs(nextConfigs);
  }, []);

  const loadSheetDataForPortfolios = useCallback(
    async (portfolioList, stockData, forceRefresh) => {
      const configs = loadSheetConfigs();
      const cache = loadSheetCache();
      const nextCache = { ...cache };
      let latestStockData = [...stockData];
      let loadError = '';

      const updatedPortfolios = await Promise.all(
        portfolioList.map(async (portfolio) => {
          if (portfolio.type !== 'sheets') return portfolio;
          const config = configs[portfolio.id];
          if (!config) return portfolio;

          let cached = nextCache[portfolio.id];
          const needsRefresh = forceRefresh || !cached || shouldRefreshSheet(cached.lastSync);
          if (needsRefresh) {
            try {
              const holdings = await fetchGoogleSheetHoldings(config);
              cached = {
                rows: holdings,
                lastSync: new Date().toISOString(),
              };
              nextCache[portfolio.id] = cached;
            } catch (err) {
              console.error('Google Sheets sync failed:', err);
              loadError = err.message || 'Google Sheets sync failed';
            }
          }

          if (cached?.rows?.length) {
            latestStockData = latestStockData.filter((s) => s.portfolio_id !== portfolio.id);
            const sheetRows = mapSheetHoldingsToStockRows(portfolio.id, cached.rows);
            latestStockData = latestStockData.concat(sheetRows);
            return {
              ...portfolio,
              stockTickers: sheetRows.map((s) => s.ticker),
            };
          }

          return portfolio;
        })
      );

      saveSheetCache(nextCache);
      if (loadError) setSheetError(loadError);
      return { updatedPortfolios, latestStockData };
    },
    []
  );

  const loadData = useCallback(
    async (forceSheetRefresh = false) => {
      if (!userId) return;
      setLoading(true);
      setSheetError('');

      try {
        const configs = loadSheetConfigs();
        setSheetConfigs(configs);

        const { data: pfData, error: pfErr } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', userId)
          .order('position', { ascending: true });

        if (pfErr) throw pfErr;

        const pfIds = (pfData || []).map((p) => p.id);
        let stockData = [];
        if (pfIds.length > 0) {
          const { data: sData, error: sErr } = await supabase
            .from('portfolio_stocks')
            .select('*')
            .in('portfolio_id', pfIds);
          if (sErr) throw sErr;
          stockData = sData || [];
        }

        const portfolioList = (pfData || []).map((p) => ({
          id: p.id,
          name: p.name,
          color: p.color,
          type: p.type,
          stockTickers: stockData
            .filter((s) => s.portfolio_id === p.id)
            .map((s) => s.ticker),
        }));

        const { updatedPortfolios, latestStockData } = await loadSheetDataForPortfolios(
          portfolioList,
          stockData,
          forceSheetRefresh
        );

        setPortfolios(updatedPortfolios);
        setStocks(buildStockMap(latestStockData));
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    },
    [userId, loadSheetDataForPortfolios]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (loading) return;
    const configs = loadSheetConfigs();
    if (Object.keys(configs).length === 0) return;

    const next8 = new Date();
    next8.setHours(8, 0, 0, 0);
    if (next8.getTime() <= Date.now()) {
      next8.setDate(next8.getDate() + 1);
    }

    const delay = next8.getTime() - Date.now();
    const timer = window.setTimeout(() => {
      loadData();
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loading, loadData]);

  // ── Add portfolio ──
  const addPortfolio = useCallback(
    async (portfolio, sheetConfig) => {
      try {
        const { data, error } = await supabase
          .from('portfolios')
          .insert({
            user_id: userId,
            name: portfolio.name,
            color: portfolio.color,
            type: portfolio.type || 'manual',
            position: portfolios.length,
          })
          .select()
          .single();

        if (error) throw error;

        if (sheetConfig) {
          writeSheetConfig(data.id, sheetConfig);
        }

        const newPf = {
          id: data.id,
          name: data.name,
          color: data.color,
          type: data.type,
          stockTickers: [],
        };

        setPortfolios((prev) => [...prev, newPf]);
        return newPf;
      } catch (err) {
        console.error('Add portfolio failed:', err);
        throw err;
      }
    },
    [userId, portfolios.length, writeSheetConfig]
  );

  // ── Add stock to portfolio ──
  const addStock = useCallback(async (portfolioId, stockData) => {
    try {
      const { error } = await supabase
        .from('portfolio_stocks')
        .insert({
          portfolio_id: portfolioId,
          ticker: stockData.ticker,
          name: stockData.name,
          sector: stockData.sector || '-',
          qty: stockData.qty,
          avg_price: stockData.avgPrice,
        });

      if (error) throw error;

      setPortfolios((prev) =>
        prev.map((pf) =>
          pf.id === portfolioId
            ? { ...pf, stockTickers: [...pf.stockTickers, stockData.ticker] }
            : pf
        )
      );

      setStocks((prev) => ({
        ...prev,
        [stockData.ticker]: {
          ticker: stockData.ticker,
          name: stockData.name,
          sector: stockData.sector || '-',
          industry: stockData.sector || '-',
          qty: stockData.qty,
          avgPrice: stockData.avgPrice,
          currentPrice: stockData.currentPrice || stockData.avgPrice,
          previousClose: stockData.previousClose || stockData.avgPrice,
          dayHigh: stockData.dayHigh || 0,
          dayLow: stockData.dayLow || 0,
          fiftyTwoWeekHigh: stockData.fiftyTwoWeekHigh || 0,
          fiftyTwoWeekLow: stockData.fiftyTwoWeekLow || 0,
          marketCap: '-',
          pe: 0,
        },
      }));
    } catch (err) {
      console.error('Add stock failed:', err);
      throw err;
    }
  }, []);

  // ── Delete portfolio ──
  const deletePortfolio = useCallback(async (portfolioId) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (error) throw error;

      setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
    } catch (err) {
      console.error('Delete portfolio failed:', err);
      throw err;
    }
  }, []);

  // ── Delete stock from portfolio ──
  const deleteStock = useCallback(async (portfolioId, ticker) => {
    try {
      const { error } = await supabase
        .from('portfolio_stocks')
        .delete()
        .eq('portfolio_id', portfolioId)
        .eq('ticker', ticker);

      if (error) throw error;

      setPortfolios((prev) =>
        prev.map((pf) =>
          pf.id === portfolioId
            ? { ...pf, stockTickers: pf.stockTickers.filter((t) => t !== ticker) }
            : pf
        )
      );
    } catch (err) {
      console.error('Delete stock failed:', err);
      throw err;
    }
  }, []);

  // ── Update stocks with live prices ──
  const updateStockPrices = useCallback((priceMap) => {
    setStocks((prev) => {
      const updated = { ...prev };
      Object.entries(priceMap).forEach(([ticker, priceData]) => {
        if (updated[ticker] && priceData.currentPrice) {
          updated[ticker] = {
            ...updated[ticker],
            currentPrice: priceData.currentPrice,
            previousClose: priceData.previousClose || updated[ticker].previousClose,
            dayHigh: priceData.dayHigh || updated[ticker].dayHigh,
            dayLow: priceData.dayLow || updated[ticker].dayLow,
            fiftyTwoWeekHigh: priceData.fiftyTwoWeekHigh || updated[ticker].fiftyTwoWeekHigh,
            fiftyTwoWeekLow: priceData.fiftyTwoWeekLow || updated[ticker].fiftyTwoWeekLow,
          };
        }
      });
      return updated;
    });
  }, []);

  // ── Edit stock qty/avgPrice ──
  const editStock = useCallback(async (portfolioId, ticker, newQty, newAvgPrice) => {
    try {
      const { error } = await supabase
        .from('portfolio_stocks')
        .update({ qty: newQty, avg_price: newAvgPrice })
        .eq('portfolio_id', portfolioId)
        .eq('ticker', ticker);

      if (error) throw error;

      setStocks((prev) => ({
        ...prev,
        [ticker]: {
          ...prev[ticker],
          qty: newQty,
          avgPrice: newAvgPrice,
        },
      }));
    } catch (err) {
      console.error('Edit stock failed:', err);
      throw err;
    }
  }, []);

  return {
    portfolios,
    stocks,
    loading,
    sheetLoading,
    sheetError,
    addPortfolio,
    addStock,
    editStock,
    deletePortfolio,
    deleteStock,
    updateStockPrices,
    reload: loadData,
    refreshSheets: useCallback(async () => {
      setSheetLoading(true);
      setSheetError('');
      try {
        await loadData(true);
      } finally {
        setSheetLoading(false);
      }
    }, [loadData]),
    saveSheetConfig: writeSheetConfig,
  };
}

