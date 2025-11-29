import '../global.css';
// expo-dev-client is only needed for development builds with custom native code
// Comment out for Expo Go compatibility - Expo Go doesn't support custom native modules
// Uncomment if you're using a development build (not Expo Go)
// import 'expo-dev-client';
import { useEffect, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { useColorScheme as useNativewindColorScheme, vars } from 'nativewind';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';

import { useColorScheme } from '@/lib/useColorScheme';
import { COLORS } from '@/theme/colors';
import { NAV_THEME } from '@/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Convert RGB color to space-separated RGB values for CSS variables
function rgbToCssVar(rgb: string | undefined): string {
  if (!rgb) {
    console.warn('Undefined color value passed to rgbToCssVar');
    return '0 0 0'; // Default to black
  }
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const [, r, g, b] = match;
    return `${r} ${g} ${b}`;
  }
  console.warn(`Invalid RGB format: ${rgb}`);
  return '0 0 0'; // Default to black if format is invalid
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme: nativewindColorScheme } = useNativewindColorScheme();
  const currentScheme = nativewindColorScheme ?? 'light';
  const colors = COLORS[currentScheme];

  // Set CSS variables dynamically based on theme
  // Using space-separated RGB values (e.g., "255 255 255") for opacity support
  const themeVars = useMemo(() => ({
    '--background': rgbToCssVar(colors.background),
    '--foreground': rgbToCssVar(colors.foreground),
    '--card': rgbToCssVar(colors.card),
    '--card-foreground': rgbToCssVar(colors.cardForeground),
    '--popover': rgbToCssVar(colors.popover),
    '--popover-foreground': rgbToCssVar(colors.popoverForeground),
    '--primary': rgbToCssVar(colors.primary),
    '--primary-foreground': rgbToCssVar(colors.primaryForeground),
    '--secondary': rgbToCssVar(colors.secondary),
    '--secondary-foreground': rgbToCssVar(colors.secondaryForeground),
    '--muted': rgbToCssVar(colors.muted),
    '--muted-foreground': rgbToCssVar(colors.mutedForeground),
    '--accent': rgbToCssVar(colors.accent),
    '--accent-foreground': rgbToCssVar(colors.accentForeground),
    '--destructive': rgbToCssVar(colors.destructive),
    '--destructive-foreground': rgbToCssVar(colors.destructiveForeground),
    '--border': rgbToCssVar(colors.border),
    '--input': rgbToCssVar(colors.input),
    '--ring': rgbToCssVar(colors.ring),
  }), [colors]);

  // Use NativeWind's vars() to convert CSS variables to React Native styles
  return (
    <View style={vars(themeVars)} className="flex-1">
      {children}
    </View>
  );
}

export default function RootLayout() {
  const { colorScheme: nativewindColorScheme } = useNativewindColorScheme();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  // Sync HTML class for web support
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const htmlElement = document.documentElement;
      const isDark = (nativewindColorScheme ?? 'light') === 'dark';

      if (isDark) {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    }
  }, [nativewindColorScheme]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar
          key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
          style={isDarkColorScheme ? 'light' : 'dark'}
          translucent={Platform.OS === 'android'}
          backgroundColor="transparent"
        />
        <NavThemeProvider value={NAV_THEME[colorScheme]}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </NavThemeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
