import '../global.css';
import 'expo-dev-client';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { ThemeProvider as NavThemeProvider } from '@react-navigation/native';

import { useColorScheme } from '@/lib/useColorScheme';
import { NAV_THEME } from '@/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { setColorScheme, colorScheme: nativewindColorScheme } = useNativewindColorScheme();
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  // Initialize color scheme to light by default
  useEffect(() => {
    if (!nativewindColorScheme) {
      setColorScheme('light');
    }
  }, [nativewindColorScheme, setColorScheme]);

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
    <>
      <StatusBar
        key={`root-status-bar-${isDarkColorScheme ? 'light' : 'dark'}`}
        style={isDarkColorScheme ? 'light' : 'dark'}
      />
      <NavThemeProvider value={NAV_THEME[colorScheme]}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </NavThemeProvider>
    </>
  );
}
