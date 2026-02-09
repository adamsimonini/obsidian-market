'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AdminPanel } from '@/components/AdminPanel';
import { useAdmin } from '@/hooks/useAdmin';
import { useWallet } from '@/hooks/useWallet';

export default function SettingsPage() {
  const { address } = useWallet();
  const { isAdmin, role } = useAdmin(address);

  const isSuperAdmin = isAdmin && role === 'super_admin';

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>App configuration controls will live here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              App configuration controls will live here.
            </p>
          </CardContent>
        </Card>

        {isSuperAdmin && (
          <div>
            <h2 className="mb-4 text-xl font-bold">Admin Management</h2>
            <AdminPanel />
          </div>
        )}
      </div>
    </div>
  );
}
