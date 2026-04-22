import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/Auth/LoginScreen';
import MpinScreen from './components/Auth/MpinScreen';
import SetMpinScreen from './components/Auth/SetMpinScreen';
import PortfolioOverview from './components/PortfolioOverview/PortfolioOverview';
import PortfolioDetail from './components/PortfolioDetail/PortfolioDetail';
import StockModal from './components/StockDetail/StockModal';
import SortModal from './components/SortModal/SortModal';
import AddPortfolioModal from './components/AddPortfolioModal/AddPortfolioModal';
import AddStockModal from './components/AddStockModal/AddStockModal';
import { useAuth } from './hooks/useAuth';
import { usePortfolios } from './hooks/usePortfolios';
import { fetchAllLivePrices } from './lib/yahooFinance';
import './styles/globals.css';
import './styles/animations.css';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function App() {
  // ── Auth ──
  const auth = useAuth();

  // ── Portfolio data from Supabase ──
  const {
    portfolios,
    stocks,
    loading: dataLoading,
    addPortfolio,
    addStock,
    updateStockPrices,
  } = usePortfolios(auth.user?.id);

  // ── Screen state ──
  const [screen, setScreen] = useState('overview');
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [priceStatus, setPriceStatus] = useState('loading');

  // ── Fetch live prices ──
  const fetchPrices = useCallback(async () => {
    const allTickers = Object.keys(stocks);
    if (allTickers.length === 0) {
      setPriceStatus('live');
      return;
    }

    setPriceStatus('loading');
    try {
      const result = await fetchAllLivePrices(allTickers);
      const priceMap = result.prices || result;
      updateStockPrices(priceMap);

      const hasErrors = result.errors && result.errors.length > 0;
      setPriceStatus(hasErrors ? 'stale' : 'live');
    } catch (err) {
      console.error('Price fetch failed:', err);
      setPriceStatus('error');
    }
  }, [stocks, updateStockPrices]);

  // ── Auto-refresh prices when app is ready ──
  useEffect(() => {
    if (auth.authState !== 'ready' || dataLoading) return;

    // Initial fetch
    const timer = setTimeout(fetchPrices, 500);

    // Periodic refresh
    const interval = setInterval(fetchPrices, REFRESH_INTERVAL);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [auth.authState, dataLoading, fetchPrices]);

  // ── Keep selectedPortfolio in sync with portfolios state ──
  useEffect(() => {
    if (selectedPortfolio) {
      const updated = portfolios.find((p) => p.id === selectedPortfolio.id);
      if (updated) setSelectedPortfolio(updated);
    }
  }, [portfolios]);

  // ── Navigation ──
  const handleSelectPortfolio = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setScreen('detail');
    setSortBy(null);
  };

  const handleBack = () => {
    setScreen('overview');
    setSelectedPortfolio(null);
    setSortBy(null);
  };

  // ── Add portfolio ──
  const handleAddPortfolio = async (newPortfolio) => {
    try {
      await addPortfolio(newPortfolio);
    } catch (err) {
      console.error('Failed to add portfolio:', err);
    }
  };

  // ── Add stock to current portfolio ──
  const handleAddStock = async (stockData) => {
    if (!selectedPortfolio) return;
    try {
      await addStock(selectedPortfolio.id, stockData);

      // Fetch live price for new stock
      fetchAllLivePrices([stockData.ticker]).then((result) => {
        const priceMap = result.prices || result;
        updateStockPrices(priceMap);
      }).catch(() => {});
    } catch (err) {
      console.error('Failed to add stock:', err);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // AUTH SCREENS
  // ─────────────────────────────────────────────────────────────
  if (auth.authState === 'loading') {
    return (
      <div className="app-container">
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column', gap: '16px',
        }}>
          <div className="login-spinner" style={{
            width: 32, height: 32,
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-blue)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (auth.authState === 'login') {
    return (
      <div className="app-container">
        <LoginScreen
          onLogin={auth.login}
          loading={auth.loading}
          error={auth.error}
        />
      </div>
    );
  }

  if (auth.authState === 'set-mpin') {
    return (
      <div className="app-container">
        <SetMpinScreen
          displayName={auth.profile?.display_name}
          onSetMpin={auth.setMpin}
          loading={auth.loading}
        />
      </div>
    );
  }

  if (auth.authState === 'mpin') {
    return (
      <div className="app-container">
        <MpinScreen
          displayName={auth.profile?.display_name}
          onVerify={auth.verifyMpin}
          onLogout={auth.logout}
          loading={auth.loading}
          error={auth.error}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN APP (auth.authState === 'ready')
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      {/* ── Screens ── */}
      {screen === 'overview' && (
        <PortfolioOverview
          portfolios={portfolios}
          stocks={stocks}
          onSelectPortfolio={handleSelectPortfolio}
          onAddPortfolio={() => setShowAddPortfolio(true)}
          loading={dataLoading}
          priceStatus={priceStatus}
          onRefresh={fetchPrices}
          displayName={auth.profile?.display_name}
          onLogout={auth.logout}
        />
      )}

      {screen === 'detail' && selectedPortfolio && (
        <PortfolioDetail
          portfolio={selectedPortfolio}
          stocks={stocks}
          onBack={handleBack}
          onStockClick={(stock) => setSelectedStock(stock)}
          onOpenSort={() => setShowSortModal(true)}
          onAddStock={() => setShowAddStock(true)}
          sortBy={sortBy}
          loading={false}
        />
      )}

      {/* ── Modals ── */}
      {selectedStock && (
        <StockModal stock={selectedStock} onClose={() => setSelectedStock(null)} />
      )}

      {showSortModal && (
        <SortModal
          currentSort={sortBy}
          onApply={(sort) => setSortBy(sort)}
          onClose={() => setShowSortModal(false)}
        />
      )}

      {showAddPortfolio && (
        <AddPortfolioModal
          onAdd={handleAddPortfolio}
          onClose={() => setShowAddPortfolio(false)}
        />
      )}

      {showAddStock && selectedPortfolio && (
        <AddStockModal
          portfolioName={selectedPortfolio.name}
          existingTickers={selectedPortfolio.stockTickers}
          onAdd={handleAddStock}
          onClose={() => setShowAddStock(false)}
        />
      )}
    </div>
  );
}
