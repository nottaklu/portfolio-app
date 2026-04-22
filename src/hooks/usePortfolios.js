import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook for portfolio and stock CRUD operations in Supabase.
 * Returns reactive state + mutation functions.
 */
export function usePortfolios(userId) {
  const [portfolios, setPortfolios] = useState([]);
  const [stocks, setStocks] = useState({});
  const [loading, setLoading] = useState(true);

  // ── Load all data for this user ──
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // Fetch portfolios
      const { data: pfData, error: pfErr } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });

      if (pfErr) throw pfErr;

      // Fetch all stocks for user's portfolios
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

      // Build portfolios with stockTickers
      const portfolioList = (pfData || []).map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        type: p.type,
        stockTickers: stockData
          .filter((s) => s.portfolio_id === p.id)
          .map((s) => s.ticker),
      }));

      // Build stocks map (ticker → stock data)
      const stockMap = {};
      stockData.forEach((s) => {
        stockMap[s.ticker] = {
          ticker: s.ticker,
          name: s.name,
          sector: s.sector || '-',
          industry: s.sector || '-',
          qty: s.qty,
          avgPrice: parseFloat(s.avg_price),
          currentPrice: parseFloat(s.avg_price), // Will be updated by live fetch
          previousClose: parseFloat(s.avg_price),
          dayHigh: 0,
          dayLow: 0,
          fiftyTwoWeekHigh: 0,
          fiftyTwoWeekLow: 0,
          marketCap: '-',
          pe: 0,
        };
      });

      setPortfolios(portfolioList);
      setStocks(stockMap);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Add portfolio ──
  const addPortfolio = useCallback(async (portfolio) => {
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
  }, [userId, portfolios.length]);

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

      // Update local state
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

  return {
    portfolios,
    stocks,
    loading,
    addPortfolio,
    addStock,
    deletePortfolio,
    deleteStock,
    updateStockPrices,
    reload: loadData,
  };
}
