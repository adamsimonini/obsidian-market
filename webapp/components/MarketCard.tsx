import { View } from 'react-native';
import { cn } from '@/lib/cn';
import {
  PressableCard,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
  CardBadge,
} from '@/components/nativewindui/Card';
import { Text } from '@/components/nativewindui/Text';
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
        return 'bg-primary';
      case 'closed':
        return 'bg-accent';
      case 'resolved':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString();
  };

  return (
    <PressableCard
      className="mb-4"
      onPress={handlePress}
    >
      <CardContent>
        <View className="mb-3 flex-row items-start justify-between">
          <CardTitle className="flex-1 mr-3" numberOfLines={2}>
            {market.title}
          </CardTitle>
          <CardBadge className={cn('border-0', getStatusColorClass(market.status))}>
            <Text variant="caption1" className="text-primary-foreground font-semibold">
              {market.status.toUpperCase()}
            </Text>
          </CardBadge>
        </View>

        {market.description && (
          <CardDescription className="mb-3" numberOfLines={3}>
            {market.description}
          </CardDescription>
        )}

        <View className="mb-3 flex-row gap-4">
          <View>
            <Text variant="caption1" color="tertiary">Yes Odds: </Text>
            <Text variant="subhead" className="font-bold">
              {market.yes_odds}x
            </Text>
          </View>
          <View>
            <Text variant="caption1" color="tertiary">No Odds: </Text>
            <Text variant="subhead" className="font-bold">
              {market.no_odds}x
            </Text>
          </View>
        </View>
      </CardContent>

      <CardFooter className="justify-between">
        <Text variant="caption1" color="tertiary">
          Deadline: {formatDeadline(market.resolution_deadline)}
        </Text>
        {market.market_id_onchain && (
          <Text variant="caption2" color="quarternary">
            ID: {market.market_id_onchain}
          </Text>
        )}
      </CardFooter>
    </PressableCard>
  );
}

