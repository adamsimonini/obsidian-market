-- Seed data for Obsidian Market
-- This file is automatically run when you execute `supabase db reset`
-- Or manually run with: supabase db execute --file supabase/seed.sql

-- Insert admin wallet addresses
INSERT INTO public.admins (wallet_address, role) VALUES
    ('aleo12jwjgr6uvlydcgjlguyhlp6rfgntnyx7hk5g8k5dllqpjtdngcqqcrhmfj', 'super_admin')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert 20 markets across all categories
-- Reserves determine CPMM price via trigger: price_yes = no_reserves / (yes + no)
-- yes_odds/no_odds kept at 2.0 (legacy v1 field, app uses yes_price/no_price now)

INSERT INTO public.markets (
    title, description, resolution_rules, resolution_source, resolution_deadline,
    status, yes_odds, no_odds, creator_address,
    category_id, slug, market_type, yes_reserves, no_reserves, fee_bps, featured
) VALUES

-- ============ CRYPTO (4) ============

(
    'Will Bitcoin reach $150,000 by end of 2026?',
    'Resolves based on whether BTC reaches or exceeds $150,000 USD by December 31, 2026.',
    'Resolves YES if BTC price reaches $150,000 USD at any point before Dec 31 2026 23:59 UTC on CoinGecko. NO otherwise.',
    'CoinGecko API',
    '2026-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'crypto'),
    'btc-150k-2026', 'binary', 3500, 6500, 200, true
),
(
    'Will Ethereum reach $10,000 by end of 2026?',
    'Resolves based on whether ETH reaches or exceeds $10,000 USD by December 31, 2026.',
    'Resolves YES if ETH price reaches $10,000 USD at any point before Dec 31 2026 23:59 UTC on CoinGecko. NO otherwise.',
    'CoinGecko API',
    '2026-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'crypto'),
    'eth-10k-2026', 'binary', 6000, 4000, 200, false
),
(
    'Will a major stablecoin lose its peg for over 24 hours in 2026?',
    'Covers USDT, USDC, DAI, and any stablecoin with >$1B market cap depegging below $0.95 or above $1.05 for a continuous 24-hour period.',
    'Resolves YES if any stablecoin with >$1B market cap trades below $0.95 or above $1.05 for a continuous 24h period in 2026 per CoinGecko hourly data. NO otherwise.',
    'CoinGecko hourly price data',
    '2026-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'crypto'),
    'stablecoin-depeg-2026', 'binary', 7500, 2500, 200, false
),
(
    'Will Aleo mainnet TVL exceed $500M by end of 2027?',
    'Resolves based on total value locked across all Aleo mainnet protocols exceeding $500M USD.',
    'Resolves YES if Aleo mainnet TVL exceeds $500M USD as reported by DefiLlama at any point before Dec 31 2027. NO otherwise.',
    'DefiLlama',
    '2027-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'crypto'),
    'aleo-tvl-500m-2027', 'binary', 7000, 3000, 200, true
),

-- ============ POLITICS (4) ============

(
    'Will the US pass a federal crypto regulation bill by end of 2027?',
    'Resolves based on whether the US Congress passes and the President signs a comprehensive federal cryptocurrency regulation bill.',
    'Resolves YES if a federal bill specifically regulating cryptocurrency markets is signed into law before Dec 31 2027. Must be a standalone crypto bill, not a rider on other legislation. NO otherwise.',
    'Congress.gov and White House press releases',
    '2027-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'politics'),
    'us-crypto-regulation-2027', 'binary', 4500, 5500, 200, false
),
(
    'Will a third-party candidate receive >5% of the popular vote in the 2028 US presidential election?',
    'Resolves based on the official certified popular vote results of the 2028 US presidential election.',
    'Resolves YES if any candidate not nominated by the Democratic or Republican parties receives more than 5% of the total popular vote in the 2028 presidential election per certified results. NO otherwise.',
    'Federal Election Commission certified results',
    '2029-01-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'politics'),
    'third-party-5pct-2028', 'binary', 7500, 2500, 200, false
),
(
    'Will the EU implement a digital euro CBDC by end of 2027?',
    'Resolves based on whether the European Central Bank launches a digital euro for public use.',
    'Resolves YES if the ECB launches a digital euro available for public transactions before Dec 31 2027. Pilot programs limited to select institutions do not count. NO otherwise.',
    'European Central Bank official announcements',
    '2027-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'politics'),
    'eu-digital-euro-2027', 'binary', 7000, 3000, 200, false
),
(
    'Will the US Federal Reserve cut interest rates by at least 0.5% total in 2026?',
    'Resolves based on whether cumulative Fed rate cuts in 2026 total at least 50 basis points.',
    'Resolves YES if the total cumulative rate cuts announced by the Federal Reserve during 2026 equal or exceed 0.5% (50 bps). Multiple smaller cuts count. NO if total cuts are less than 0.5% or rates increase.',
    'Federal Reserve FOMC statements',
    '2026-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'politics'),
    'fed-rate-cut-2026', 'binary', 4000, 6000, 200, true
),

-- ============ TECHNOLOGY (4) ============

(
    'Will Apple release consumer AR glasses by end of 2026?',
    'Resolves based on whether Apple ships a consumer augmented reality glasses product (not Vision Pro).',
    'Resolves YES if Apple releases a standalone AR glasses product (distinct from Vision Pro/mixed reality headset) available for consumer purchase before Dec 31 2026. NO otherwise.',
    'Apple press releases and product listings',
    '2026-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'technology'),
    'apple-ar-glasses-2026', 'binary', 8000, 2000, 200, false
),
(
    'Will OpenAI release GPT-5 in 2026?',
    'Resolves based on whether OpenAI publicly releases a model officially named GPT-5.',
    'Resolves YES if OpenAI publicly releases (via API or ChatGPT) a model officially branded as "GPT-5" before Dec 31 2026. Internal research models or differently named models do not count. NO otherwise.',
    'OpenAI official blog and API documentation',
    '2026-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'technology'),
    'openai-gpt5-2026', 'binary', 4000, 6000, 200, false
),
(
    'Will autonomous robotaxis operate in more than 10 US cities by end of 2026?',
    'Resolves based on whether fully autonomous (no safety driver) robotaxi services are commercially available in >10 distinct US metro areas.',
    'Resolves YES if at least 10 distinct US metropolitan areas have commercially operating robotaxi services with no safety driver present, available to the general public, before Dec 31 2026. NO otherwise.',
    'Company press releases, state DMV records, and news reports',
    '2026-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'technology'),
    'robotaxi-10-cities-2026', 'binary', 6500, 3500, 200, false
),
(
    'Will global AI chip revenue exceed $200B in 2026?',
    'Resolves based on total worldwide revenue from AI-specific semiconductor chips (GPUs, TPUs, AI accelerators) in calendar year 2026.',
    'Resolves YES if total global AI chip revenue exceeds $200B USD for calendar year 2026 as reported by Gartner, IDC, or equivalent market research firm. NO otherwise.',
    'Gartner or IDC semiconductor market reports',
    '2027-06-30T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'technology'),
    'ai-chip-revenue-200b-2026', 'binary', 3000, 7000, 200, true
),

-- ============ SPORTS (3) ============

(
    'Will Real Madrid win the 2025-26 UEFA Champions League?',
    'Resolves based on the winner of the 2025-26 UEFA Champions League final.',
    'Resolves YES if Real Madrid wins the 2025-26 Champions League final. NO if any other team wins.',
    'UEFA official results',
    '2026-06-30T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'sports'),
    'real-madrid-ucl-2026', 'binary', 7500, 2500, 200, false
),
(
    'Will the USA win the most gold medals at the 2028 Los Angeles Olympics?',
    'Resolves based on final gold medal standings at the 2028 Summer Olympics.',
    'Resolves YES if the United States wins the most gold medals at the 2028 LA Olympics. In case of a tie for most golds, resolves YES if the US is one of the tied nations. NO otherwise.',
    'International Olympic Committee official results',
    '2028-08-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'sports'),
    'usa-most-golds-2028', 'binary', 4000, 6000, 200, false
),
(
    'Will an official marathon be completed in under 2 hours before 2028?',
    'Resolves on whether any runner completes an officially sanctioned marathon in under 2:00:00.',
    'Resolves YES if any runner completes a World Athletics-sanctioned marathon in under 2:00:00 before Dec 31 2027. Unofficial or specially paced attempts (like Kipchoge 2019) do not count. NO otherwise.',
    'World Athletics official records',
    '2027-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'sports'),
    'sub-2hr-marathon-2028', 'binary', 8500, 1500, 200, false
),

-- ============ SCIENCE (3) ============

(
    'Will a room-temperature superconductor be independently verified by end of 2027?',
    'Resolves based on whether a material demonstrating superconductivity at room temperature and ambient pressure is independently replicated.',
    'Resolves YES if a peer-reviewed paper in Nature, Science, or Physical Review Letters confirms room-temperature (>0°C) ambient-pressure superconductivity, independently replicated by at least 2 labs, before Dec 31 2027. NO otherwise.',
    'Nature, Science, or Physical Review Letters',
    '2027-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'science'),
    'room-temp-superconductor-2027', 'binary', 9000, 1000, 200, false
),
(
    'Will SpaceX Starship complete a full orbital flight by end of 2026?',
    'Resolves based on whether SpaceX Starship completes a full orbital trajectory and controlled landing/splashdown.',
    'Resolves YES if Starship (upper stage) completes at least one full orbit of Earth and achieves a controlled landing or splashdown before Dec 31 2026. NO otherwise.',
    'SpaceX official communications and FAA records',
    '2026-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'science'),
    'starship-orbital-2026', 'binary', 2500, 7500, 200, false
),
(
    'Will a CRISPR gene therapy be approved for a common disease by end of 2027?',
    'Resolves on FDA or EMA approval of a CRISPR-based therapy for a disease affecting >1M people in the US or EU.',
    'Resolves YES if the FDA or EMA grants full approval (not just breakthrough designation) to a CRISPR-based gene therapy for a disease affecting >1M people in the US or EU before Dec 31 2027. NO otherwise.',
    'FDA and EMA approval databases',
    '2027-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'science'),
    'crispr-common-disease-2027', 'binary', 6000, 4000, 200, false
),

-- ============ CULTURE (2) ============

(
    'Will an AI-generated film win a major film festival award by end of 2027?',
    'Resolves based on whether a film primarily generated by AI wins an award at Cannes, Venice, Berlin, Sundance, or Toronto film festivals.',
    'Resolves YES if a film where the majority of visual content is AI-generated wins an official award (not special mention) at Cannes, Venice, Berlin, Sundance, or TIFF before Dec 31 2027. Short film awards count. NO otherwise.',
    'Official film festival announcements',
    '2027-12-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'culture'),
    'ai-film-festival-2027', 'binary', 6500, 3500, 200, false
),
(
    'Will global box office revenue exceed $50B in 2026?',
    'Resolves based on total worldwide theatrical box office revenue for calendar year 2026.',
    'Resolves YES if total global theatrical box office revenue exceeds $50B USD for 2026 as reported by Box Office Mojo or The Numbers. NO otherwise.',
    'Box Office Mojo / The Numbers annual reports',
    '2027-03-31T23:59:59Z',
    'open', 2.0, 2.0,
    'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
    (SELECT id FROM public.categories WHERE slug = 'culture'),
    'box-office-50b-2026', 'binary', 5000, 5000, 200, false
)

ON CONFLICT DO NOTHING;
