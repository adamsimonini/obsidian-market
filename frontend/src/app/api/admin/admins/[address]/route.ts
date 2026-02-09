import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { verifyAdmin } from '@/lib/admin-auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params;
    const walletAddress = req.nextUrl.searchParams.get('wallet_address');

    if (!walletAddress) {
      return NextResponse.json({ error: 'wallet_address query param required' }, { status: 400 });
    }

    // Only super_admin can remove admins
    const { authorized, error: authError } = await verifyAdmin(walletAddress, 'super_admin');
    if (!authorized) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    // Cannot remove yourself
    if (address === walletAddress) {
      return NextResponse.json({ error: 'Cannot remove yourself as admin' }, { status: 400 });
    }

    const { error: deleteError } = await getSupabaseAdmin()
      .from('admins')
      .delete()
      .eq('wallet_address', address);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
