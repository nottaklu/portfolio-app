# Database Migrations

This folder contains SQL migrations for Supabase schema updates.

## How to Apply Migrations

### Via Supabase Dashboard (Easiest)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `001_add_sheet_config.sql`)
5. Paste it into the query editor
6. Click **Run**

### Via Supabase CLI
```bash
supabase migration up
```

## Current Migrations

### `001_add_sheet_config.sql`
Adds the `sheet_config` column to the `portfolios` table to persist Google Sheet portfolio configurations across deployments. This ensures that when you deploy to Vercel or any environment, your sheet portfolio settings are retained.

**What it does:**
- Adds `sheet_config` (jsonb) column to store Google Sheet URL, sheet name, and range
- Creates an index for efficient queries
- No data loss—existing portfolios are unaffected

**After running this migration:**
- Sheet portfolios created in the deployed app will automatically sync on Vercel
- No need to re-enter Google Sheet details after redeployment
