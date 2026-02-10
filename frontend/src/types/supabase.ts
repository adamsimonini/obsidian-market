// =============================================================================
// Database types — i18n schema
// Base tables hold language-agnostic data; *_translations hold all text content
// =============================================================================

// --- Enums ---

export type MarketStatus = 'open' | 'closed' | 'resolved' | 'cancelled';
export type MarketType = 'binary' | 'categorical' | 'scalar';
export type AdminRole = 'super_admin' | 'market_creator' | 'resolver';
export type OutcomeType = 'binary' | 'categorical' | 'scalar';
export type TradeSide = 'yes' | 'no';
export type ResolutionOutcome = 'yes' | 'no' | 'invalid';
export type EventStatus = 'active' | 'resolved' | 'cancelled';

// --- Languages ---

export interface Language {
  code: string;
  name: string;
  native_name: string;
  is_default: boolean;
  created_at: string;
}

// --- Base row types (no translatable text) ---

export interface Category {
  id: string;
  slug: string;
  display_order: number;
  created_at: string;
}

export interface CategoryTranslation {
  id: string;
  category_id: string;
  language_code: string;
  name: string;
  description: string | null;
}

export interface Event {
  id: string;
  category_id: string | null;
  slug: string;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: EventStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EventTranslation {
  id: string;
  event_id: string;
  language_code: string;
  title: string;
  description: string | null;
}

export interface Market {
  id: string;
  event_id: string | null;
  category_id: string | null;
  slug: string;
  image_url: string | null;
  market_type: MarketType;
  resolution_deadline: string;
  resolution_outcome: ResolutionOutcome | null;
  resolved_at: string | null;
  status: MarketStatus;
  creator_address: string;
  market_id_onchain: string | null;
  // CPMM
  yes_reserves: number;
  no_reserves: number;
  yes_price: number;
  no_price: number;
  // Legacy odds
  yes_odds: number;
  no_odds: number;
  // Aggregates
  total_volume: number;
  volume_24h: number;
  liquidity: number;
  trade_count: number;
  fee_bps: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketTranslation {
  id: string;
  market_id: string;
  language_code: string;
  title: string;
  description: string | null;
  resolution_rules: string;
  resolution_source: string;
}

export interface Outcome {
  id: string;
  market_id: string;
  index: number;
  outcome_type: OutcomeType;
  price: number;
  shares_outstanding: number;
  resolution_value: number | null;
  created_at: string;
  updated_at: string;
}

export interface OutcomeTranslation {
  id: string;
  outcome_id: string;
  language_code: string;
  label: string;
}

export interface Trade {
  id: string;
  market_id: string;
  side: TradeSide;
  shares: number;
  amount: number;
  price_before: number;
  price_after: number;
  yes_reserves_after: number;
  no_reserves_after: number;
  tx_hash: string | null;
  created_at: string;
}

export interface MarketSnapshot {
  id: number;
  market_id: string;
  yes_price: number;
  no_price: number;
  yes_reserves: number;
  no_reserves: number;
  volume_cumulative: number;
  trade_count_cumulative: number;
  captured_at: string;
}

export interface PublicTrade {
  id: string;
  trade_id: string;
  wallet_address: string;
  market_id: string;
  side: TradeSide;
  shares: number;
  entry_price: number;
  realized_pnl: number | null;
  created_at: string;
}

export interface Admin {
  wallet_address: string;
  role: AdminRole;
  permissions: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// --- Localized types (base + translation joined — used by frontend) ---

export interface LocalizedCategory extends Category {
  name: string;
  description: string | null;
}

export interface LocalizedEvent extends Event {
  title: string;
  description: string | null;
}

export interface LocalizedMarket extends Market {
  title: string;
  description: string | null;
  resolution_rules: string;
  resolution_source: string;
  // Joined relations (optional, populated by query)
  category?: LocalizedCategory;
}

export interface LocalizedOutcome extends Outcome {
  label: string;
}

// --- Database interface (for Supabase client typing) ---

export interface Database {
  public: {
    Tables: {
      languages: {
        Row: Language;
        Insert: Omit<Language, 'created_at'>;
        Update: Partial<Omit<Language, 'code'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      category_translations: {
        Row: CategoryTranslation;
        Insert: Omit<CategoryTranslation, 'id'>;
        Update: Partial<Omit<CategoryTranslation, 'id'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
      event_translations: {
        Row: EventTranslation;
        Insert: Omit<EventTranslation, 'id'>;
        Update: Partial<Omit<EventTranslation, 'id'>>;
      };
      markets: {
        Row: Market;
        Insert: Omit<Market, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Market, 'id' | 'created_at'>>;
      };
      market_translations: {
        Row: MarketTranslation;
        Insert: Omit<MarketTranslation, 'id'>;
        Update: Partial<Omit<MarketTranslation, 'id'>>;
      };
      outcomes: {
        Row: Outcome;
        Insert: Omit<Outcome, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Outcome, 'id' | 'created_at'>>;
      };
      outcome_translations: {
        Row: OutcomeTranslation;
        Insert: Omit<OutcomeTranslation, 'id'>;
        Update: Partial<Omit<OutcomeTranslation, 'id'>>;
      };
      trades: {
        Row: Trade;
        Insert: Omit<Trade, 'id' | 'created_at'>;
        Update: Partial<Omit<Trade, 'id' | 'created_at'>>;
      };
      market_snapshots: {
        Row: MarketSnapshot;
        Insert: Omit<MarketSnapshot, 'id' | 'captured_at'>;
        Update: Partial<Omit<MarketSnapshot, 'id'>>;
      };
      public_trades: {
        Row: PublicTrade;
        Insert: Omit<PublicTrade, 'id' | 'created_at'>;
        Update: Partial<Omit<PublicTrade, 'id' | 'created_at'>>;
      };
      admins: {
        Row: Admin;
        Insert: Omit<Admin, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Admin, 'created_at'>>;
      };
    };
  };
}
