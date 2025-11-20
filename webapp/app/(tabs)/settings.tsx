import { ScrollView, View } from 'react-native';
import { Text } from '@/components/nativewindui/Text';

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} className="bg-background">
      <View className="bg-card rounded-xl p-6 border border-border">
        <Text variant="title1" className="font-semibold text-card-foreground mb-2">
          Settings
        </Text>
        <Text className="text-muted-foreground">
          App configuration controls will live here.
        </Text>
      </View>
    </ScrollView>
  );
}

