import { View, Text, TouchableOpacity } from 'react-native';
import { cn } from '@/lib/utils';
import type { Market } from '../types/supabase';

interface MarketCardProps {
  market: Market;
  onSelect?: (market: Market) => void;
}

export function MarketCard({ market, onSelect }: MarketCardProps) {
  const handlePress = () => {
    onSelect?.(market);
  };

  const getStatusColorClass = (status: Market['status']) => {
    switch (status) {
      case 'open':
        return 'bg-obsidian-green';
      case 'closed':
        return 'bg-obsidian-orange';
      case 'resolved':
        return 'bg-obsidian-blue';
      case 'cancelled':
        return 'bg-obsidian-red';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      className="mb-4 rounded-lg border border-obsidian-border bg-obsidian-card p-4 active:opacity-80"
      onPress={handlePress}
    >
      <View className="mb-3 flex-row items-start justify-between">
        <Text className="flex-1 text-lg font-bold text-obsidian-text mr-3" numberOfLines={2}>
          {market.title}
        </Text>
        <View className={cn('rounded-full px-3 py-1', getStatusColorClass(market.status))}>
          <Text className="text-xs font-semibold text-white">
            {market.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {market.description && (
        <Text className="mb-3 text-sm text-obsidian-text-muted" numberOfLines={3}>
          {market.description}
        </Text>
      )}

      <View className="mb-3 flex-row gap-4">
        <View>
          <Text className="text-xs text-obsidian-text-muted">Yes Odds: </Text>
          <Text className="text-sm font-bold text-obsidian-text">{market.yes_odds}x</Text>
        </View>
        <View>
          <Text className="text-xs text-obsidian-text-muted">No Odds: </Text>
          <Text className="text-sm font-bold text-obsidian-text">{market.no_odds}x</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-obsidian-text-muted">
          Deadline: {formatDeadline(market.resolution_deadline)}
        </Text>
        {market.market_id_onchain && (
          <Text className="text-[10px] text-obsidian-text-muted">
            ID: {market.market_id_onchain}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

