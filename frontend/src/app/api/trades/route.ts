import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      market_id,
      side,
      shares,
      amount,
      price_before,
      price_after,
      yes_reserves_after,
      no_reserves_after,
      tx_hash,
    } = body;

    if (!market_id || !side || !shares || !amount || price_before == null || price_after == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['yes', 'no'].includes(side)) {
      return NextResponse.json({ error: 'Side must be "yes" or "no"' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Verify market exists and is open
    const { data: market, error: marketError } = await supabase
      .from('markets')
      .select('id, status')
      .eq('id', market_id)
      .single();

    if (marketError || !market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    if (market.status !== 'open') {
      return NextResponse.json({ error: 'Market is not open for trading' }, { status: 400 });
    }

    // Insert anonymized trade (triggers update market aggregates + snapshot)
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert({
        market_id,
        side,
        shares,
        amount,
        price_before,
        price_after,
        yes_reserves_after,
        no_reserves_after,
        tx_hash: tx_hash || null,
      })
      .select()
      .single();

    if (tradeError) {
      return NextResponse.json({ error: tradeError.message }, { status: 500 });
    }

    return NextResponse.json({ trade }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
