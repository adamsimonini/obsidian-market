import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import Animated, { LayoutAnimationConfig, ZoomInRotate } from 'react-native-reanimated';

import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme, colors } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <LayoutAnimationConfig skipEntering>
      <Animated.View
        className="items-center justify-center"
        key={`toggle-${colorScheme}`}
        entering={ZoomInRotate}>
        <Pressable 
          onPress={toggleColorScheme} 
          className={cn(
            'rounded-full p-2 items-center justify-center',
            isDark ? 'bg-primary/20' : 'bg-primary/10'
          )}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}>
          {isDark ? (
            <MaterialIcons 
              name="dark-mode" 
              size={20} 
              color={colors.foreground}
            />
          ) : (
            <MaterialIcons 
              name="light-mode" 
              size={20} 
              color={colors.foreground}
            />
          )}
        </Pressable>
      </Animated.View>
    </LayoutAnimationConfig>
  );
}

