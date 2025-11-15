import { useMarkets } from '../hooks/useMarkets'
import { MarketCard } from './MarketCard'
import type { Market } from '../types/supabase'

interface MarketListProps {
  onMarketSelect?: (market: Market) => void
  statusFilter?: 'open' | 'closed' | 'resolved' | 'cancelled'
}

export function MarketList({ onMarketSelect, statusFilter }: MarketListProps) {
  const { markets, loading, error } = useMarkets(statusFilter)

  if (loading) {
    return (
      <view style={{ padding: '20px', textAlign: 'center' }}>
        <text style={{ color: '#999' }}>Loading markets...</text>
      </view>
    )
  }

  if (error) {
    return (
      <view style={{ padding: '20px', textAlign: 'center' }}>
        <text style={{ color: '#f44336' }}>Error loading markets: {error.message}</text>
      </view>
    )
  }

  if (markets.length === 0) {
    return (
      <view style={{ padding: '20px', textAlign: 'center' }}>
        <text style={{ color: '#999' }}>No markets found</text>
      </view>
    )
  }

  return (
    <view>
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} onSelect={onMarketSelect} />
      ))}
    </view>
  )
}

