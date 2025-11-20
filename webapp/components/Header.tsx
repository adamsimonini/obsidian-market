import { View } from 'react-native';
import { Text } from '@/components/nativewindui/Text';
import { WalletButton } from './WalletButton';
import { ThemeToggle } from './nativewindui/ThemeToggle';

export function Header() {
  return (
    <View className="border-b border-border bg-background px-5 py-5">
      <View className="flex-row items-center justify-between">
        <Text variant="title1" className="font-bold text-foreground">
          Obsidian Market
        </Text>
        <View className="flex-row items-center">
          <View className="mr-3">
            <ThemeToggle />
          </View>
          <WalletButton />
        </View>
      </View>
    </View>
  );
}

