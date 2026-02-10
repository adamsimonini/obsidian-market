'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/components/AdminPanel';
import { useAdmin } from '@/hooks/useAdmin';
import { useWallet } from '@/hooks/useWallet';
import { useFontSize, type FontSize } from '@/hooks/useFontSize';
import { cn } from '@/lib/utils';

const FONT_OPTIONS: { value: FontSize; label: string }[] = [
  { value: '14', label: 'Small' },
  { value: '16', label: 'Medium' },
  { value: '18', label: 'Large' },
];

export default function SettingsPage() {
  const { address } = useWallet();
  const { isAdmin, role } = useAdmin(address);
  const { size, setSize } = useFontSize();

  const isSuperAdmin = isAdmin && role === 'super_admin';

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>Customize your experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Font Size</p>
              <div className="flex gap-2">
                {FONT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={size === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSize(opt.value)}
                    className={cn('min-w-20', size === opt.value && 'pointer-events-none')}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Adjusts text size across the entire app.
              </p>
            </div>
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
