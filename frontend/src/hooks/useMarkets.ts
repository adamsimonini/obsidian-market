'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Market, MarketStatus } from '@/types/supabase';

interface UseMarketsOptions {
  status?: MarketStatus;
  categoryId?: string;
}

export function useMarkets(options?: UseMarketsOptions) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const status = options?.status;
  const categoryId = options?.categoryId;

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        let query = getSupabase()
          .from('markets')
          .select('*')
          .order('featured', { ascending: false })
          .order('total_volume', { ascending: false })
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        }

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setMarkets(data || []);
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

    const channel = getSupabase()
      .channel('markets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'markets',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMarkets((prev) => [payload.new as Market, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMarkets((prev) =>
              prev.map((market) =>
                market.id === payload.new.id ? (payload.new as Market) : market,
              ),
            );
          } else if (payload.eventType === 'DELETE') {
            setMarkets((prev) =>
              prev.filter((market) => market.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [status, categoryId]);

  return { markets, loading, error };
}
