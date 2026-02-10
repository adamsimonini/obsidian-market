import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { routing } from '@/i18n/routing';
import { MarketDetailClient } from './MarketDetailClient';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// ---------------------------------------------------------------------------
// Static params — generate pages for all market slugs x locales
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const supabase = getSupabaseAdmin();
  const { data: markets } = await supabase.from('markets').select('slug');

  if (!markets) return [];

  return routing.locales.flatMap((locale) =>
    markets.map((m) => ({ locale, slug: m.slug })),
  );
}

// ---------------------------------------------------------------------------
// Dynamic SEO metadata
// ---------------------------------------------------------------------------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('markets')
    .select('slug, market_translations!inner(title, description)')
    .eq('slug', slug)
    .eq('market_translations.language_code', locale)
    .single();

  if (!data) return { title: 'Market Not Found' };

  const t = (data.market_translations as Array<{ title: string; description: string | null }>)[0];

  // Generate hreflang alternates
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}/markets/${slug}`;
  }
  languages['x-default'] = `/en/markets/${slug}`;

  return {
    title: t.title,
    description: t.description || t.title,
    alternates: {
      canonical: `/${locale}/markets/${slug}`,
      languages,
    },
    openGraph: {
      title: t.title,
      description: t.description || t.title,
      type: 'website',
    },
  };
}

// ---------------------------------------------------------------------------
// Server component — fetch market + translations, pass to client
// ---------------------------------------------------------------------------
export default async function MarketPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const supabase = getSupabaseAdmin();

  // Fetch market with its translation
  const { data, error } = await supabase
    .from('markets')
    .select(`
      *,
      market_translations!inner(title, description, resolution_rules, resolution_source),
      categories!markets_category_id_fkey(
        slug,
        category_translations!inner(name)
      )
    `)
    .eq('slug', slug)
    .eq('market_translations.language_code', locale)
    .single();

  if (error || !data) {
    notFound();
  }

  // Flatten translations
  const translations = data.market_translations as Array<{
    title: string;
    description: string | null;
    resolution_rules: string;
    resolution_source: string;
  }>;
  const t = translations[0];

  // Flatten category name if present
  const categoryData = data.categories as { slug: string; category_translations: Array<{ name: string }> } | null;
  const categoryName = categoryData?.category_translations?.[0]?.name ?? null;

  const { market_translations: _, categories: __, ...baseMarket } = data;
  const market = {
    ...baseMarket,
    title: t.title,
    description: t.description,
    resolution_rules: t.resolution_rules,
    resolution_source: t.resolution_source,
  };

  return <MarketDetailClient market={market} categoryName={categoryName} />;
}
