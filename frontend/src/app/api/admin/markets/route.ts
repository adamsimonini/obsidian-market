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
      title,
      description,
      resolution_rules,
      resolution_source,
      resolution_deadline,
      category_id,
      initial_liquidity,
    } = marketData;

    if (!title || !resolution_rules || !resolution_deadline) {
      return NextResponse.json({ error: 'Missing required fields: title, resolution_rules, resolution_deadline' }, { status: 400 });
    }

    const slug = slugify(title);
    const liquidity = parseInt(initial_liquidity) || 1000;

    const supabase = getSupabaseAdmin();

    // Create market with CPMM reserves
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .insert({
        title,
        description: description || null,
        resolution_rules,
        resolution_source: resolution_source || 'Admin manual',
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
        // prices auto-calculated by DB trigger
        fee_bps: 200,
      })
      .select()
      .single();

    if (marketError) {
      return NextResponse.json({ error: marketError.message }, { status: 500 });
    }

    // Create default Yes/No outcomes
    const { error: outcomesError } = await supabase.from('outcomes').insert([
      { market_id: market.id, index: 0, label: 'Yes', outcome_type: 'binary', price: 0.5 },
      { market_id: market.id, index: 1, label: 'No', outcome_type: 'binary', price: 0.5 },
    ]);

    if (outcomesError) {
      // Market created but outcomes failed — log but don't fail the request
      console.error('Failed to create outcomes:', outcomesError.message);
    }

    return NextResponse.json({ market }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
