import { useState, useCallback } from '@lynx-js/react'
import { useWallet } from '../hooks/useWallet'
import { useAdmin } from '../hooks/useAdmin'
import { supabase } from '../lib/supabase'

interface CreateMarketFormProps {
  onClose: () => void
}

export function CreateMarketForm({ onClose }: CreateMarketFormProps) {
  const { address, connected } = useWallet()
  const { isAdmin, loading: adminLoading } = useAdmin(address)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resolution_rules: '',
    resolution_source: 'Admin manual',
    resolution_deadline: '',
    yes_odds: '2.0',
    no_odds: '2.0',
  })

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!connected || !address) {
      setError('Please connect your wallet first')
      return
    }

    if (!isAdmin) {
      setError('Only admins can create markets')
      return
    }

    if (!formData.title || !formData.resolution_rules || !formData.resolution_deadline) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Generate market ID (simple increment for MVP - in production use proper ID generation)
      const marketId = Date.now()

      // TODO: Call Aleo create_market transition
      // For now, we'll create the Supabase record first
      // In production, create on-chain first, then sync to Supabase

      // Create market in Supabase
      const { data, error: supabaseError } = await supabase.from('markets').insert({
        title: formData.title,
        description: formData.description || null,
        resolution_rules: formData.resolution_rules,
        resolution_source: formData.resolution_source,
        resolution_deadline: formData.resolution_deadline,
        status: 'open',
        yes_odds: parseFloat(formData.yes_odds),
        no_odds: parseFloat(formData.no_odds),
        creator_address: address,
        market_id_onchain: marketId.toString(), // Will be updated after on-chain creation
      })

      if (supabaseError) {
        throw supabaseError
      }

      // TODO: After Supabase creation, call Aleo create_market
      // const aleoMarket = await createMarketOnChain(marketId, yesOdds, noOdds)
      // Then update market_id_onchain with actual on-chain ID

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create market')
    } finally {
      setLoading(false)
    }
  }, [connected, address, isAdmin, formData, onClose])

  if (adminLoading) {
    return (
      <view style={{ padding: '20px', textAlign: 'center' }}>
        <text style={{ color: '#999' }}>Checking admin status...</text>
      </view>
    )
  }

  if (!isAdmin) {
    return (
      <view style={{ padding: '20px', textAlign: 'center' }}>
        <text style={{ color: '#f44336' }}>Only admins can create markets</text>
      </view>
    )
  }

  return (
    <view style={{ maxWidth: '600px', margin: '0 auto' }}>
      <text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', display: 'block' }}>
        Create New Market
      </text>

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

      <view style={{ marginBottom: '16px' }}>
        <text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Title *</text>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Will Bitcoin reach $100k by end of 2024?"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            color: 'white',
          }}
        />
      </view>

      <view style={{ marginBottom: '16px' }}>
        <text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description</text>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Additional details about the market..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            color: 'white',
          }}
        />
      </view>

      <view style={{ marginBottom: '16px' }}>
        <text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Resolution Rules *</text>
        <textarea
          value={formData.resolution_rules}
          onChange={(e) => handleChange('resolution_rules', e.target.value)}
          placeholder="How will this market be resolved? (e.g., Based on official announcement from X by Y date)"
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            color: 'white',
          }}
        />
      </view>

      <view style={{ marginBottom: '16px' }}>
        <text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Resolution Deadline *</text>
        <input
          type="datetime-local"
          value={formData.resolution_deadline}
          onChange={(e) => handleChange('resolution_deadline', e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            color: 'white',
          }}
        />
      </view>

      <view style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <view style={{ flex: 1 }}>
          <text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Yes Odds</text>
          <input
            type="number"
            step="0.1"
            min="1"
            value={formData.yes_odds}
            onChange={(e) => handleChange('yes_odds', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              color: 'white',
            }}
          />
        </view>
        <view style={{ flex: 1 }}>
          <text style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>No Odds</text>
          <input
            type="number"
            step="0.1"
            min="1"
            value={formData.no_odds}
            onChange={(e) => handleChange('no_odds', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333',
              color: 'white',
            }}
          />
        </view>
      </view>

      <view style={{ display: 'flex', gap: '12px' }}>
        <view
          bindtap={handleSubmit}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#666' : '#4CAF50',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            flex: 1,
            textAlign: 'center',
          }}
        >
          <text style={{ color: 'white', fontWeight: 'bold' }}>{loading ? 'Creating...' : 'Create Market'}</text>
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

