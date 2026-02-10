import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/admin-auth';
import { isValidAleoAddress } from '@/lib/aleo-address';

export async function GET(req: NextRequest) {
  try {
    const walletAddress = req.nextUrl.searchParams.get('wallet_address');

    if (!walletAddress) {
      return NextResponse.json({ error: 'wallet_address query param required' }, { status: 400 });
    }

    // Only super_admin can list admins
    const { authorized, error: authError } = await verifyAdmin(walletAddress, 'super_admin');
    if (!authorized) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const { data: admins, error } = await getSupabaseAdmin()
      .from('admins')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ admins });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet_address, target_address, role } = body;

    if (!wallet_address || !target_address || !role) {
      return NextResponse.json(
        { error: 'wallet_address, target_address, and role are required' },
        { status: 400 },
      );
    }

    if (!isValidAleoAddress(target_address)) {
      return NextResponse.json(
        { error: 'Invalid Aleo address. Must start with aleo1 and be 63 characters.' },
        { status: 400 },
      );
    }

    // Only super_admin can add admins
    const { authorized, error: authError } = await verifyAdmin(wallet_address, 'super_admin');
    if (!authorized) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    if (!['super_admin', 'market_creator', 'resolver'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be "super_admin", "market_creator", or "resolver"' },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    // Check for existing admin
    const { data: existing } = await supabase
      .from('admins')
      .select('wallet_address')
      .eq('wallet_address', target_address)
      .single();

    if (existing) {
      // Update role of existing admin
      const { data: updated, error: updateError } = await supabase
        .from('admins')
        .update({ role })
        .eq('wallet_address', target_address)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ admin: updated });
    }

    // Insert new admin
    const { data: admin, error: insertError } = await supabase
      .from('admins')
      .insert({ wallet_address: target_address, role })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ admin }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
