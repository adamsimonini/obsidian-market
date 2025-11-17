import type { Market } from '../types/supabase';

interface MarketCardProps {
  market: Market;
  onSelect?: (market: Market) => void;
}

export function MarketCard({ market, onSelect }: MarketCardProps) {
  const handleTap = () => {
    onSelect?.(market);
  };

  const getStatusColor = (status: Market['status']) => {
    switch (status) {
      case 'open':
        return '#4CAF50';
      case 'closed':
        return '#FF9800';
      case 'resolved':
        return '#2196F3';
      case 'cancelled':
        return '#f44336';
      default:
        return '#9E9E9E';
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString();
  };

  return (
    <view
      bindtap={handleTap}
      style={{
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        border: '1px solid #333',
        cursor: 'pointer',
      }}
    >
      <view
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
        }}
      >
        <text
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            flex: 1,
          }}
        >
          {market.title}
        </text>
        <view
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            backgroundColor: getStatusColor(market.status),
          }}
        >
          <text
            style={{
              fontSize: '12px',
              color: 'white',
            }}
          >
            {market.status.toUpperCase()}
          </text>
        </view>
      </view>

      {market.description && (
        <text
          style={{
            fontSize: '14px',
            color: '#ccc',
            marginBottom: '12px',
            display: 'block',
          }}
        >
          {market.description}
        </text>
      )}

      <view style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <view>
          <text style={{ fontSize: '12px', color: '#999' }}>Yes Odds: </text>
          <text
            style={{ fontSize: '14px', color: 'white', fontWeight: 'bold' }}
          >
            {market.yes_odds}x
          </text>
        </view>
        <view>
          <text style={{ fontSize: '12px', color: '#999' }}>No Odds: </text>
          <text
            style={{ fontSize: '14px', color: 'white', fontWeight: 'bold' }}
          >
            {market.no_odds}x
          </text>
        </view>
      </view>

      <view
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <text style={{ fontSize: '12px', color: '#999' }}>
          Deadline: {formatDeadline(market.resolution_deadline)}
        </text>
        {market.market_id_onchain && (
          <text style={{ fontSize: '10px', color: '#666' }}>
            ID: {market.market_id_onchain}
          </text>
        )}
      </view>
    </view>
  );
}
