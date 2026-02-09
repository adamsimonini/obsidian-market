import { getSupabaseAdmin } from './supabase-server';
import type { Admin, AdminRole } from '@/types/supabase';

const ROLE_HIERARCHY: Record<AdminRole, AdminRole[]> = {
  super_admin: ['super_admin', 'market_creator', 'resolver'],
  market_creator: ['market_creator'],
  resolver: ['resolver'],
};

export async function verifyAdmin(
  walletAddress: string,
  requiredRole?: AdminRole,
): Promise<{ authorized: boolean; admin: Admin | null; error: string | null }> {
  if (!walletAddress) {
    return { authorized: false, admin: null, error: 'Wallet address required' };
  }

  const { data, error } = await getSupabaseAdmin()
    .from('admins')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error || !data) {
    return { authorized: false, admin: null, error: 'Not an admin' };
  }

  const admin = data as Admin;

  if (requiredRole) {
    const allowedRoles = ROLE_HIERARCHY[admin.role] || [];
    if (!allowedRoles.includes(requiredRole)) {
      return {
        authorized: false,
        admin,
        error: `Requires ${requiredRole} role, you have ${admin.role}`,
      };
    }
  }

  return { authorized: true, admin, error: null };
}
