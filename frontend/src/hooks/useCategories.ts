'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { getSupabase } from '@/lib/supabase';
import type { LocalizedCategory } from '@/types/supabase';

/**
 * Fetches categories joined with their translations for the current locale.
 * Returns LocalizedCategory[] with name and description flattened
 * from the category_translations table.
 */
export function useCategories() {
  const locale = useLocale();
  const [categories, setCategories] = useState<LocalizedCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await getSupabase()
          .from('categories')
          .select('*, category_translations!inner(name, description)')
          .eq('category_translations.language_code', locale)
          .order('display_order', { ascending: true });

        if (error) throw error;

        // Flatten translation fields onto the category object
        const localized: LocalizedCategory[] = (data || []).map((row: Record<string, unknown>) => {
          const translations = row.category_translations as Array<{
            name: string;
            description: string | null;
          }>;
          const t = translations[0];
          const { category_translations: _, ...base } = row;
          return {
            ...base,
            name: t.name,
            description: t.description,
          } as LocalizedCategory;
        });

        setCategories(localized);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [locale]);

  return { categories, loading };
}
