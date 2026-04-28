import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoginScreen from './components/Auth/LoginScreen';
import MpinScreen from './components/Auth/MpinScreen';
import SetMpinScreen from './components/Auth/SetMpinScreen';
import PortfolioOverview from './components/PortfolioOverview/PortfolioOverview';
import PortfolioDetail from './components/PortfolioDetail/PortfolioDetail';
import Dashboard from './components/Dashboard/Dashboard';
import BottomNav from './components/BottomNav/BottomNav';
import StockModal from './components/StockDetail/StockModal';
import SortModal from './components/SortModal/SortModal';
import AddPortfolioModal from './components/AddPortfolioModal/AddPortfolioModal';
import AddStockModal from './components/AddStockModal/AddStockModal';
import TickerTape from './components/TickerTape/TickerTape';
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen';
import { useAuth } from './hooks/useAuth';
import { usePortfolios } from './hooks/usePortfolios';
import { fetchAllLivePrices } from './lib/yahooFinance';
import './styles/globals.css';
import './styles/animations.css';

const REFRESH_INTERVAL = 5 * 60 * 1000;

export default function App() {
  const auth = useAuth();

  const {
    portfolios: userPortfolios,
    stocks,
    loading: dataLoading,
    addPortfolio,
    addStock,
    editStock,
    deletePortfolio,
    deleteStock,
    updateStockPrices,
    reload,
    sheetLoading,
    sheetError,
    refreshSheets,
  } = usePortfolios(auth.user?.id);

  // ── Tabs ──
  const [activeTab, setActiveTab] = useState('portfolio');

  // ── Screen state ──
  const [screen, setScreen] = useState('overview');
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [sortBy, setSortBy] = useState('value');
  const [priceStatus, setPriceStatus] = useState('loading');
  const [refreshing, setRefreshing] = useState(false);

  // ── Build "All Portfolios" auto-card ──
  const allPortfolios = useMemo(() => {
    // Collect all unique tickers from all portfolios
    const allTickers = [...new Set(userPortfolios.flatMap((p) => p.stockTickers))];
    const allCard = {
      id: '__all__',
      name: 'All Portfolios',
      color: '#4F46E5',
      type: 'auto',
      stockTickers: allTickers,
    };
    return [allCard, ...userPortfolios];
  }, [userPortfolios]);

  // ── Build portfolio-color map for "All" view indicator ──
  const tickerPortfolioMap = useMemo(() => {
    const map = {};
    userPortfolios.forEach((pf) => {
      pf.stockTickers.forEach((t) => {
        if (!map[t]) map[t] = [];
        map[t].push({ name: pf.name, color: pf.color });
      });
    });
    return map;
  }, [userPortfolios]);

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
      console.log('Fetched prices:', priceMap);
      updateStockPrices(priceMap);
      setPriceStatus(result.errors?.length > 0 ? 'stale' : 'live');
      if (result.errors?.length > 0) {
        console.warn('Price fetch errors:', result.errors);
      }
    } catch (err) {
      console.error('Price fetch failed:', err);
      setPriceStatus('error');
    }
  }, [stocks, updateStockPrices]);

  useEffect(() => {
    if (auth.authState !== 'ready' || dataLoading) return;
    const timer = setTimeout(fetchPrices, 500);
    const interval = setInterval(fetchPrices, REFRESH_INTERVAL);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [auth.authState, dataLoading, fetchPrices]);

  // Keep selectedPortfolio in sync
  useEffect(() => {
    if (selectedPortfolio) {
      const updated = allPortfolios.find((p) => p.id === selectedPortfolio.id);
      if (updated) setSelectedPortfolio(updated);
    }
  }, [allPortfolios]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSheets();
      await fetchPrices();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    try {
      await deletePortfolio(portfolioId);
      await reload();
      setSelectedPortfolio(null);
      setScreen('overview');
    } catch {}
  };

  const handleAddPortfolio = async (newPortfolio, sheetConfig) => {
    try {
      const created = await addPortfolio(newPortfolio, sheetConfig);
      if (newPortfolio.type === 'sheets' && sheetConfig) {
        await refreshSheets();
        setSelectedPortfolio(created);
        setScreen('detail');
      }
    } catch {}
  };

  const handleAddStock = async (stockData) => {
    if (!selectedPortfolio) return;
    try {
      await addStock(selectedPortfolio.id, stockData);
      fetchAllLivePrices([stockData.ticker]).then((r) => updateStockPrices(r.prices || r)).catch(() => {});
    } catch {}
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'portfolio') {
      setScreen('overview');
      setSelectedPortfolio(null);
    }
  };

  // ─── AUTH SCREENS ────────────────────────────────────────────
  if (auth.authState === 'loading') {
    return (
      <div className="app-container">
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (auth.authState === 'login') {
    return <div className="app-container"><LoginScreen onLogin={auth.login} loading={auth.loading} error={auth.error} /></div>;
  }

  if (auth.authState === 'set-mpin') {
    return <div className="app-container"><SetMpinScreen displayName={auth.profile?.display_name} onSetMpin={auth.setMpin} loading={auth.loading} /></div>;
  }

  if (auth.authState === 'mpin') {
    return <div className="app-container"><MpinScreen displayName={auth.profile?.display_name} onVerify={auth.verifyMpin} onLogout={auth.logout} loading={auth.loading} error={auth.error} /></div>;
  }

  // ─── MAIN APP ────────────────────────────────────────────────
  const isReady = auth.authState === 'ready';

  return (
    <div className={`app-container ${isReady ? 'has-ticker' : ''}`}>
      {isReady && (
        <WelcomeScreen 
          displayName={auth.profile?.display_name || 'Siddh'} 
        />
      )}
      
      {isReady && <TickerTape stocks={stocks} />}

      {/* ── Portfolio Tab ── */}
      {activeTab === 'portfolio' && screen === 'overview' && (
        <PortfolioOverview
          portfolios={allPortfolios}
          stocks={stocks}
          onSelectPortfolio={handleSelectPortfolio}
          onAddPortfolio={() => setShowAddPortfolio(true)}
          loading={dataLoading}
          priceStatus={priceStatus}
          onRefresh={handleRefresh}
          refreshing={refreshing || sheetLoading}
          displayName={auth.profile?.display_name}
          onLogout={auth.logout}
        />
      )}

      {activeTab === 'portfolio' && screen === 'detail' && selectedPortfolio && (
        <PortfolioDetail
          portfolio={selectedPortfolio}
          stocks={stocks}
          onBack={handleBack}
          onStockClick={(stock) => setSelectedStock(stock)}
          onOpenSort={() => setShowSortModal(true)}
          onAddStock={selectedPortfolio.id !== '__all__' ? () => setShowAddStock(true) : undefined}
          onDeletePortfolio={selectedPortfolio.id !== '__all__' ? handleDeletePortfolio : undefined}
          sortBy={sortBy}
          loading={false}
          tickerPortfolioMap={selectedPortfolio.id === '__all__' ? tickerPortfolioMap : null}
        />
      )}

      {/* ── Dashboard Tab ── */}
      {activeTab === 'dashboard' && (
        <Dashboard
          stocks={stocks}
          portfolios={userPortfolios}
          displayName={auth.profile?.display_name}
        />
      )}

      {/* ── Bottom Nav ── */}
      {(screen === 'overview' || activeTab === 'dashboard') && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {/* ── Modals ── */}
      {selectedStock && (
        <StockModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          portfolioId={selectedPortfolio?.id !== '__all__' ? selectedPortfolio?.id : null}
          onEditStock={selectedPortfolio?.id !== '__all__' ? (ticker, qty, avg) => {
            editStock(selectedPortfolio.id, ticker, qty, avg);
            setSelectedStock((prev) => prev ? { ...prev, qty, avgPrice: avg } : null);
          } : null}
          onRemoveStock={selectedPortfolio?.id !== '__all__' ? (ticker) => {
            deleteStock(selectedPortfolio.id, ticker);
          } : null}
        />
      )}

      {showSortModal && (
        <SortModal currentSort={sortBy} onApply={(s) => setSortBy(s)} onClose={() => setShowSortModal(false)} />
      )}

      {showAddPortfolio && (
        <AddPortfolioModal onAdd={handleAddPortfolio} onClose={() => setShowAddPortfolio(false)} />
      )}

      {showAddStock && selectedPortfolio && selectedPortfolio.id !== '__all__' && (
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
