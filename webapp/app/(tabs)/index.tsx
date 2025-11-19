import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { WalletProvider } from '../../contexts/WalletContext';
import { WalletButton } from '../../components/WalletButton';
import { MarketList } from '../../components/MarketList';
import { CreateMarketForm } from '../../components/CreateMarketForm';
import { BetForm } from '../../components/BetForm';
import type { Market } from '../../types/supabase';

export default function HomeScreen() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <WalletProvider>
      <YStack flex={1} backgroundColor="$background">
        <XStack
          padding="$5"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          justifyContent="space-between"
          alignItems="center"
          backgroundColor="$background"
        >
          <Text fontSize="$8" fontWeight="bold" color="$color">
            Obsidian Market
          </Text>
          <WalletButton />
        </XStack>

        <ScrollView>
          <YStack
            padding="$5"
            maxWidth={1200}
            alignSelf="center"
            width="100%"
          >
            {selectedMarket ? (
              <YStack>
                <Button
                  unstyled
                  onPress={() => setSelectedMarket(null)}
                  paddingVertical="$2"
                  paddingHorizontal="$4"
                  backgroundColor="$placeholderColor"
                  borderRadius="$1"
                  marginBottom="$4"
                  alignSelf="flex-start"
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text color="white">← Back to Markets</Text>
                </Button>
                <BetForm
                  market={selectedMarket}
                  onClose={() => setSelectedMarket(null)}
                />
              </YStack>
            ) : showCreateForm ? (
              <YStack>
                <Button
                  unstyled
                  onPress={() => setShowCreateForm(false)}
                  paddingVertical="$2"
                  paddingHorizontal="$4"
                  backgroundColor="$placeholderColor"
                  borderRadius="$1"
                  marginBottom="$4"
                  alignSelf="flex-start"
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text color="white">← Back to Markets</Text>
                </Button>
                <CreateMarketForm onClose={() => setShowCreateForm(false)} />
              </YStack>
            ) : (
              <YStack>
                <XStack
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom="$5"
                >
                  <Text fontSize="$6" fontWeight="bold" color="$color">
                    Markets
                  </Text>
                  <Button
                    onPress={() => setShowCreateForm(true)}
                    backgroundColor="$green10"
                    color="white"
                    fontWeight="bold"
                    paddingVertical="$3"
                    paddingHorizontal="$6"
                    borderRadius="$2"
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <Text color="white" fontWeight="bold">
                      Create Market
                    </Text>
                  </Button>
                </XStack>
                <MarketList onMarketSelect={setSelectedMarket} />
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </WalletProvider>
  );
}

