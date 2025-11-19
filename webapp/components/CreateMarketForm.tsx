import { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import {
  Button,
  Input,
  Spinner,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import { useWallet } from '../hooks/useWallet';
import { useAdmin } from '../hooks/useAdmin';
import { supabase } from '../lib/supabase';

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
      <YStack padding="$5" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$green10" />
        <Text marginTop="$3" color="$placeholderColor">
          Checking admin status...
        </Text>
      </YStack>
    );
  }

  if (!isAdmin) {
    return (
      <YStack padding="$5" alignItems="center" justifyContent="center">
        <Text color="$red10">Only admins can create markets</Text>
      </YStack>
    );
  }

  return (
    <ScrollView>
      <YStack
        padding="$5"
        maxWidth={600}
        alignSelf="center"
        width="100%"
        gap="$4"
      >
        <Text fontSize="$8" fontWeight="bold" color="$color" marginBottom="$6">
          Create New Market
        </Text>

        {error && (
          <YStack
            padding="$3"
            backgroundColor="$red10"
            borderRadius="$1"
          >
            <Text color="white">{error}</Text>
          </YStack>
        )}

        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="bold" color="$color">
            Title *
          </Text>
          <Input
            value={formData.title}
            onChangeText={(val) => handleChange('title', val)}
            placeholder="Will Bitcoin reach $100k by end of 2024?"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$placeholderColor"
          />
        </YStack>

        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="bold" color="$color">
            Description
          </Text>
          <Input
            value={formData.description}
            onChangeText={(val) => handleChange('description', val)}
            placeholder="Additional details about the market..."
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$placeholderColor"
            multiline
            minHeight={80}
            textAlignVertical="top"
          />
        </YStack>

        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="bold" color="$color">
            Resolution Rules *
          </Text>
          <Input
            value={formData.resolution_rules}
            onChangeText={(val) => handleChange('resolution_rules', val)}
            placeholder="How will this market be resolved?"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$placeholderColor"
            multiline
            minHeight={80}
            textAlignVertical="top"
          />
        </YStack>

        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="bold" color="$color">
            Resolution Deadline *
          </Text>
          <Input
            value={formData.resolution_deadline}
            onChangeText={(val) => handleChange('resolution_deadline', val)}
            placeholder="YYYY-MM-DDTHH:mm"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$placeholderColor"
          />
        </YStack>

        <XStack gap="$4">
          <YStack flex={1} gap="$2">
            <Text fontSize="$4" fontWeight="bold" color="$color">
              Yes Odds
            </Text>
            <Input
              value={formData.yes_odds}
              onChangeText={(val) => {
                if (val === '' || (!isNaN(Number(val)) && Number(val) > 0)) {
                  handleChange('yes_odds', val);
                }
              }}
              placeholder="2.0"
              keyboardType="numeric"
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              color="$color"
              placeholderTextColor="$placeholderColor"
            />
          </YStack>
          <YStack flex={1} gap="$2">
            <Text fontSize="$4" fontWeight="bold" color="$color">
              No Odds
            </Text>
            <Input
              value={formData.no_odds}
              onChangeText={(val) => {
                if (val === '' || (!isNaN(Number(val)) && Number(val) > 0)) {
                  handleChange('no_odds', val);
                }
              }}
              placeholder="2.0"
              keyboardType="numeric"
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              color="$color"
              placeholderTextColor="$placeholderColor"
            />
          </YStack>
        </XStack>

        <XStack gap="$3" marginTop="$2">
          <Button
            flex={1}
            onPress={handleSubmit}
            disabled={loading}
            backgroundColor={loading ? '$placeholderColor' : '$green10'}
            opacity={loading ? 0.5 : 1}
            color="white"
            fontWeight="bold"
            paddingVertical="$3"
            paddingHorizontal="$6"
            borderRadius="$2"
            pressStyle={{ opacity: 0.8 }}
          >
            {loading ? (
              <Spinner color="white" />
            ) : (
              <Text color="white" fontWeight="bold">
                Create Market
              </Text>
            )}
          </Button>
          <Button
            flex={1}
            onPress={onClose}
            backgroundColor="$placeholderColor"
            color="white"
            fontWeight="bold"
            paddingVertical="$3"
            paddingHorizontal="$6"
            borderRadius="$2"
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="white" fontWeight="bold">
              Cancel
            </Text>
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  );
}


