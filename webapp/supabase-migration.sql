-- Supabase Migration Script for Obsidian Market
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create markets table
CREATE TABLE IF NOT EXISTS markets (
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
CREATE TABLE IF NOT EXISTS admins (
    wallet_address TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_created_at ON markets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_markets_market_id_onchain ON markets(market_id_onchain);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_markets_updated_at ON markets;
CREATE TRIGGER update_markets_updated_at 
    BEFORE UPDATE ON markets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Markets are viewable by everyone" ON markets;
DROP POLICY IF EXISTS "Admins can create markets" ON markets;
DROP POLICY IF EXISTS "Admins can update markets" ON markets;
DROP POLICY IF EXISTS "Admins list is viewable by everyone" ON admins;
DROP POLICY IF EXISTS "Admins can add other admins" ON admins;

-- RLS Policies for markets
-- Public read access
CREATE POLICY "Markets are viewable by everyone"
    ON markets FOR SELECT
    USING (true);

-- Allow anyone to insert (we'll check admin status in app logic for MVP)
CREATE POLICY "Anyone can create markets"
    ON markets FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update (we'll check admin status in app logic for MVP)
CREATE POLICY "Anyone can update markets"
    ON markets FOR UPDATE
    USING (true);

-- RLS Policies for admins
-- Public read access
CREATE POLICY "Admins list is viewable by everyone"
    ON admins FOR SELECT
    USING (true);

-- Allow anyone to insert (we'll check admin status in app logic for MVP)
CREATE POLICY "Anyone can add admins"
    ON admins FOR INSERT
    WITH CHECK (true);

