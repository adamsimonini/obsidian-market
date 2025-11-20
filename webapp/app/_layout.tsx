import '../global.css';
import 'expo-dev-client';
import { useEffect, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme as useNativewindColorScheme, vars } from 'nativewind';
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

  // Define CSS variables based on color scheme
  const themeVars = useMemo(() => {
    const isDark = (nativewindColorScheme ?? 'light') === 'dark';
    
    if (isDark) {
      return vars({
        '--background': '10 10 10',
        '--foreground': '236 237 238',
        '--card': '26 26 26',
        '--card-foreground': '236 237 238',
        '--popover': '26 26 26',
        '--popover-foreground': '236 237 238',
        '--primary': '76 175 80',
        '--primary-foreground': '255 255 255',
        '--secondary': '51 51 51',
        '--secondary-foreground': '236 237 238',
        '--muted': '51 51 51',
        '--muted-foreground': '153 153 153',
        '--accent': '255 152 0',
        '--accent-foreground': '255 255 255',
        '--destructive': '244 67 54',
        '--destructive-foreground': '255 255 255',
        '--border': '51 51 51',
        '--input': '26 26 26',
        '--ring': '76 175 80',
        '--android-background': '10 10 10',
        '--android-foreground': '236 237 238',
        '--android-card': '26 26 26',
        '--android-card-foreground': '236 237 238',
        '--android-popover': '26 26 26',
        '--android-popover-foreground': '236 237 238',
        '--android-primary': '76 175 80',
        '--android-primary-foreground': '255 255 255',
        '--android-secondary': '51 51 51',
        '--android-secondary-foreground': '236 237 238',
        '--android-muted': '51 51 51',
        '--android-muted-foreground': '153 153 153',
        '--android-accent': '255 152 0',
        '--android-accent-foreground': '255 255 255',
        '--android-destructive': '244 67 54',
        '--android-destructive-foreground': '255 255 255',
        '--android-border': '51 51 51',
        '--android-input': '26 26 26',
        '--android-ring': '76 175 80',
      });
    } else {
      return vars({
        '--background': '242 242 247',
        '--foreground': '0 0 0',
        '--card': '255 255 255',
        '--card-foreground': '8 28 30',
        '--popover': '230 230 235',
        '--popover-foreground': '0 0 0',
        '--primary': '0 123 254',
        '--primary-foreground': '255 255 255',
        '--secondary': '45 175 231',
        '--secondary-foreground': '255 255 255',
        '--muted': '175 176 180',
        '--muted-foreground': '142 142 147',
        '--accent': '255 40 84',
        '--accent-foreground': '255 255 255',
        '--destructive': '255 56 43',
        '--destructive-foreground': '255 255 255',
        '--border': '230 230 235',
        '--input': '210 210 215',
        '--ring': '230 230 235',
        '--android-background': '249 249 255',
        '--android-foreground': '0 0 0',
        '--android-card': '255 255 255',
        '--android-card-foreground': '24 28 35',
        '--android-popover': '215 217 228',
        '--android-popover-foreground': '0 0 0',
        '--android-primary': '0 112 233',
        '--android-primary-foreground': '255 255 255',
        '--android-secondary': '176 201 255',
        '--android-secondary-foreground': '20 55 108',
        '--android-muted': '193 198 215',
        '--android-muted-foreground': '65 71 84',
        '--android-accent': '169 73 204',
        '--android-accent-foreground': '255 255 255',
        '--android-destructive': '186 26 26',
        '--android-destructive-foreground': '255 255 255',
        '--android-border': '215 217 228',
        '--android-input': '210 210 215',
        '--android-ring': '215 217 228',
      });
    }
  }, [nativewindColorScheme]);

  return (
    <View style={themeVars} className="flex-1">
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
    </View>
  );
}
