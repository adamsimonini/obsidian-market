'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MarketList } from '@/components/MarketList';
import { CreateMarketForm } from '@/components/CreateMarketForm';
import { BetForm } from '@/components/BetForm';
import { useAdmin } from '@/hooks/useAdmin';
import { useWallet } from '@/hooks/useWallet';
import type { Market } from '@/types/supabase';

export default function HomePage() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const { address } = useWallet();
  const { isAdmin, role } = useAdmin(address);

  const canCreate = isAdmin && (role === 'super_admin' || role === 'market_creator');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {selectedMarket ? (
          <div>
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setSelectedMarket(null)}
            >
              &larr; Back to Markets
            </Button>
            <BetForm
              market={selectedMarket}
              onClose={() => setSelectedMarket(null)}
            />
          </div>
        ) : showCreateForm ? (
          <div>
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setShowCreateForm(false)}
            >
              &larr; Back to Markets
            </Button>
            <CreateMarketForm onClose={() => setShowCreateForm(false)} />
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Markets</h1>
              {canCreate && (
                <Button onClick={() => setShowCreateForm(true)}>
                  Create Market
                </Button>
              )}
            </div>
            <MarketList
              onMarketSelect={setSelectedMarket}
              categoryId={categoryId}
              onCategoryChange={setCategoryId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
