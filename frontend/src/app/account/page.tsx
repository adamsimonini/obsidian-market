'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';

export default function AccountPage() {
  const { address, connected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Account</CardTitle>
            <CardDescription>
              {connected
                ? `Connected: ${address}`
                : 'Connect your wallet to view account details.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Wallet &amp; profile details will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
