// TypeScript types matching Supabase schema

export type MarketStatus = 'open' | 'closed' | 'resolved' | 'cancelled';

export interface Market {
  id: string;
  title: string;
  description: string | null;
  resolution_rules: string;
  resolution_source: string;
  resolution_deadline: string;
  status: MarketStatus;
  yes_odds: number;
  no_odds: number;
  creator_address: string;
  market_id_onchain: string | null;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  wallet_address: string;
  created_at: string;
}

// Database response types
export interface Database {
  public: {
    Tables: {
      markets: {
        Row: Market;
        Insert: Omit<Market, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Market, 'id' | 'created_at'>>;
      };
      admins: {
        Row: Admin;
        Insert: Omit<Admin, 'created_at'>;
        Update: Partial<Admin>;
      };
    };
  };
}

