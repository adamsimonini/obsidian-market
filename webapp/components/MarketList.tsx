import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading markets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Error loading markets: {error.message}
        </Text>
      </View>
    );
  }

  if (markets.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No markets found</Text>
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
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#999',
  },
  errorText: {
    color: '#f44336',
  },
  emptyText: {
    color: '#999',
  },
  list: {
    paddingBottom: 20,
  },
});

