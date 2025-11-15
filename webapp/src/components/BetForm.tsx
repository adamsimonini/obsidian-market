import { useState, useCallback } from '@lynx-js/react'
import { useWallet } from '../hooks/useWallet'
import type { Market } from '../types/supabase'

interface BetFormProps {
  market: Market
  onClose: () => void
}

export function BetForm({ market, onClose }: BetFormProps) {
  const { address, connected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSide, setSelectedSide] = useState<boolean | null>(null)
  const [betAmount, setBetAmount] = useState('1')

  const handlePlaceBet = useCallback(async () => {
    if (!connected || !address) {
      setError('Please connect your wallet first')
      return
    }

    if (selectedSide === null) {
      setError('Please select Yes or No')
      return
    }

    if (market.status !== 'open') {
      setError('This market is not accepting bets')
      return
    }

    const amount = parseFloat(betAmount)
    if (isNaN(amount) || amount < 1) {
      setError('Minimum bet is 1 ALEO')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Convert ALEO to microcredits (1 ALEO = 1,000,000 microcredits)
      const amountMicrocredits = BigInt(Math.floor(amount * 1_000_000))

      // TODO: Call Aleo place_bet transition
      // const bet = await placeBetOnChain(market.market_id_onchain, selectedSide, amountMicrocredits)

      // For now, just show success message
      // In production, wait for transaction confirmation, then update UI

      alert(`Bet placed: ${selectedSide ? 'Yes' : 'No'} with ${amount} ALEO`)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet')
    } finally {
      setLoading(false)
    }
  }, [connected, address, selectedSide, betAmount, market, onClose])

  const calculatePayout = (amount: number, side: boolean) => {
    const odds = side ? market.yes_odds : market.no_odds
    return amount * odds
  }

  return (
    <view style={{ maxWidth: '600px', margin: '0 auto' }}>
      <text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
        {market.title}
      </text>
      {market.description && (
        <text style={{ fontSize: '14px', color: '#ccc', marginBottom: '24px', display: 'block' }}>
          {market.description}
        </text>
      )}

      {error && (
        <view
          style={{
            padding: '12px',
            backgroundColor: '#f44336',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <text style={{ color: 'white' }}>{error}</text>
        </view>
      )}

      {market.status !== 'open' && (
        <view
          style={{
            padding: '12px',
            backgroundColor: '#FF9800',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <text style={{ color: 'white' }}>This market is {market.status} and not accepting bets</text>
        </view>
      )}

      <view style={{ marginBottom: '24px' }}>
        <text style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '18px' }}>
          Select Your Prediction
        </text>
        <view style={{ display: 'flex', gap: '12px' }}>
          <view
            bindtap={() => setSelectedSide(true)}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: selectedSide === true ? '#4CAF50' : '#1a1a1a',
              border: selectedSide === true ? '2px solid #4CAF50' : '1px solid #333',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <text style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Yes</text>
            <text style={{ fontSize: '14px', color: '#ccc', display: 'block', marginTop: '4px' }}>
              {market.yes_odds}x odds
            </text>
          </view>
          <view
            bindtap={() => setSelectedSide(false)}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: selectedSide === false ? '#f44336' : '#1a1a1a',
              border: selectedSide === false ? '2px solid #f44336' : '1px solid #333',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <text style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>No</text>
            <text style={{ fontSize: '14px', color: '#ccc', display: 'block', marginTop: '4px' }}>
              {market.no_odds}x odds
            </text>
          </view>
        </view>
      </view>

      {selectedSide !== null && (
        <view style={{ marginBottom: '24px' }}>
          <text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Bet Amount (ALEO)</text>
          <input
            key={`bet-amount-${betAmount}`}
            type="text"
            bindinput={(e: any) => {
              const val = e.detail?.value || e.target?.value || ''
              // Validate numeric input manually
              if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                setBetAmount(val)
              }
            }}
            placeholder="1.0"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              color: 'white',
            }}
          />
          <text style={{ fontSize: '12px', color: '#999', display: 'block', marginTop: '4px' }}>
            Minimum: 1 ALEO
          </text>

          <view
            style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
            }}
          >
            <view style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <text style={{ color: '#999' }}>Potential Payout:</text>
              <text style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                {calculatePayout(parseFloat(betAmount) || 0, selectedSide).toFixed(2)} ALEO
              </text>
            </view>
            <view style={{ display: 'flex', justifyContent: 'space-between' }}>
              <text style={{ color: '#999' }}>Profit:</text>
              <text style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                +{(calculatePayout(parseFloat(betAmount) || 0, selectedSide) - (parseFloat(betAmount) || 0)).toFixed(2)}{' '}
                ALEO
              </text>
            </view>
          </view>
        </view>
      )}

      <view style={{ display: 'flex', gap: '12px' }}>
        <view
          bindtap={handlePlaceBet}
          style={{
            padding: '12px 24px',
            backgroundColor: loading || !connected || market.status !== 'open' ? '#666' : '#4CAF50',
            borderRadius: '8px',
            cursor: loading || !connected || market.status !== 'open' ? 'not-allowed' : 'pointer',
            flex: 1,
            textAlign: 'center',
          }}
        >
          <text style={{ color: 'white', fontWeight: 'bold' }}>
            {!connected ? 'Connect Wallet' : loading ? 'Placing Bet...' : 'Place Bet'}
          </text>
        </view>
        <view
          bindtap={onClose}
          style={{
            padding: '12px 24px',
            backgroundColor: '#666',
            borderRadius: '8px',
            cursor: 'pointer',
            flex: 1,
            textAlign: 'center',
          }}
        >
          <text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</text>
        </view>
      </view>
    </view>
  )
}

