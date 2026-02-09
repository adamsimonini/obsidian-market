'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';
import type { Admin, AdminRole } from '@/types/supabase';

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  market_creator: 'Market Creator',
  resolver: 'Resolver',
};

const ROLE_VARIANTS: Record<AdminRole, 'default' | 'secondary' | 'outline'> = {
  super_admin: 'default',
  market_creator: 'secondary',
  resolver: 'outline',
};

export function AdminPanel() {
  const { address } = useWallet();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Add admin form state
  const [newAddress, setNewAddress] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('market_creator');

  const fetchAdmins = useCallback(async () => {
    if (!address) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/admins?wallet_address=${encodeURIComponent(address)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch admins');
      }

      setAdmins(data.admins);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !newAddress.trim()) return;

    try {
      setActionLoading(true);
      setError(null);

      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          target_address: newAddress.trim(),
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add admin');
      }

      setNewAddress('');
      setNewRole('market_creator');
      await fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async (targetAddress: string) => {
    if (!address) return;

    try {
      setActionLoading(true);
      setError(null);

      const res = await fetch(
        `/api/admin/admins/${encodeURIComponent(targetAddress)}?wallet_address=${encodeURIComponent(address)}`,
        { method: 'DELETE' },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove admin');
      }

      await fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove admin');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive p-3">
          <p className="text-sm text-white">{error}</p>
        </div>
      )}

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Admins ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.wallet_address}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm">{admin.wallet_address}</p>
                  <Badge variant={ROLE_VARIANTS[admin.role]} className="mt-1">
                    {ROLE_LABELS[admin.role]}
                  </Badge>
                </div>
                {admin.wallet_address !== address && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemoveAdmin(admin.wallet_address)}
                    disabled={actionLoading}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Wallet Address</label>
              <Input
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="aleo1..."
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as AdminRole)}
                className="border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px]"
              >
                <option value="market_creator">Market Creator</option>
                <option value="resolver">Resolver</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Super Admin: full access. Market Creator: create markets. Resolver: resolve markets.
              </p>
            </div>

            <Button type="submit" disabled={actionLoading || !newAddress.trim()}>
              {actionLoading && <Loader2 className="size-4 animate-spin" />}
              Add Admin
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
