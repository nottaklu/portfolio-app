import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchStocks, fetchLivePrice } from '../../lib/yahooFinance';
import { formatCurrencyDecimal } from '../../utils/formatters';
import './AddStockModal.css';

export default function AddStockModal({ portfolioName, existingTickers, onAdd, onClose }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [livePrice, setLivePrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [qty, setQty] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchRef.current?.focus(), 400);
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Debounced live search ──
  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 1) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const res = await searchStocks(q);
      // Filter out already-added tickers
      setResults(res.filter((s) => !existingTickers.includes(s.ticker)));
    } catch {
      setResults([]);
    }
    setSearching(false);
  }, [existingTickers]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setSelectedStock(null);
    setLivePrice(null);

    // Debounce 300ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  // ── Select a stock → fetch its live price ──
  const handleSelectStock = async (stock) => {
    setSelectedStock(stock);
    setSearch(stock.name);
    setResults([]);
    setLoadingPrice(true);
    setLivePrice(null);

    try {
      const priceData = await fetchLivePrice(stock.ticker);
      setLivePrice(priceData);
    } catch {
      setLivePrice(null);
    }
    setLoadingPrice(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStock || !qty || !avgPrice) return;

    const price = livePrice?.currentPrice || parseFloat(avgPrice);
    const prevClose = livePrice?.previousClose || price;

    onAdd({
      ticker: selectedStock.ticker,
      name: selectedStock.name,
      sector: selectedStock.sector || '-',
      industry: selectedStock.industry || selectedStock.sector || '-',
      qty: parseInt(qty, 10),
      avgPrice: parseFloat(avgPrice),
      currentPrice: price,
      previousClose: prevClose,
      dayHigh: livePrice?.dayHigh || price,
      dayLow: livePrice?.dayLow || price,
      fiftyTwoWeekHigh: livePrice?.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: livePrice?.fiftyTwoWeekLow || 0,
      marketCap: '-',
      pe: 0,
    });
    handleClose();
  };

  const isValid = selectedStock && qty && parseInt(qty) > 0 && avgPrice && parseFloat(avgPrice) > 0;

  return (
    <div
      className={`add-stock-overlay ${isVisible ? 'visible' : ''}`}
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
    >
      <div className={`add-stock-modal ${isVisible ? 'visible' : ''}`}>
        <div className="add-stock-handle-bar"><div className="add-stock-handle" /></div>

        <h2 className="add-stock-title">Add Stock</h2>
        <p className="add-stock-subtitle">Add to {portfolioName}</p>

        <form onSubmit={handleSubmit} className="add-stock-form">
          {/* ── Live Search ── */}
          <div className="add-stock-field">
            <label className="add-stock-label">Search Stock</label>
            <div className="add-stock-search-wrap">
              <svg className="add-stock-search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                className="add-stock-search-input"
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search any NSE stock..."
              />
              {searching && <div className="add-stock-spinner" />}
            </div>

            {/* Results dropdown */}
            {!selectedStock && results.length > 0 && (
              <div className="add-stock-suggestions">
                {results.map((s) => (
                  <button
                    key={s.ticker}
                    type="button"
                    className="add-stock-suggestion pressable"
                    onClick={() => handleSelectStock(s)}
                  >
                    <div className="add-stock-suggestion-left">
                      <span className="add-stock-suggestion-ticker">{s.ticker}</span>
                      <span className="add-stock-suggestion-name">{s.name}</span>
                    </div>
                    <span className="add-stock-suggestion-exchange">{s.exchange}</span>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {!selectedStock && search.length >= 2 && !searching && results.length === 0 && (
              <div className="add-stock-no-results">
                No stocks found for "{search}"
              </div>
            )}
          </div>

          {/* ── Selected stock card with live price ── */}
          {selectedStock && (
            <div className="add-stock-selected">
              <div className="add-stock-selected-top">
                <div className="add-stock-selected-left">
                  <span className="add-stock-selected-ticker">{selectedStock.ticker}</span>
                  <span className="add-stock-selected-name">{selectedStock.name}</span>
                </div>
                <button
                  type="button"
                  className="add-stock-change-btn"
                  onClick={() => { setSelectedStock(null); setLivePrice(null); setSearch(''); searchRef.current?.focus(); }}
                >
                  Change
                </button>
              </div>
              {loadingPrice ? (
                <div className="add-stock-price-loading">
                  <div className="add-stock-spinner" />
                  <span>Fetching live price...</span>
                </div>
              ) : livePrice ? (
                <div className="add-stock-price-live">
                  <div className="add-stock-price-row">
                    <span className="add-stock-price-label">Live Price</span>
                    <span className="add-stock-price-value tabular-nums">
                      {formatCurrencyDecimal(livePrice.currentPrice)}
                    </span>
                  </div>
                  <div className="add-stock-price-row">
                    <span className="add-stock-price-label">Day Change</span>
                    <span className={`add-stock-price-change tabular-nums ${livePrice.dayChange >= 0 ? 'positive' : 'negative'}`}>
                      {livePrice.dayChange >= 0 ? '▲' : '▼'} {Math.abs(livePrice.dayChangePct).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="add-stock-price-loading">
                  <span>Price unavailable — will update after adding</span>
                </div>
              )}
            </div>
          )}

          {/* ── Qty + Price inputs ── */}
          {selectedStock && (
            <div className="add-stock-row">
              <div className="add-stock-field add-stock-half">
                <label className="add-stock-label">Quantity</label>
                <input
                  className="add-stock-input"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="e.g. 50"
                />
              </div>
              <div className="add-stock-field add-stock-half">
                <label className="add-stock-label">Avg Buy Price</label>
                <div className="add-stock-input-wrap">
                  <span className="add-stock-input-prefix">₹</span>
                  <input
                    className="add-stock-input add-stock-input-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="add-stock-submit pressable"
            disabled={!isValid}
          >
            Add Stock
          </button>
        </form>
      </div>
    </div>
  );
}
