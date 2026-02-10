'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';
import type { Admin, AdminRole } from '@/types/supabase';
import { isValidAleoAddress } from '@/lib/aleo-address';

const ROLE_KEYS: Record<AdminRole, string> = {
  super_admin: 'superAdmin',
  market_creator: 'marketCreator',
  resolver: 'resolver',
};

const ROLE_VARIANTS: Record<AdminRole, 'default' | 'secondary' | 'outline'> = {
  super_admin: 'default',
  market_creator: 'secondary',
  resolver: 'outline',
};

export function AdminPanel() {
  const t = useTranslations('admin');
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
        throw new Error(data.error || t('failedFetch'));
      }

      setAdmins(data.admins);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedFetch'));
    } finally {
      setLoading(false);
    }
  }, [address, t]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !newAddress.trim()) return;

    if (!isValidAleoAddress(newAddress.trim())) {
      setError(t('invalidAddress'));
      return;
    }

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
        throw new Error(data.error || t('failedAdd'));
      }

      setNewAddress('');
      setNewRole('market_creator');
      await fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedAdd'));
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
        throw new Error(data.error || t('failedRemove'));
      }

      await fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedRemove'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">{t('loadingPanel')}</p>
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
          <CardTitle>{t('admins', { count: admins.length })}</CardTitle>
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
                    {t(ROLE_KEYS[admin.role])}
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
          <CardTitle>{t('addAdmin')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">{t('walletAddress')}</label>
              <Input
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="aleo1..."
                className="font-mono"
              />
              {newAddress.trim() && !isValidAleoAddress(newAddress.trim()) && (
                <p className="text-xs text-destructive">
                  {t('invalidAddressShort')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">{t('role')}</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as AdminRole)}
                className="border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px]"
              >
                <option value="market_creator">{t('marketCreator')}</option>
                <option value="resolver">{t('resolver')}</option>
                <option value="super_admin">{t('superAdmin')}</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {t('roleDescription')}
              </p>
            </div>

            <Button type="submit" disabled={actionLoading || !newAddress.trim() || !isValidAleoAddress(newAddress.trim())}>
              {actionLoading && <Loader2 className="size-4 animate-spin" />}
              {t('addAdmin')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
