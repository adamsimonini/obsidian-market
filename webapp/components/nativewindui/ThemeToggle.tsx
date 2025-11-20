import { Pressable, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { LayoutAnimationConfig, ZoomInRotate } from 'react-native-reanimated';

import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';
import { COLORS } from '@/theme/colors';

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <LayoutAnimationConfig skipEntering>
      <Animated.View
        className="items-center justify-center"
        key={`toggle-${colorScheme}`}
        entering={ZoomInRotate}>
        <Pressable 
          onPress={toggleColorScheme} 
          className={cn('opacity-80 active:opacity-50')}>
          {colorScheme === 'dark' ? (
            <View className="px-0.5">
              <MaterialIcons 
                name="dark-mode" 
                size={24} 
                color={COLORS.white} 
              />
            </View>
          ) : (
            <View className="px-0.5">
              <MaterialIcons 
                name="light-mode" 
                size={24} 
                color={COLORS.black} 
              />
            </View>
          )}
        </Pressable>
      </Animated.View>
    </LayoutAnimationConfig>
  );
}

