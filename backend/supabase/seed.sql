-- Seed data for Obsidian Market
-- This file is automatically run when you execute `supabase db reset`
-- Or manually run with: supabase db execute --file supabase/seed.sql

-- Insert admin wallet addresses
INSERT INTO public.admins (wallet_address) VALUES
    ('aleo12jwjgr6uvlydcgjlguyhlp6rfgntnyx7hk5g8k5dllqpjtdngcqqcrhmfj')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert example markets
INSERT INTO public.markets (
    title,
    description,
    resolution_rules,
    resolution_source,
    resolution_deadline,
    status,
    yes_odds,
    no_odds,
    creator_address,
    market_id_onchain
) VALUES
    (
        'Will Bitcoin reach $150,000 by end of 2026?',
        'This market resolves based on whether Bitcoin (BTC) reaches or exceeds $150,000 USD by December 31, 2026 at 11:59 PM UTC.',
        'Market resolves to YES if Bitcoin (BTC) price reaches or exceeds $150,000 USD at any point before December 31, 2026 11:59 PM UTC, as reported by CoinGecko. Market resolves to NO otherwise.',
        'CoinGecko API (https://www.coingecko.com/en/api)',
        '2026-12-31T23:59:59Z',
        'open',
        2.50,
        1.67,
        'aleo1qg23nrrrlf6h7fqq7amk9wqzs06sluh7tm5y6lgg9svpqpck0qqqv9h0sw',
        NULL
    ),
    (
        'Will the US Federal Reserve cut interest rates by at least 0.5% in 2025?',
        'This market resolves based on whether the US Federal Reserve reduces the federal funds rate by at least 0.5 percentage points (50 basis points) at any point during calendar year 2025.',
        'Market resolves to YES if the Federal Reserve announces a rate cut of at least 0.5% (50 basis points) during 2025, as reported by official Fed announcements. Multiple smaller cuts that sum to 0.5% or more also count. Market resolves to NO if total cuts are less than 0.5% or if rates increase.',
        'Federal Reserve official announcements and FOMC statements',
        '2025-12-31T23:59:59Z',
        'open',
        1.80,
        2.00,
        'aleo1qg23nrrrlf6h7fqq7amk9wqzs06sluh7tm5y6lgg9svpqpck0qqqv9h0sw',
        NULL
    ),
    (
        'Will AI-generated content be regulated by the EU before 2027?',
        'This market resolves based on whether the European Union passes and enforces comprehensive legislation specifically regulating AI-generated content (including deepfakes, synthetic media, and AI-authored content) before January 1, 2027.',
        'Market resolves to YES if the EU passes binding legislation that specifically regulates AI-generated content and it comes into effect before 2027. The regulation must be EU-wide (not just individual member states) and must specifically address AI-generated content. Market resolves to NO if no such regulation is in effect by the deadline.',
        'Official EU legislation database (EUR-Lex) and European Commission announcements',
        '2026-12-31T23:59:59Z',
        'open',
        1.50,
        2.50,
        'aleo1qg23nrrrlf6h7fqq7amk9wqzs06sluh7tm5y6lgg9svpqpck0qqqv9h0sw',
        NULL
    )
ON CONFLICT DO NOTHING;

