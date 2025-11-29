import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/nativewindui/Text';
import { WalletButton } from './WalletButton';
import { ThemeToggle } from './nativewindui/ThemeToggle';

export function Header() {
  const insets = useSafeAreaInsets();
  // On web, insets.top is 0, so we add minimum padding. On mobile, use safe area insets.
  const paddingTop = Platform.OS === 'web' ? Math.max(insets.top, 20) : insets.top;
  
  return (
    <View 
      className="border-b border-border bg-background px-5"
      style={{ paddingTop, paddingBottom: 20 }}
    >
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

