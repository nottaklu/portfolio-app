-- Add sheet_config column to portfolios table for Google Sheet configuration persistence
-- This allows sheet portfolio configs to persist across deployments without relying on localStorage

ALTER TABLE portfolios 
ADD COLUMN sheet_config jsonb DEFAULT NULL;

-- Index for faster queries filtering by sheet_config
CREATE INDEX idx_portfolios_sheet_config ON portfolios USING gin(sheet_config) WHERE sheet_config IS NOT NULL;
