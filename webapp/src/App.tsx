import { useState } from '@lynx-js/react';
import { WalletProvider } from './contexts/WalletContext';
import { WalletButton } from './components/WalletButton';
import { MarketList } from './components/MarketList';
import { CreateMarketForm } from './components/CreateMarketForm';
import { BetForm } from './components/BetForm';
import type { Market } from './types/supabase';
import './App.css';

export function App(props: { onRender?: () => void }) {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  props.onRender?.();

  return (
    <WalletProvider>
      <view
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0a0a',
          color: 'white',
        }}
      >
        <view
          style={{
            padding: '20px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <text style={{ fontSize: '24px', fontWeight: 'bold' }}>
            Obsidian Market
          </text>
          <WalletButton />
        </view>

        <view style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          {selectedMarket ? (
            <view>
              <view style={{ marginBottom: '20px' }}>
                <view
                  bindtap={() => setSelectedMarket(null)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    display: 'flex',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    alignSelf: 'flex-start',
                  }}
                >
                  <text style={{ color: 'white' }}>← Back to Markets</text>
                </view>
                <BetForm
                  market={selectedMarket}
                  onClose={() => setSelectedMarket(null)}
                />
              </view>
            </view>
          ) : showCreateForm ? (
            <view>
              <view style={{ marginBottom: '20px' }}>
                <view
                  bindtap={() => setShowCreateForm(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    display: 'flex',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    alignSelf: 'flex-start',
                  }}
                >
                  <text style={{ color: 'white' }}>← Back to Markets</text>
                </view>
                <CreateMarketForm onClose={() => setShowCreateForm(false)} />
              </view>
            </view>
          ) : (
            <view>
              <view
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <text style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  Markets
                </text>
                <view
                  bindtap={() => setShowCreateForm(true)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <text style={{ color: 'white', fontWeight: 'bold' }}>
                    Create Market
                  </text>
                </view>
              </view>
              <MarketList onMarketSelect={setSelectedMarket} />
            </view>
          )}
        </view>
      </view>
    </WalletProvider>
  );
}
