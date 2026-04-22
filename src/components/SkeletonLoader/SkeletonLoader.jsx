import React from 'react';
import './SkeletonLoader.css';

// ─── SUMMARY CARDS SKELETON ──────────────────────────────────
export function SummaryCardsSkeleton() {
  return (
    <div className="skeleton-summary-cards">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton-summary-card">
          <div className="skeleton skeleton-label" />
          <div className="skeleton skeleton-value" />
        </div>
      ))}
    </div>
  );
}

// ─── PORTFOLIO LIST SKELETON ──────────────────────────────────
export function PortfolioListSkeleton() {
  return (
    <div className="skeleton-portfolio-list">
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton-portfolio-card">
          <div className="skeleton-portfolio-strip skeleton" />
          <div className="skeleton-portfolio-content">
            <div className="skeleton skeleton-pf-name" />
            <div className="skeleton skeleton-pf-value" />
            <div className="skeleton-pf-row">
              <div className="skeleton skeleton-pf-detail" />
              <div className="skeleton skeleton-pf-detail" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TILE VIEW SKELETON ──────────────────────────────────────
export function TileViewSkeleton() {
  return (
    <div className="skeleton-tile-grid">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton-tile">
          <div className="skeleton-tile-top">
            <div className="skeleton skeleton-tile-badge" />
          </div>
          <div className="skeleton skeleton-tile-name" />
          <div className="skeleton skeleton-tile-price" />
          <div className="skeleton-tile-bottom">
            <div className="skeleton skeleton-tile-detail" />
            <div className="skeleton skeleton-tile-detail" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ROW VIEW SKELETON ───────────────────────────────────────
export function RowViewSkeleton() {
  return (
    <div className="skeleton-row-list">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton skeleton-row-avatar" />
          <div className="skeleton-row-info">
            <div className="skeleton skeleton-row-name" />
            <div className="skeleton skeleton-row-sub" />
          </div>
          <div className="skeleton-row-right">
            <div className="skeleton skeleton-row-price" />
            <div className="skeleton skeleton-row-pnl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── HEADER SKELETON ──────────────────────────────────────────
export function HeaderSkeleton() {
  return (
    <div className="skeleton-header">
      <div className="skeleton skeleton-header-title" />
      <div className="skeleton skeleton-header-value" />
      <div className="skeleton skeleton-header-badge" />
    </div>
  );
}
