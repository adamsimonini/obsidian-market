'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Market, MarketStatus } from '@/types/supabase';

export function useMarkets(status?: MarketStatus) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        let query = getSupabase()
          .from('markets')
          .select('*')
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
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
  }, [status]);

  return { markets, loading, error, refetch: () => {} };
}
