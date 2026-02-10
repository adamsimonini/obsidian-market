import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/admin-auth';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet_address, ...marketData } = body;

    // Verify admin (super_admin or market_creator)
    const { authorized, error: authError } = await verifyAdmin(wallet_address, 'market_creator');
    if (!authorized) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const {
      // Translations keyed by language code: { en: { title, description, ... }, es: { ... } }
      translations,
      resolution_deadline,
      category_id,
      initial_liquidity,
    } = marketData;

    if (!translations || !translations.en?.title || !translations.en?.resolution_rules || !resolution_deadline) {
      return NextResponse.json(
        { error: 'Missing required fields: translations.en.title, translations.en.resolution_rules, resolution_deadline' },
        { status: 400 },
      );
    }

    const slug = slugify(translations.en.title);
    const liquidity = parseInt(initial_liquidity) || 1000;

    const supabase = getSupabaseAdmin();

    // 1. Create the market (language-agnostic base row)
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .insert({
        resolution_deadline,
        status: 'open',
        creator_address: wallet_address,
        slug,
        category_id: category_id || null,
        market_type: 'binary',
        yes_odds: 2.0,
        no_odds: 2.0,
        yes_reserves: liquidity,
        no_reserves: liquidity,
        fee_bps: 200,
      })
      .select()
      .single();

    if (marketError) {
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    // 2. Insert translations for each provided language
    const translationRows = Object.entries(translations as Record<string, {
      title: string;
      description?: string;
      resolution_rules: string;
      resolution_source?: string;
    }>).map(([lang, t]) => ({
      market_id: market.id,
      language_code: lang,
      title: t.title,
      description: t.description || null,
      resolution_rules: t.resolution_rules,
      resolution_source: t.resolution_source || 'Admin manual',
    }));

    const { error: transError } = await supabase
      .from('market_translations')
      .insert(translationRows);

    if (transError) {
      console.error('Failed to create market translations:', transError.message);
    }

    // 3. Create default Yes/No outcomes (base rows)
    const { data: outcomes, error: outcomesError } = await supabase
      .from('outcomes')
      .insert([
        { market_id: market.id, index: 0, outcome_type: 'binary', price: 0.5 },
        { market_id: market.id, index: 1, outcome_type: 'binary', price: 0.5 },
      ])
      .select();

    if (outcomesError) {
      console.error('Failed to create outcomes:', outcomesError.message);
    }

    // 4. Create outcome translations for each language
    if (outcomes && outcomes.length === 2) {
      const yesOutcome = outcomes.find((o) => o.index === 0);
      const noOutcome = outcomes.find((o) => o.index === 1);

      // Default labels per language
      const outcomeLabels: Record<string, { yes: string; no: string }> = {
        en: { yes: 'Yes', no: 'No' },
        es: { yes: 'Sí', no: 'No' },
        fr: { yes: 'Oui', no: 'Non' },
      };

      const outcomeTransRows: Array<{
        outcome_id: string;
        language_code: string;
        label: string;
      }> = [];

      for (const lang of Object.keys(translations)) {
        const labels = outcomeLabels[lang] || outcomeLabels.en;
        if (yesOutcome) {
          outcomeTransRows.push({ outcome_id: yesOutcome.id, language_code: lang, label: labels.yes });
        }
        if (noOutcome) {
          outcomeTransRows.push({ outcome_id: noOutcome.id, language_code: lang, label: labels.no });
        }
      }

      if (outcomeTransRows.length > 0) {
        const { error: outcomeTransError } = await supabase
          .from('outcome_translations')
          .insert(outcomeTransRows);

        if (outcomeTransError) {
          console.error('Failed to create outcome translations:', outcomeTransError.message);
        }
      }
    }

    return NextResponse.json({ market }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
