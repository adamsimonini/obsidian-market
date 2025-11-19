import { Button, Text, XStack, YStack } from 'tamagui';
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
        return '$green10';
      case 'closed':
        return '$orange10';
      case 'resolved':
        return '$blue10';
      case 'cancelled':
        return '$red10';
      default:
        return '$gray10';
    }
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleDateString();
  };

  return (
    <Button
      unstyled
      onPress={handlePress}
      backgroundColor="$backgroundHover"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$2"
      padding="$4"
      marginBottom="$4"
      pressStyle={{ opacity: 0.8 }}
    >
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
          <Text
            fontSize="$6"
            fontWeight="bold"
            color="$color"
            flex={1}
            numberOfLines={2}
          >
            {market.title}
          </Text>
          <YStack
            backgroundColor={getStatusColor(market.status)}
            paddingVertical="$1"
            paddingHorizontal="$3"
            borderRadius="$3"
          >
            <Text fontSize="$2" color="white" fontWeight="600">
              {market.status.toUpperCase()}
            </Text>
          </YStack>
        </XStack>

        {market.description && (
          <Text fontSize="$4" color="$colorPress" numberOfLines={3}>
            {market.description}
          </Text>
        )}

        <XStack gap="$4">
          <YStack>
            <Text fontSize="$2" color="$placeholderColor">
              Yes Odds:{' '}
            </Text>
            <Text fontSize="$4" color="$color" fontWeight="bold">
              {market.yes_odds}x
            </Text>
          </YStack>
          <YStack>
            <Text fontSize="$2" color="$placeholderColor">
              No Odds:{' '}
            </Text>
            <Text fontSize="$4" color="$color" fontWeight="bold">
              {market.no_odds}x
            </Text>
          </YStack>
        </XStack>

        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$2" color="$placeholderColor">
            Deadline: {formatDeadline(market.resolution_deadline)}
          </Text>
          {market.market_id_onchain && (
            <Text fontSize="$1" color="$placeholderColor">
              ID: {market.market_id_onchain}
            </Text>
          )}
        </XStack>
      </YStack>
    </Button>
  );
}

