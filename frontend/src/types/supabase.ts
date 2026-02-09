// --- Enums ---

export type MarketStatus = 'open' | 'closed' | 'resolved' | 'cancelled';
export type MarketType = 'binary' | 'categorical' | 'scalar';
export type AdminRole = 'super_admin' | 'market_creator' | 'resolver';
export type OutcomeType = 'binary' | 'categorical' | 'scalar';
export type TradeSide = 'yes' | 'no';
export type ResolutionOutcome = 'yes' | 'no' | 'invalid';
export type EventStatus = 'active' | 'resolved' | 'cancelled';

// --- Row types ---

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Event {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: EventStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: string;
  title: string;
  description: string | null;
  resolution_rules: string;
  resolution_source: string;
  resolution_deadline: string;
  status: MarketStatus;
  // v1 fields (still in DB)
  yes_odds: number;
  no_odds: number;
  creator_address: string;
  market_id_onchain: string | null;
  // v2 fields
  event_id: string | null;
  category_id: string | null;
  slug: string | null;
  image_url: string | null;
  market_type: MarketType;
  resolution_outcome: ResolutionOutcome | null;
  resolved_at: string | null;
  yes_reserves: number;
  no_reserves: number;
  yes_price: number;
  no_price: number;
  total_volume: number;
  volume_24h: number;
  liquidity: number;
  trade_count: number;
  fee_bps: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Outcome {
  id: string;
  market_id: string;
  index: number;
  label: string;
  outcome_type: OutcomeType;
  price: number;
  shares_outstanding: number;
  resolution_value: number | null;
  created_at: string;
  updated_at: string;
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

// --- Database interface (for Supabase client typing) ---

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
      markets: {
        Row: Market;
        Insert: Omit<Market, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Market, 'id' | 'created_at'>>;
      };
      outcomes: {
        Row: Outcome;
        Insert: Omit<Outcome, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Outcome, 'id' | 'created_at'>>;
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
