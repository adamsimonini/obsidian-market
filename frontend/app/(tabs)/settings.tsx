import { ScrollView, View } from 'react-native';
import { Text } from '@/components/nativewindui/Text';
import { useColorScheme } from '@/lib/useColorScheme';

export default function SettingsScreen() {
  const { colors } = useColorScheme();

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1, padding: 24 }} 
      style={{ backgroundColor: colors.background }}
    >
      <View 
        className="rounded-xl p-6 border"
        style={{ 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <Text variant="title1" className="font-semibold mb-2" style={{ color: colors.cardForeground }}>
          Settings
        </Text>
        <Text style={{ color: colors.mutedForeground }}>
          App configuration controls will live here.
        </Text>
      </View>
    </ScrollView>
  );
}

