-- =============================================================================
-- Obsidian Market — Seed Data (en / es / fr)
-- Run: supabase db reset   (auto-runs migrations + this seed)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- ADMIN
-- ---------------------------------------------------------------------------
INSERT INTO public.admins (wallet_address, role) VALUES
    ('aleo12jwjgr6uvlydcgjlguyhlp6rfgntnyx7hk5g8k5dllqpjtdngcqqcrhmfj', 'super_admin')
ON CONFLICT (wallet_address) DO NOTHING;


-- ---------------------------------------------------------------------------
-- CATEGORIES  (base rows are language-agnostic; text lives in translations)
-- ---------------------------------------------------------------------------
INSERT INTO public.categories (slug, display_order) VALUES
    ('crypto',     1),
    ('politics',   2),
    ('technology', 3),
    ('sports',     4),
    ('science',    5),
    ('culture',    6)
ON CONFLICT (slug) DO NOTHING;

-- Category translations: en
INSERT INTO public.category_translations (category_id, language_code, name, description) VALUES
    ((SELECT id FROM categories WHERE slug='crypto'),     'en', 'Crypto',     'Cryptocurrency and blockchain markets'),
    ((SELECT id FROM categories WHERE slug='politics'),   'en', 'Politics',   'Government, elections, and policy markets'),
    ((SELECT id FROM categories WHERE slug='technology'), 'en', 'Technology', 'Tech industry and innovation markets'),
    ((SELECT id FROM categories WHERE slug='sports'),     'en', 'Sports',     'Sporting events and competitions'),
    ((SELECT id FROM categories WHERE slug='science'),    'en', 'Science',    'Scientific breakthroughs and space'),
    ((SELECT id FROM categories WHERE slug='culture'),    'en', 'Culture',    'Entertainment, film, and media');

-- Category translations: es
INSERT INTO public.category_translations (category_id, language_code, name, description) VALUES
    ((SELECT id FROM categories WHERE slug='crypto'),     'es', 'Cripto',       'Mercados de criptomonedas y blockchain'),
    ((SELECT id FROM categories WHERE slug='politics'),   'es', 'Política',     'Gobierno, elecciones y políticas públicas'),
    ((SELECT id FROM categories WHERE slug='technology'), 'es', 'Tecnología',   'Industria tecnológica e innovación'),
    ((SELECT id FROM categories WHERE slug='sports'),     'es', 'Deportes',     'Eventos y competiciones deportivas'),
    ((SELECT id FROM categories WHERE slug='science'),    'es', 'Ciencia',      'Descubrimientos científicos y espacio'),
    ((SELECT id FROM categories WHERE slug='culture'),    'es', 'Cultura',      'Entretenimiento, cine y medios');

-- Category translations: fr
INSERT INTO public.category_translations (category_id, language_code, name, description) VALUES
    ((SELECT id FROM categories WHERE slug='crypto'),     'fr', 'Crypto',       'Marchés de cryptomonnaies et blockchain'),
    ((SELECT id FROM categories WHERE slug='politics'),   'fr', 'Politique',    'Gouvernement, élections et politiques publiques'),
    ((SELECT id FROM categories WHERE slug='technology'), 'fr', 'Technologie',  'Industrie technologique et innovation'),
    ((SELECT id FROM categories WHERE slug='sports'),     'fr', 'Sports',       'Événements et compétitions sportives'),
    ((SELECT id FROM categories WHERE slug='science'),    'fr', 'Science',      'Découvertes scientifiques et espace'),
    ((SELECT id FROM categories WHERE slug='culture'),    'fr', 'Culture',      'Divertissement, cinéma et médias');


-- ---------------------------------------------------------------------------
-- MARKETS  (20 markets across 6 categories)
-- Reserves determine CPMM price via trigger: price_yes = no_reserves / (yes + no)
-- ---------------------------------------------------------------------------

INSERT INTO public.markets (
    slug, category_id, market_type, resolution_deadline, status,
    creator_address, yes_reserves, no_reserves, yes_odds, no_odds, fee_bps, featured
) VALUES

-- CRYPTO (4)
('btc-150k-2026',
 (SELECT id FROM categories WHERE slug='crypto'), 'binary',
 '2026-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 3500, 6500, 2.0, 2.0, 200, true),

('eth-10k-2026',
 (SELECT id FROM categories WHERE slug='crypto'), 'binary',
 '2026-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 6000, 4000, 2.0, 2.0, 200, false),

('stablecoin-depeg-2026',
 (SELECT id FROM categories WHERE slug='crypto'), 'binary',
 '2026-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 7500, 2500, 2.0, 2.0, 200, false),

('aleo-tvl-500m-2027',
 (SELECT id FROM categories WHERE slug='crypto'), 'binary',
 '2027-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 7000, 3000, 2.0, 2.0, 200, true),

-- POLITICS (4)
('us-crypto-regulation-2027',
 (SELECT id FROM categories WHERE slug='politics'), 'binary',
 '2027-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 4500, 5500, 2.0, 2.0, 200, false),

('third-party-5pct-2028',
 (SELECT id FROM categories WHERE slug='politics'), 'binary',
 '2029-01-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 7500, 2500, 2.0, 2.0, 200, false),

('eu-digital-euro-2027',
 (SELECT id FROM categories WHERE slug='politics'), 'binary',
 '2027-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 7000, 3000, 2.0, 2.0, 200, false),

('fed-rate-cut-2026',
 (SELECT id FROM categories WHERE slug='politics'), 'binary',
 '2026-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 4000, 6000, 2.0, 2.0, 200, true),

-- TECHNOLOGY (4)
('apple-ar-glasses-2026',
 (SELECT id FROM categories WHERE slug='technology'), 'binary',
 '2026-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 8000, 2000, 2.0, 2.0, 200, false),

('openai-gpt5-2026',
 (SELECT id FROM categories WHERE slug='technology'), 'binary',
 '2026-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 4000, 6000, 2.0, 2.0, 200, false),

('robotaxi-10-cities-2026',
 (SELECT id FROM categories WHERE slug='technology'), 'binary',
 '2026-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 6500, 3500, 2.0, 2.0, 200, false),

('ai-chip-revenue-200b-2026',
 (SELECT id FROM categories WHERE slug='technology'), 'binary',
 '2027-06-30T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 3000, 7000, 2.0, 2.0, 200, true),

-- SPORTS (3)
('real-madrid-ucl-2026',
 (SELECT id FROM categories WHERE slug='sports'), 'binary',
 '2026-06-30T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 7500, 2500, 2.0, 2.0, 200, false),

('usa-most-golds-2028',
 (SELECT id FROM categories WHERE slug='sports'), 'binary',
 '2028-08-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 4000, 6000, 2.0, 2.0, 200, false),

('sub-2hr-marathon-2028',
 (SELECT id FROM categories WHERE slug='sports'), 'binary',
 '2027-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 8500, 1500, 2.0, 2.0, 200, false),

-- SCIENCE (3)
('room-temp-superconductor-2027',
 (SELECT id FROM categories WHERE slug='science'), 'binary',
 '2027-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 9000, 1000, 2.0, 2.0, 200, false),

('starship-orbital-2026',
 (SELECT id FROM categories WHERE slug='science'), 'binary',
 '2026-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 2500, 7500, 2.0, 2.0, 200, false),

('crispr-common-disease-2027',
 (SELECT id FROM categories WHERE slug='science'), 'binary',
 '2027-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 6000, 4000, 2.0, 2.0, 200, false),

-- CULTURE (2)
('ai-film-festival-2027',
 (SELECT id FROM categories WHERE slug='culture'), 'binary',
 '2027-12-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 6500, 3500, 2.0, 2.0, 200, false),

('box-office-50b-2026',
 (SELECT id FROM categories WHERE slug='culture'), 'binary',
 '2027-03-31T23:59:59Z', 'open',
 'aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv',
 5000, 5000, 2.0, 2.0, 200, false)

ON CONFLICT DO NOTHING;


-- ---------------------------------------------------------------------------
-- MARKET TRANSLATIONS — English
-- ---------------------------------------------------------------------------
INSERT INTO public.market_translations (market_id, language_code, title, description, resolution_rules, resolution_source) VALUES

-- Crypto
((SELECT id FROM markets WHERE slug='btc-150k-2026'), 'en',
 'Will Bitcoin reach $150,000 by end of 2026?',
 'Resolves based on whether BTC reaches or exceeds $150,000 USD by December 31, 2026.',
 'Resolves YES if BTC price reaches $150,000 USD at any point before Dec 31 2026 23:59 UTC on CoinGecko. NO otherwise.',
 'CoinGecko API'),

((SELECT id FROM markets WHERE slug='eth-10k-2026'), 'en',
 'Will Ethereum reach $10,000 by end of 2026?',
 'Resolves based on whether ETH reaches or exceeds $10,000 USD by December 31, 2026.',
 'Resolves YES if ETH price reaches $10,000 USD at any point before Dec 31 2026 23:59 UTC on CoinGecko. NO otherwise.',
 'CoinGecko API'),

((SELECT id FROM markets WHERE slug='stablecoin-depeg-2026'), 'en',
 'Will a major stablecoin lose its peg for over 24 hours in 2026?',
 'Covers USDT, USDC, DAI, and any stablecoin with >$1B market cap depegging below $0.95 or above $1.05 for a continuous 24-hour period.',
 'Resolves YES if any stablecoin with >$1B market cap trades below $0.95 or above $1.05 for a continuous 24h period in 2026 per CoinGecko hourly data. NO otherwise.',
 'CoinGecko hourly price data'),

((SELECT id FROM markets WHERE slug='aleo-tvl-500m-2027'), 'en',
 'Will Aleo mainnet TVL exceed $500M by end of 2027?',
 'Resolves based on total value locked across all Aleo mainnet protocols exceeding $500M USD.',
 'Resolves YES if Aleo mainnet TVL exceeds $500M USD as reported by DefiLlama at any point before Dec 31 2027. NO otherwise.',
 'DefiLlama'),

-- Politics
((SELECT id FROM markets WHERE slug='us-crypto-regulation-2027'), 'en',
 'Will the US pass a federal crypto regulation bill by end of 2027?',
 'Resolves based on whether the US Congress passes and the President signs a comprehensive federal cryptocurrency regulation bill.',
 'Resolves YES if a federal bill specifically regulating cryptocurrency markets is signed into law before Dec 31 2027. Must be a standalone crypto bill. NO otherwise.',
 'Congress.gov and White House press releases'),

((SELECT id FROM markets WHERE slug='third-party-5pct-2028'), 'en',
 'Will a third-party candidate receive >5% of the popular vote in the 2028 US presidential election?',
 'Resolves based on the official certified popular vote results of the 2028 US presidential election.',
 'Resolves YES if any candidate not nominated by the Democratic or Republican parties receives more than 5% of the total popular vote per certified results. NO otherwise.',
 'Federal Election Commission certified results'),

((SELECT id FROM markets WHERE slug='eu-digital-euro-2027'), 'en',
 'Will the EU implement a digital euro CBDC by end of 2027?',
 'Resolves based on whether the European Central Bank launches a digital euro for public use.',
 'Resolves YES if the ECB launches a digital euro available for public transactions before Dec 31 2027. Pilot programs limited to select institutions do not count. NO otherwise.',
 'European Central Bank official announcements'),

((SELECT id FROM markets WHERE slug='fed-rate-cut-2026'), 'en',
 'Will the US Federal Reserve cut interest rates by at least 0.5% total in 2026?',
 'Resolves based on whether cumulative Fed rate cuts in 2026 total at least 50 basis points.',
 'Resolves YES if the total cumulative rate cuts announced by the Federal Reserve during 2026 equal or exceed 0.5% (50 bps). Multiple smaller cuts count. NO otherwise.',
 'Federal Reserve FOMC statements'),

-- Technology
((SELECT id FROM markets WHERE slug='apple-ar-glasses-2026'), 'en',
 'Will Apple release consumer AR glasses by end of 2026?',
 'Resolves based on whether Apple ships a consumer augmented reality glasses product (not Vision Pro).',
 'Resolves YES if Apple releases a standalone AR glasses product available for consumer purchase before Dec 31 2026. NO otherwise.',
 'Apple press releases and product listings'),

((SELECT id FROM markets WHERE slug='openai-gpt5-2026'), 'en',
 'Will OpenAI release GPT-5 in 2026?',
 'Resolves based on whether OpenAI publicly releases a model officially named GPT-5.',
 'Resolves YES if OpenAI publicly releases a model officially branded as "GPT-5" before Dec 31 2026. NO otherwise.',
 'OpenAI official blog and API documentation'),

((SELECT id FROM markets WHERE slug='robotaxi-10-cities-2026'), 'en',
 'Will autonomous robotaxis operate in more than 10 US cities by end of 2026?',
 'Resolves based on whether fully autonomous robotaxi services are commercially available in >10 distinct US metro areas.',
 'Resolves YES if at least 10 distinct US metropolitan areas have commercially operating robotaxi services with no safety driver, available to the general public, before Dec 31 2026. NO otherwise.',
 'Company press releases, state DMV records, and news reports'),

((SELECT id FROM markets WHERE slug='ai-chip-revenue-200b-2026'), 'en',
 'Will global AI chip revenue exceed $200B in 2026?',
 'Resolves based on total worldwide revenue from AI-specific semiconductor chips in calendar year 2026.',
 'Resolves YES if total global AI chip revenue exceeds $200B USD for calendar year 2026 as reported by Gartner, IDC, or equivalent. NO otherwise.',
 'Gartner or IDC semiconductor market reports'),

-- Sports
((SELECT id FROM markets WHERE slug='real-madrid-ucl-2026'), 'en',
 'Will Real Madrid win the 2025-26 UEFA Champions League?',
 'Resolves based on the winner of the 2025-26 UEFA Champions League final.',
 'Resolves YES if Real Madrid wins the 2025-26 Champions League final. NO if any other team wins.',
 'UEFA official results'),

((SELECT id FROM markets WHERE slug='usa-most-golds-2028'), 'en',
 'Will the USA win the most gold medals at the 2028 Los Angeles Olympics?',
 'Resolves based on final gold medal standings at the 2028 Summer Olympics.',
 'Resolves YES if the United States wins the most gold medals at the 2028 LA Olympics. In case of a tie, resolves YES if the US is one of the tied nations. NO otherwise.',
 'International Olympic Committee official results'),

((SELECT id FROM markets WHERE slug='sub-2hr-marathon-2028'), 'en',
 'Will an official marathon be completed in under 2 hours before 2028?',
 'Resolves on whether any runner completes an officially sanctioned marathon in under 2:00:00.',
 'Resolves YES if any runner completes a World Athletics-sanctioned marathon in under 2:00:00 before Dec 31 2027. Unofficial attempts do not count. NO otherwise.',
 'World Athletics official records'),

-- Science
((SELECT id FROM markets WHERE slug='room-temp-superconductor-2027'), 'en',
 'Will a room-temperature superconductor be independently verified by end of 2027?',
 'Resolves based on whether a material demonstrating superconductivity at room temperature and ambient pressure is independently replicated.',
 'Resolves YES if a peer-reviewed paper in Nature, Science, or Physical Review Letters confirms room-temperature ambient-pressure superconductivity, independently replicated by at least 2 labs, before Dec 31 2027. NO otherwise.',
 'Nature, Science, or Physical Review Letters'),

((SELECT id FROM markets WHERE slug='starship-orbital-2026'), 'en',
 'Will SpaceX Starship complete a full orbital flight by end of 2026?',
 'Resolves based on whether SpaceX Starship completes a full orbital trajectory and controlled landing/splashdown.',
 'Resolves YES if Starship completes at least one full orbit of Earth and achieves a controlled landing or splashdown before Dec 31 2026. NO otherwise.',
 'SpaceX official communications and FAA records'),

((SELECT id FROM markets WHERE slug='crispr-common-disease-2027'), 'en',
 'Will a CRISPR gene therapy be approved for a common disease by end of 2027?',
 'Resolves on FDA or EMA approval of a CRISPR-based therapy for a disease affecting >1M people.',
 'Resolves YES if the FDA or EMA grants full approval to a CRISPR-based gene therapy for a disease affecting >1M people in the US or EU before Dec 31 2027. NO otherwise.',
 'FDA and EMA approval databases'),

-- Culture
((SELECT id FROM markets WHERE slug='ai-film-festival-2027'), 'en',
 'Will an AI-generated film win a major film festival award by end of 2027?',
 'Resolves based on whether a film primarily generated by AI wins an award at Cannes, Venice, Berlin, Sundance, or Toronto.',
 'Resolves YES if a film where the majority of visual content is AI-generated wins an official award at Cannes, Venice, Berlin, Sundance, or TIFF before Dec 31 2027. NO otherwise.',
 'Official film festival announcements'),

((SELECT id FROM markets WHERE slug='box-office-50b-2026'), 'en',
 'Will global box office revenue exceed $50B in 2026?',
 'Resolves based on total worldwide theatrical box office revenue for calendar year 2026.',
 'Resolves YES if total global theatrical box office revenue exceeds $50B USD for 2026 as reported by Box Office Mojo or The Numbers. NO otherwise.',
 'Box Office Mojo / The Numbers annual reports');


-- ---------------------------------------------------------------------------
-- MARKET TRANSLATIONS — Spanish
-- ---------------------------------------------------------------------------
INSERT INTO public.market_translations (market_id, language_code, title, description, resolution_rules, resolution_source) VALUES

-- Crypto
((SELECT id FROM markets WHERE slug='btc-150k-2026'), 'es',
 '¿Bitcoin alcanzará los $150,000 antes de fin de 2026?',
 'Se resuelve según si BTC alcanza o supera los $150,000 USD antes del 31 de diciembre de 2026.',
 'Se resuelve SÍ si el precio de BTC alcanza $150,000 USD en cualquier momento antes del 31 dic 2026 23:59 UTC en CoinGecko. NO en caso contrario.',
 'API de CoinGecko'),

((SELECT id FROM markets WHERE slug='eth-10k-2026'), 'es',
 '¿Ethereum alcanzará los $10,000 antes de fin de 2026?',
 'Se resuelve según si ETH alcanza o supera los $10,000 USD antes del 31 de diciembre de 2026.',
 'Se resuelve SÍ si el precio de ETH alcanza $10,000 USD en cualquier momento antes del 31 dic 2026 23:59 UTC en CoinGecko. NO en caso contrario.',
 'API de CoinGecko'),

((SELECT id FROM markets WHERE slug='stablecoin-depeg-2026'), 'es',
 '¿Alguna stablecoin importante perderá su paridad por más de 24 horas en 2026?',
 'Cubre USDT, USDC, DAI y cualquier stablecoin con >$1B de capitalización que caiga por debajo de $0.95 o suba por encima de $1.05 durante 24 horas continuas.',
 'Se resuelve SÍ si alguna stablecoin con >$1B de capitalización cotiza por debajo de $0.95 o por encima de $1.05 durante 24h continuas en 2026 según datos horarios de CoinGecko. NO en caso contrario.',
 'Datos horarios de CoinGecko'),

((SELECT id FROM markets WHERE slug='aleo-tvl-500m-2027'), 'es',
 '¿El TVL de Aleo mainnet superará los $500M antes de fin de 2027?',
 'Se resuelve según si el valor total bloqueado en todos los protocolos de Aleo mainnet supera los $500M USD.',
 'Se resuelve SÍ si el TVL de Aleo mainnet supera $500M USD según DefiLlama en cualquier momento antes del 31 dic 2027. NO en caso contrario.',
 'DefiLlama'),

-- Politics
((SELECT id FROM markets WHERE slug='us-crypto-regulation-2027'), 'es',
 '¿EE.UU. aprobará una ley federal de regulación cripto antes de fin de 2027?',
 'Se resuelve según si el Congreso aprueba y el Presidente firma un proyecto de ley federal integral de regulación de criptomonedas.',
 'Se resuelve SÍ si un proyecto de ley federal que regule específicamente los mercados de criptomonedas es firmado como ley antes del 31 dic 2027. NO en caso contrario.',
 'Congress.gov y comunicados de la Casa Blanca'),

((SELECT id FROM markets WHERE slug='third-party-5pct-2028'), 'es',
 '¿Un candidato de terceros partidos recibirá >5% del voto popular en las elecciones presidenciales de EE.UU. 2028?',
 'Se resuelve según los resultados oficiales certificados del voto popular de las elecciones presidenciales de 2028.',
 'Se resuelve SÍ si algún candidato no nominado por los partidos Demócrata o Republicano recibe más del 5% del voto popular total según resultados certificados. NO en caso contrario.',
 'Resultados certificados de la Comisión Federal Electoral'),

((SELECT id FROM markets WHERE slug='eu-digital-euro-2027'), 'es',
 '¿La UE implementará un euro digital (CBDC) antes de fin de 2027?',
 'Se resuelve según si el Banco Central Europeo lanza un euro digital para uso público.',
 'Se resuelve SÍ si el BCE lanza un euro digital disponible para transacciones públicas antes del 31 dic 2027. Programas piloto limitados no cuentan. NO en caso contrario.',
 'Comunicados oficiales del Banco Central Europeo'),

((SELECT id FROM markets WHERE slug='fed-rate-cut-2026'), 'es',
 '¿La Reserva Federal recortará las tasas de interés al menos 0.5% en total en 2026?',
 'Se resuelve según si los recortes acumulados de la Fed en 2026 suman al menos 50 puntos básicos.',
 'Se resuelve SÍ si los recortes acumulados totales anunciados por la Reserva Federal durante 2026 igualan o superan 0.5% (50 pb). Múltiples recortes menores cuentan. NO en caso contrario.',
 'Declaraciones del FOMC de la Reserva Federal'),

-- Technology
((SELECT id FROM markets WHERE slug='apple-ar-glasses-2026'), 'es',
 '¿Apple lanzará gafas de realidad aumentada para consumidores antes de fin de 2026?',
 'Se resuelve según si Apple comercializa unas gafas de realidad aumentada para consumidores (no Vision Pro).',
 'Se resuelve SÍ si Apple lanza unas gafas AR independientes disponibles para compra antes del 31 dic 2026. NO en caso contrario.',
 'Comunicados de prensa de Apple y listados de productos'),

((SELECT id FROM markets WHERE slug='openai-gpt5-2026'), 'es',
 '¿OpenAI lanzará GPT-5 en 2026?',
 'Se resuelve según si OpenAI publica un modelo oficialmente llamado GPT-5.',
 'Se resuelve SÍ si OpenAI publica un modelo oficialmente llamado "GPT-5" antes del 31 dic 2026. NO en caso contrario.',
 'Blog oficial de OpenAI y documentación de API'),

((SELECT id FROM markets WHERE slug='robotaxi-10-cities-2026'), 'es',
 '¿Los robotaxis autónomos operarán en más de 10 ciudades de EE.UU. antes de fin de 2026?',
 'Se resuelve según si los servicios de robotaxi totalmente autónomos están disponibles comercialmente en >10 áreas metropolitanas de EE.UU.',
 'Se resuelve SÍ si al menos 10 áreas metropolitanas de EE.UU. tienen servicios de robotaxi sin conductor de seguridad antes del 31 dic 2026. NO en caso contrario.',
 'Comunicados de empresas, registros del DMV y reportajes'),

((SELECT id FROM markets WHERE slug='ai-chip-revenue-200b-2026'), 'es',
 '¿Los ingresos globales por chips de IA superarán los $200B en 2026?',
 'Se resuelve según los ingresos totales mundiales por semiconductores específicos de IA en el año 2026.',
 'Se resuelve SÍ si los ingresos globales por chips de IA superan $200B USD en 2026 según Gartner, IDC o equivalente. NO en caso contrario.',
 'Informes de mercado de semiconductores de Gartner o IDC'),

-- Sports
((SELECT id FROM markets WHERE slug='real-madrid-ucl-2026'), 'es',
 '¿El Real Madrid ganará la UEFA Champions League 2025-26?',
 'Se resuelve según el ganador de la final de la Champions League 2025-26.',
 'Se resuelve SÍ si el Real Madrid gana la final de la Champions League 2025-26. NO si otro equipo gana.',
 'Resultados oficiales de la UEFA'),

((SELECT id FROM markets WHERE slug='usa-most-golds-2028'), 'es',
 '¿EE.UU. ganará más medallas de oro en los Juegos Olímpicos de Los Ángeles 2028?',
 'Se resuelve según la clasificación final de medallas de oro en los Juegos Olímpicos de Verano 2028.',
 'Se resuelve SÍ si Estados Unidos gana más medallas de oro en los Juegos Olímpicos de LA 2028. En caso de empate, se resuelve SÍ si EE.UU. es una de las naciones empatadas. NO en caso contrario.',
 'Resultados oficiales del Comité Olímpico Internacional'),

((SELECT id FROM markets WHERE slug='sub-2hr-marathon-2028'), 'es',
 '¿Se completará un maratón oficial en menos de 2 horas antes de 2028?',
 'Se resuelve según si algún corredor completa un maratón oficialmente sancionado en menos de 2:00:00.',
 'Se resuelve SÍ si algún corredor completa un maratón sancionado por World Athletics en menos de 2:00:00 antes del 31 dic 2027. Intentos no oficiales no cuentan. NO en caso contrario.',
 'Registros oficiales de World Athletics'),

-- Science
((SELECT id FROM markets WHERE slug='room-temp-superconductor-2027'), 'es',
 '¿Se verificará independientemente un superconductor a temperatura ambiente antes de fin de 2027?',
 'Se resuelve según si un material que demuestra superconductividad a temperatura ambiente y presión ambiental es replicado independientemente.',
 'Se resuelve SÍ si un artículo revisado por pares en Nature, Science o Physical Review Letters confirma superconductividad a temperatura ambiente, replicado por al menos 2 laboratorios, antes del 31 dic 2027. NO en caso contrario.',
 'Nature, Science o Physical Review Letters'),

((SELECT id FROM markets WHERE slug='starship-orbital-2026'), 'es',
 '¿SpaceX Starship completará un vuelo orbital completo antes de fin de 2026?',
 'Se resuelve según si Starship completa una trayectoria orbital completa y un aterrizaje controlado.',
 'Se resuelve SÍ si Starship completa al menos una órbita completa de la Tierra y logra un aterrizaje o amerizaje controlado antes del 31 dic 2026. NO en caso contrario.',
 'Comunicaciones oficiales de SpaceX y registros de la FAA'),

((SELECT id FROM markets WHERE slug='crispr-common-disease-2027'), 'es',
 '¿Se aprobará una terapia génica CRISPR para una enfermedad común antes de fin de 2027?',
 'Se resuelve según la aprobación de la FDA o EMA de una terapia basada en CRISPR para una enfermedad que afecte a >1M de personas.',
 'Se resuelve SÍ si la FDA o EMA otorga aprobación completa a una terapia génica basada en CRISPR para una enfermedad que afecte a >1M de personas en EE.UU. o la UE antes del 31 dic 2027. NO en caso contrario.',
 'Bases de datos de aprobaciones de la FDA y la EMA'),

-- Culture
((SELECT id FROM markets WHERE slug='ai-film-festival-2027'), 'es',
 '¿Una película generada por IA ganará un premio en un festival de cine importante antes de fin de 2027?',
 'Se resuelve según si una película generada principalmente por IA gana un premio en Cannes, Venecia, Berlín, Sundance o Toronto.',
 'Se resuelve SÍ si una película cuyo contenido visual es mayoritariamente generado por IA gana un premio oficial en Cannes, Venecia, Berlín, Sundance o TIFF antes del 31 dic 2027. NO en caso contrario.',
 'Comunicados oficiales de festivales de cine'),

((SELECT id FROM markets WHERE slug='box-office-50b-2026'), 'es',
 '¿Los ingresos globales de taquilla superarán los $50B en 2026?',
 'Se resuelve según los ingresos totales mundiales de taquilla teatral para el año 2026.',
 'Se resuelve SÍ si los ingresos globales de taquilla teatral superan $50B USD en 2026 según Box Office Mojo o The Numbers. NO en caso contrario.',
 'Informes anuales de Box Office Mojo / The Numbers');


-- ---------------------------------------------------------------------------
-- MARKET TRANSLATIONS — French
-- ---------------------------------------------------------------------------
INSERT INTO public.market_translations (market_id, language_code, title, description, resolution_rules, resolution_source) VALUES

-- Crypto
((SELECT id FROM markets WHERE slug='btc-150k-2026'), 'fr',
 'Le Bitcoin atteindra-t-il 150 000 $ d''ici fin 2026 ?',
 'Se résout selon que le BTC atteint ou dépasse 150 000 USD avant le 31 décembre 2026.',
 'Se résout OUI si le prix du BTC atteint 150 000 USD à tout moment avant le 31 déc 2026 23h59 UTC sur CoinGecko. NON sinon.',
 'API CoinGecko'),

((SELECT id FROM markets WHERE slug='eth-10k-2026'), 'fr',
 'L''Ethereum atteindra-t-il 10 000 $ d''ici fin 2026 ?',
 'Se résout selon que l''ETH atteint ou dépasse 10 000 USD avant le 31 décembre 2026.',
 'Se résout OUI si le prix de l''ETH atteint 10 000 USD à tout moment avant le 31 déc 2026 23h59 UTC sur CoinGecko. NON sinon.',
 'API CoinGecko'),

((SELECT id FROM markets WHERE slug='stablecoin-depeg-2026'), 'fr',
 'Un stablecoin majeur perdra-t-il son ancrage pendant plus de 24 heures en 2026 ?',
 'Couvre USDT, USDC, DAI et tout stablecoin avec >1 milliard $ de capitalisation tombant sous 0,95 $ ou dépassant 1,05 $ pendant 24 heures continues.',
 'Se résout OUI si un stablecoin avec >1 milliard $ de capitalisation se négocie sous 0,95 $ ou au-dessus de 1,05 $ pendant 24h continues en 2026 selon les données horaires CoinGecko. NON sinon.',
 'Données horaires CoinGecko'),

((SELECT id FROM markets WHERE slug='aleo-tvl-500m-2027'), 'fr',
 'La TVL d''Aleo mainnet dépassera-t-elle 500 M$ d''ici fin 2027 ?',
 'Se résout selon que la valeur totale verrouillée sur tous les protocoles Aleo mainnet dépasse 500 M USD.',
 'Se résout OUI si la TVL d''Aleo mainnet dépasse 500 M USD selon DefiLlama à tout moment avant le 31 déc 2027. NON sinon.',
 'DefiLlama'),

-- Politics
((SELECT id FROM markets WHERE slug='us-crypto-regulation-2027'), 'fr',
 'Les États-Unis adopteront-ils une loi fédérale de régulation crypto d''ici fin 2027 ?',
 'Se résout selon que le Congrès adopte et le Président signe un projet de loi fédéral complet de régulation des cryptomonnaies.',
 'Se résout OUI si un projet de loi fédéral réglementant spécifiquement les marchés de cryptomonnaies est signé avant le 31 déc 2027. NON sinon.',
 'Congress.gov et communiqués de la Maison Blanche'),

((SELECT id FROM markets WHERE slug='third-party-5pct-2028'), 'fr',
 'Un candidat tiers obtiendra-t-il >5 % du vote populaire à la présidentielle américaine de 2028 ?',
 'Se résout selon les résultats officiels certifiés du vote populaire de l''élection présidentielle de 2028.',
 'Se résout OUI si un candidat non désigné par les partis Démocrate ou Républicain obtient plus de 5 % du vote populaire total selon les résultats certifiés. NON sinon.',
 'Résultats certifiés de la Commission électorale fédérale'),

((SELECT id FROM markets WHERE slug='eu-digital-euro-2027'), 'fr',
 'L''UE mettra-t-elle en œuvre un euro numérique (CBDC) d''ici fin 2027 ?',
 'Se résout selon que la Banque centrale européenne lance un euro numérique pour usage public.',
 'Se résout OUI si la BCE lance un euro numérique disponible pour les transactions publiques avant le 31 déc 2027. Les programmes pilotes limités ne comptent pas. NON sinon.',
 'Communiqués officiels de la Banque centrale européenne'),

((SELECT id FROM markets WHERE slug='fed-rate-cut-2026'), 'fr',
 'La Réserve fédérale réduira-t-elle les taux d''intérêt d''au moins 0,5 % au total en 2026 ?',
 'Se résout selon que les baisses cumulées de la Fed en 2026 totalisent au moins 50 points de base.',
 'Se résout OUI si les baisses cumulées totales annoncées par la Réserve fédérale en 2026 égalent ou dépassent 0,5 % (50 pb). Plusieurs petites baisses comptent. NON sinon.',
 'Déclarations du FOMC de la Réserve fédérale'),

-- Technology
((SELECT id FROM markets WHERE slug='apple-ar-glasses-2026'), 'fr',
 'Apple lancera-t-il des lunettes AR grand public d''ici fin 2026 ?',
 'Se résout selon qu''Apple commercialise des lunettes de réalité augmentée grand public (pas le Vision Pro).',
 'Se résout OUI si Apple lance des lunettes AR autonomes disponibles à l''achat avant le 31 déc 2026. NON sinon.',
 'Communiqués de presse Apple et fiches produits'),

((SELECT id FROM markets WHERE slug='openai-gpt5-2026'), 'fr',
 'OpenAI sortira-t-il GPT-5 en 2026 ?',
 'Se résout selon qu''OpenAI publie un modèle officiellement nommé GPT-5.',
 'Se résout OUI si OpenAI publie un modèle officiellement nommé « GPT-5 » avant le 31 déc 2026. NON sinon.',
 'Blog officiel d''OpenAI et documentation API'),

((SELECT id FROM markets WHERE slug='robotaxi-10-cities-2026'), 'fr',
 'Les robotaxis autonomes opéreront-ils dans plus de 10 villes américaines d''ici fin 2026 ?',
 'Se résout selon que des services de robotaxi entièrement autonomes sont disponibles dans >10 métropoles américaines.',
 'Se résout OUI si au moins 10 métropoles américaines disposent de services de robotaxi sans chauffeur de sécurité avant le 31 déc 2026. NON sinon.',
 'Communiqués d''entreprises, archives DMV et reportages'),

((SELECT id FROM markets WHERE slug='ai-chip-revenue-200b-2026'), 'fr',
 'Les revenus mondiaux des puces IA dépasseront-ils 200 milliards $ en 2026 ?',
 'Se résout selon les revenus totaux mondiaux des semi-conducteurs spécifiques à l''IA pour l''année 2026.',
 'Se résout OUI si les revenus mondiaux des puces IA dépassent 200 milliards USD en 2026 selon Gartner, IDC ou équivalent. NON sinon.',
 'Rapports Gartner ou IDC sur le marché des semi-conducteurs'),

-- Sports
((SELECT id FROM markets WHERE slug='real-madrid-ucl-2026'), 'fr',
 'Le Real Madrid remportera-t-il la Ligue des champions 2025-26 ?',
 'Se résout selon le vainqueur de la finale de la Ligue des champions 2025-26.',
 'Se résout OUI si le Real Madrid remporte la finale de la Ligue des champions 2025-26. NON si une autre équipe gagne.',
 'Résultats officiels de l''UEFA'),

((SELECT id FROM markets WHERE slug='usa-most-golds-2028'), 'fr',
 'Les États-Unis remporteront-ils le plus de médailles d''or aux JO de Los Angeles 2028 ?',
 'Se résout selon le classement final des médailles d''or aux Jeux olympiques d''été 2028.',
 'Se résout OUI si les États-Unis remportent le plus de médailles d''or aux JO de LA 2028. En cas d''égalité, se résout OUI si les USA font partie des nations à égalité. NON sinon.',
 'Résultats officiels du Comité international olympique'),

((SELECT id FROM markets WHERE slug='sub-2hr-marathon-2028'), 'fr',
 'Un marathon officiel sera-t-il complété en moins de 2 heures avant 2028 ?',
 'Se résout selon qu''un coureur complète un marathon officiellement sanctionné en moins de 2:00:00.',
 'Se résout OUI si un coureur complète un marathon sanctionné par World Athletics en moins de 2:00:00 avant le 31 déc 2027. Les tentatives non officielles ne comptent pas. NON sinon.',
 'Records officiels de World Athletics'),

-- Science
((SELECT id FROM markets WHERE slug='room-temp-superconductor-2027'), 'fr',
 'Un supraconducteur à température ambiante sera-t-il vérifié indépendamment d''ici fin 2027 ?',
 'Se résout selon qu''un matériau démontrant la supraconductivité à température ambiante et pression ambiante est répliqué indépendamment.',
 'Se résout OUI si un article évalué par des pairs dans Nature, Science ou Physical Review Letters confirme la supraconductivité à température ambiante, répliquée par au moins 2 laboratoires, avant le 31 déc 2027. NON sinon.',
 'Nature, Science ou Physical Review Letters'),

((SELECT id FROM markets WHERE slug='starship-orbital-2026'), 'fr',
 'Le Starship de SpaceX effectuera-t-il un vol orbital complet d''ici fin 2026 ?',
 'Se résout selon que le Starship complète une trajectoire orbitale complète et un atterrissage contrôlé.',
 'Se résout OUI si le Starship complète au moins une orbite complète de la Terre et réalise un atterrissage ou amerrissage contrôlé avant le 31 déc 2026. NON sinon.',
 'Communications officielles de SpaceX et archives de la FAA'),

((SELECT id FROM markets WHERE slug='crispr-common-disease-2027'), 'fr',
 'Une thérapie génique CRISPR sera-t-elle approuvée pour une maladie courante d''ici fin 2027 ?',
 'Se résout selon l''approbation de la FDA ou de l''EMA d''une thérapie basée sur CRISPR pour une maladie touchant >1M de personnes.',
 'Se résout OUI si la FDA ou l''EMA accorde une approbation complète à une thérapie génique CRISPR pour une maladie touchant >1M de personnes aux USA ou dans l''UE avant le 31 déc 2027. NON sinon.',
 'Bases de données d''approbation de la FDA et de l''EMA'),

-- Culture
((SELECT id FROM markets WHERE slug='ai-film-festival-2027'), 'fr',
 'Un film généré par IA remportera-t-il un prix dans un grand festival de cinéma d''ici fin 2027 ?',
 'Se résout selon qu''un film principalement généré par IA remporte un prix à Cannes, Venise, Berlin, Sundance ou Toronto.',
 'Se résout OUI si un film dont le contenu visuel est majoritairement généré par IA remporte un prix officiel à Cannes, Venise, Berlin, Sundance ou TIFF avant le 31 déc 2027. NON sinon.',
 'Communiqués officiels des festivals de cinéma'),

((SELECT id FROM markets WHERE slug='box-office-50b-2026'), 'fr',
 'Les recettes mondiales du box-office dépasseront-elles 50 milliards $ en 2026 ?',
 'Se résout selon les recettes totales mondiales du box-office en salles pour l''année 2026.',
 'Se résout OUI si les recettes mondiales du box-office en salles dépassent 50 milliards USD en 2026 selon Box Office Mojo ou The Numbers. NON sinon.',
 'Rapports annuels de Box Office Mojo / The Numbers');
