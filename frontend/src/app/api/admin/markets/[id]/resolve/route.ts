import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/admin-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { wallet_address, resolution_outcome } = body;

    // Verify admin (super_admin or resolver)
    const { authorized, error: authError } = await verifyAdmin(wallet_address, 'resolver');
    if (!authorized) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    if (!['yes', 'no', 'invalid'].includes(resolution_outcome)) {
      return NextResponse.json(
        { error: 'resolution_outcome must be "yes", "no", or "invalid"' },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    // Verify market exists and is open
    const { data: market, error: fetchError } = await supabase
      .from('markets')
      .select('id, status')
      .eq('id', id)
      .single();

    if (fetchError || !market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    if (market.status !== 'open' && market.status !== 'closed') {
      return NextResponse.json(
        { error: `Cannot resolve market with status "${market.status}"` },
        { status: 400 },
      );
    }

    // Update market
    const { data: updated, error: updateError } = await supabase
      .from('markets')
      .update({
        status: 'resolved',
        resolution_outcome,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update outcome resolution values
    if (resolution_outcome !== 'invalid') {
      const winningIndex = resolution_outcome === 'yes' ? 0 : 1;
      const losingIndex = resolution_outcome === 'yes' ? 1 : 0;

      await supabase
        .from('outcomes')
        .update({ resolution_value: 1.0 })
        .eq('market_id', id)
        .eq('index', winningIndex);

      await supabase
        .from('outcomes')
        .update({ resolution_value: 0.0 })
        .eq('market_id', id)
        .eq('index', losingIndex);
    } else {
      // Invalid resolution — refund scenario, set all to null
      await supabase
        .from('outcomes')
        .update({ resolution_value: null })
        .eq('market_id', id);
    }

    return NextResponse.json({ market: updated });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
