import { FlatList } from 'react-native';
import { Spinner, Text, YStack } from 'tamagui';
import { useMarkets } from '../hooks/useMarkets';
import { MarketCard } from './MarketCard';
import type { Market } from '../types/supabase';

interface MarketListProps {
  onMarketSelect?: (market: Market) => void;
  statusFilter?: 'open' | 'closed' | 'resolved' | 'cancelled';
}

export function MarketList({ onMarketSelect, statusFilter }: MarketListProps) {
  const { markets, loading, error } = useMarkets(statusFilter);

  if (loading) {
    return (
      <YStack padding="$5" alignItems="center" justifyContent="center">
        <Spinner size="large" color="$green10" />
        <Text marginTop="$3" color="$placeholderColor">
          Loading markets...
        </Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack padding="$5" alignItems="center" justifyContent="center">
        <Text color="$red10">
          Error loading markets: {error.message}
        </Text>
      </YStack>
    );
  }

  if (markets.length === 0) {
    return (
      <YStack padding="$5" alignItems="center" justifyContent="center">
        <Text color="$placeholderColor">No markets found</Text>
      </YStack>
    );
  }

  return (
    <FlatList
      data={markets}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MarketCard market={item} onSelect={onMarketSelect} />
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

