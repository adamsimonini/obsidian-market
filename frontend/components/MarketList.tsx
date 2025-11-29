import { View, FlatList, ActivityIndicator } from 'react-native';
import { Text } from '@/components/nativewindui/Text';
import { useMarkets } from '../hooks/useMarkets';
import { MarketCard } from './MarketCard';
import type { Market } from '../types/supabase';
import { useColorScheme } from '@/lib/useColorScheme';

interface MarketListProps {
  onMarketSelect?: (market: Market) => void;
  statusFilter?: 'open' | 'closed' | 'resolved' | 'cancelled';
}

export function MarketList({ onMarketSelect, statusFilter }: MarketListProps) {
  const { markets, loading, error } = useMarkets(statusFilter);
  const { colors } = useColorScheme();

  if (loading) {
    return (
      <View className="p-5 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-3 text-muted-foreground">Loading markets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-5 items-center justify-center">
        <Text className="text-destructive">
          Error loading markets: {error.message}
        </Text>
      </View>
    );
  }

  if (markets.length === 0) {
    return (
      <View className="p-5 items-center justify-center">
        <Text className="text-muted-foreground">No markets found</Text>
      </View>
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

