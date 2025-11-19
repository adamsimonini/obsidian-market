# Supabase Database Schema

## Overview

This document defines the database schema for Obsidian Market. The schema stores market metadata, admin information, and links to on-chain Aleo contract data.

## Tables

### markets

Stores prediction market metadata and configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique market identifier |
| title | TEXT | NOT NULL | Market question/title |
| description | TEXT | | Market description and details |
| resolution_rules | TEXT | NOT NULL | Explicit criteria for how market resolves |
| resolution_source | TEXT | NOT NULL | Source of truth for resolution (e.g., "Admin manual") |
| resolution_deadline | TIMESTAMPTZ | NOT NULL | Date/time when market must be resolved by |
| status | TEXT | NOT NULL, CHECK (status IN ('open', 'closed', 'resolved', 'cancelled')) | Current market status |
| yes_odds | NUMERIC(10,2) | NOT NULL | Fixed odds for Yes outcome (e.g., 2.00) |
| no_odds | NUMERIC(10,2) | NOT NULL | Fixed odds for No outcome (e.g., 2.00) |
| creator_address | TEXT | NOT NULL | Admin wallet address who created the market |
| market_id_onchain | TEXT | UNIQUE | Market ID on Aleo blockchain (links to contract) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Market creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes:**
- `idx_markets_status` on `status` - For filtering by status
- `idx_markets_created_at` on `created_at DESC` - For sorting by newest
- `idx_markets_market_id_onchain` on `market_id_onchain` - For linking to on-chain data

### admins

Stores admin wallet addresses with permission to create markets.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| wallet_address | TEXT | PRIMARY KEY | Admin wallet address (Aleo address format) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | When admin was added |

**Indexes:**
- Primary key on `wallet_address` provides fast lookup

## Row Level Security (RLS) Policies

### markets table

- **Public Read**: Anyone can read markets (SELECT)
- **Admin Write**: Only admins can create/update markets (INSERT, UPDATE)
- **No Delete**: Markets cannot be deleted (only status changed to 'cancelled')

### admins table

- **Public Read**: Anyone can read admin list (to check admin status)
- **Admin Write**: Only existing admins can add new admins (INSERT)
- **No Delete**: Admins cannot be deleted via API (manual DB operation only)

## SQL Migration Script

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create markets table
CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    resolution_rules TEXT NOT NULL,
    resolution_source TEXT NOT NULL,
    resolution_deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'resolved', 'cancelled')),
    yes_odds NUMERIC(10,2) NOT NULL CHECK (yes_odds > 0),
    no_odds NUMERIC(10,2) NOT NULL CHECK (no_odds > 0),
    creator_address TEXT NOT NULL,
    market_id_onchain TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admins table
CREATE TABLE admins (
    wallet_address TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_created_at ON markets(created_at DESC);
CREATE INDEX idx_markets_market_id_onchain ON markets(market_id_onchain);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_markets_updated_at 
    BEFORE UPDATE ON markets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for markets
-- Public read access
CREATE POLICY "Markets are viewable by everyone"
    ON markets FOR SELECT
    USING (true);

-- Admin write access (check if creator is admin)
CREATE POLICY "Admins can create markets"
    ON markets FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE wallet_address = creator_address
        )
    );

-- Admin update access
CREATE POLICY "Admins can update markets"
    ON markets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );

-- RLS Policies for admins
-- Public read access
CREATE POLICY "Admins list is viewable by everyone"
    ON admins FOR SELECT
    USING (true);

-- Admin write access (only existing admins can add)
CREATE POLICY "Admins can add other admins"
    ON admins FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    );
```

## Notes

- The `market_id_onchain` field links Supabase records to Aleo contract state
- Status enum values: 'open', 'closed', 'resolved', 'cancelled'
- Odds are stored as numeric (e.g., 2.00 for 2:1 odds)
- RLS policies use JWT claims for authentication (will need to be configured with Supabase Auth or custom solution)
- For MVP, RLS policies may be simplified to allow public reads and admin-only writes via application logic

