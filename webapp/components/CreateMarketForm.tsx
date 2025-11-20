import { useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { useAdmin } from '../hooks/useAdmin';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface CreateMarketFormProps {
  onClose: () => void;
}

export function CreateMarketForm({ onClose }: CreateMarketFormProps) {
  const { address, connected } = useWallet();
  const { isAdmin, loading: adminLoading } = useAdmin(address);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resolution_rules: '',
    resolution_source: 'Admin manual',
    resolution_deadline: '',
    yes_odds: '2.0',
    no_odds: '2.0',
  });

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!connected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isAdmin) {
      setError('Only admins can create markets');
      return;
    }

    if (
      !formData.title ||
      !formData.resolution_rules ||
      !formData.resolution_deadline
    ) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const marketId = Date.now();

      const { data, error: supabaseError } = await supabase
        .from('markets')
        .insert({
          title: formData.title,
          description: formData.description || null,
          resolution_rules: formData.resolution_rules,
          resolution_source: formData.resolution_source,
          resolution_deadline: formData.resolution_deadline,
          status: 'open',
          yes_odds: parseFloat(formData.yes_odds),
          no_odds: parseFloat(formData.no_odds),
          creator_address: address,
          market_id_onchain: marketId.toString(),
        });

      if (supabaseError) {
        throw supabaseError;
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create market');
    } finally {
      setLoading(false);
    }
  }, [connected, address, isAdmin, formData, onClose]);

  if (adminLoading) {
    return (
      <View className="items-center justify-center p-5">
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text className="mt-3 text-obsidian-text-muted">Checking admin status...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View className="items-center justify-center p-5">
        <Text className="text-obsidian-red">Only admins can create markets</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="w-full max-w-[600px] self-center p-5">
        <Text className="mb-6 text-2xl font-bold text-obsidian-text">Create New Market</Text>

        {error && (
          <View className="mb-4 rounded bg-obsidian-red p-3">
            <Text className="text-white">{error}</Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="mb-2 font-bold text-obsidian-text">Title *</Text>
          <Input
            value={formData.title}
            onChangeText={(val) => handleChange('title', val)}
            placeholder="Will Bitcoin reach $100k by end of 2024?"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 font-bold text-obsidian-text">Description</Text>
          <Input
            value={formData.description}
            onChangeText={(val) => handleChange('description', val)}
            placeholder="Additional details about the market..."
            multiline
            numberOfLines={4}
            className="min-h-[80px] text-top"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 font-bold text-obsidian-text">Resolution Rules *</Text>
          <Input
            value={formData.resolution_rules}
            onChangeText={(val) => handleChange('resolution_rules', val)}
            placeholder="How will this market be resolved?"
            multiline
            numberOfLines={3}
            className="min-h-[80px] text-top"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 font-bold text-obsidian-text">Resolution Deadline *</Text>
          <Input
            value={formData.resolution_deadline}
            onChangeText={(val) => handleChange('resolution_deadline', val)}
            placeholder="YYYY-MM-DDTHH:mm"
          />
        </View>

        <View className="mb-4 flex-row gap-4">
          <View className="flex-1">
            <Text className="mb-2 font-bold text-obsidian-text">Yes Odds</Text>
            <Input
              value={formData.yes_odds}
              onChangeText={(val) => {
                if (val === '' || (!isNaN(Number(val)) && Number(val) > 0)) {
                  handleChange('yes_odds', val);
                }
              }}
              placeholder="2.0"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="mb-2 font-bold text-obsidian-text">No Odds</Text>
            <Input
              value={formData.no_odds}
              onChangeText={(val) => {
                if (val === '' || (!isNaN(Number(val)) && Number(val) > 0)) {
                  handleChange('no_odds', val);
                }
              }}
              placeholder="2.0"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View className="mt-2 flex-row gap-3">
          <Button
            className="flex-1"
            onPress={handleSubmit}
            disabled={loading}
            loading={loading}
          >
            Create Market
          </Button>
          <Button
            className="flex-1"
            variant="secondary"
            onPress={onClose}
          >
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}


