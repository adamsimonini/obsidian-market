import { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/components/nativewindui/Text';
import { MarketList } from '../../components/MarketList';
import { CreateMarketForm } from '../../components/CreateMarketForm';
import { BetForm } from '../../components/BetForm';
import type { Market } from '../../types/supabase';
import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';

export default function HomeScreen() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { colors } = useColorScheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
          {selectedMarket ? (
            <View>
              <TouchableOpacity
                className="py-2 px-4 rounded mb-4 self-start"
                style={{ backgroundColor: colors.muted }}
                onPress={() => setSelectedMarket(null)}
              >
                <Text className="text-foreground">← Back to Markets</Text>
              </TouchableOpacity>
              <BetForm
                market={selectedMarket}
                onClose={() => setSelectedMarket(null)}
              />
            </View>
          ) : showCreateForm ? (
            <View>
              <TouchableOpacity
                className="py-2 px-4 rounded mb-4 self-start"
                style={{ backgroundColor: colors.muted }}
                onPress={() => setShowCreateForm(false)}
              >
                <Text className="text-foreground">← Back to Markets</Text>
              </TouchableOpacity>
              <CreateMarketForm onClose={() => setShowCreateForm(false)} />
            </View>
          ) : (
            <View>
              <View className="flex-row justify-between items-center mb-5">
                <Text variant="title1" className="font-bold text-foreground">
                  Markets
                </Text>
                <TouchableOpacity
                  className="py-3 px-6 rounded-lg"
                  style={{ backgroundColor: colors.primary }}
                  onPress={() => setShowCreateForm(true)}
                >
                  <Text className="text-primary-foreground font-bold">
                    Create Market
                  </Text>
                </TouchableOpacity>
              </View>
              <MarketList onMarketSelect={setSelectedMarket} />
            </View>
          )}
        </ScrollView>
      </View>
  );
}
