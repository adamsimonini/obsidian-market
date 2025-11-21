import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import type { Market, MarketStatus } from '../types/supabase';

export function useMarkets(status?: MarketStatus) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch initial markets
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const data = await db.markets.findAll(status ? { status } : undefined);
        setMarkets(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to fetch markets'),
        );
        setMarkets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();

    // Set up real-time subscription
    const unsubscribe = db.markets.subscribe((event, market) => {
      if (event === 'INSERT') {
        setMarkets((prev) => [market, ...prev]);
      } else if (event === 'UPDATE') {
        setMarkets((prev) =>
          prev.map((m) => (m.id === market.id ? market : m)),
        );
      } else if (event === 'DELETE') {
        setMarkets((prev) => prev.filter((m) => m.id !== market.id));
      }
    });

    return unsubscribe;
  }, [status]);

  return { markets, loading, error, refetch: () => {} };
}

