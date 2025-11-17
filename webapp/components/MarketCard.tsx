import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Market } from '../types/supabase';

interface MarketCardProps {
  market: Market;
  onSelect?: (market: Market) => void;
}

export function MarketCard({ market, onSelect }: MarketCardProps) {
  const handlePress = () => {
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
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {market.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(market.status) },
          ]}
        >
          <Text style={styles.statusText}>{market.status.toUpperCase()}</Text>
        </View>
      </View>

      {market.description && (
        <Text style={styles.description} numberOfLines={3}>
          {market.description}
        </Text>
      )}

      <View style={styles.oddsRow}>
        <View>
          <Text style={styles.oddsLabel}>Yes Odds: </Text>
          <Text style={styles.oddsValue}>{market.yes_odds}x</Text>
        </View>
        <View>
          <Text style={styles.oddsLabel}>No Odds: </Text>
          <Text style={styles.oddsValue}>{market.no_odds}x</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Deadline: {formatDeadline(market.resolution_deadline)}
        </Text>
        {market.market_id_onchain && (
          <Text style={styles.marketId}>
            ID: {market.market_id_onchain}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
  },
  oddsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  oddsLabel: {
    fontSize: 12,
    color: '#999',
  },
  oddsValue: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  marketId: {
    fontSize: 10,
    color: '#666',
  },
});

