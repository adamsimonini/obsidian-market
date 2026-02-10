import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { routing } from '@/i18n/routing';
import { CategoryPageClient } from './CategoryPageClient';
import type { LocalizedMarket } from '@/types/supabase';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// ---------------------------------------------------------------------------
// Static params — generate pages for all category slugs x locales
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const supabase = getSupabaseAdmin();
  const { data: categories } = await supabase.from('categories').select('slug');

  if (!categories) return [];

  return routing.locales.flatMap((locale) =>
    categories.map((c) => ({ locale, slug: c.slug })),
  );
}

// ---------------------------------------------------------------------------
// Dynamic SEO metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('categories')
    .select('slug, category_translations!inner(name, description)')
    .eq('slug', slug)
    .eq('category_translations.language_code', locale)
    .single();

  if (!data) return { title: 'Category Not Found' };

  const t = (data.category_translations as Array<{ name: string; description: string | null }>)[0];

  // Generate hreflang alternates
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/categories/${slug}`;
  }
  languages['x-default'] = `/en/categories/${slug}`;

  return {
    title: t.name,
    description: t.description || t.name,
    alternates: {
      canonical: `/${locale}/categories/${slug}`,
      languages,
    },
    openGraph: {
      title: t.name,
      description: t.description || t.name,
      type: 'website',
    },
  };
}

// ---------------------------------------------------------------------------
// Server component — fetch category + its markets, pass to client
// ---------------------------------------------------------------------------
export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const supabase = getSupabaseAdmin();

  // Fetch category with its translation
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select('*, category_translations!inner(name, description)')
    .eq('slug', slug)
    .eq('category_translations.language_code', locale)
    .single();

  if (catError || !catData) {
    notFound();
  }

  const catTranslations = catData.category_translations as Array<{ name: string; description: string | null }>;
  const { category_translations: _, ...baseCategory } = catData;
  const category = {
    ...baseCategory,
    name: catTranslations[0].name,
    description: catTranslations[0].description,
  };

  // Fetch markets in this category with their translations
  const { data: marketsData } = await supabase
    .from('markets')
    .select('*, market_translations!inner(title, description, resolution_rules, resolution_source)')
    .eq('category_id', category.id)
    .eq('market_translations.language_code', locale)
    .eq('status', 'open')
    .order('featured', { ascending: false })
    .order('total_volume', { ascending: false });

  const markets: LocalizedMarket[] = (marketsData || []).map((row: Record<string, unknown>) => {
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

  return <CategoryPageClient category={category} markets={markets} />;
}
