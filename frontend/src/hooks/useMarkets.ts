'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getSupabase } from '@/lib/supabase';
import type { LocalizedMarket, MarketStatus } from '@/types/supabase';

interface UseMarketsOptions {
  status?: MarketStatus;
  categoryId?: string;
}

/**
 * Fetches markets joined with their translations for the current locale.
 * Returns LocalizedMarket[] with title, description, resolution_rules,
 * and resolution_source flattened from the market_translations table.
 */
export function useMarkets(options?: UseMarketsOptions) {
  const locale = useLocale();
  const [markets, setMarkets] = useState<LocalizedMarket[]>([]);
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
          .select('*, market_translations!inner(title, description, resolution_rules, resolution_source)')
          .eq('market_translations.language_code', locale)
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

        // Flatten translation fields onto the market object
        const localized: LocalizedMarket[] = (data || []).map((row: Record<string, unknown>) => {
          const translations = row.market_translations as Array<{
            title: string;
            description: string | null;
            resolution_rules: string;
            resolution_source: string;
          }>;
          const t = translations[0];
          const { market_translations: _, ...base } = row;
          return {
            ...base,
            title: t.title,
            description: t.description,
            resolution_rules: t.resolution_rules,
            resolution_source: t.resolution_source,
          } as LocalizedMarket;
        });

        setMarkets(localized);
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

    // Real-time: refetch on any market change (since translations are joined)
    const channel = getSupabase()
      .channel('markets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'markets',
        },
        () => {
          // Re-fetch to get updated data with translations
          fetchMarkets();
        },
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [status, categoryId, locale]);

  return { markets, loading, error };
}
