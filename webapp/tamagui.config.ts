import { createTamagui } from 'tamagui';

const config = createTamagui({
  themes: {
    dark: {
      background: '#0a0a0a',
      backgroundHover: '#1a1a1a',
      backgroundPress: '#2a2a2a',
      backgroundFocus: '#1a1a1a',
      color: '#ECEDEE',
      colorHover: '#fff',
      colorPress: '#ccc',
      colorFocus: '#fff',
      borderColor: '#333',
      borderColorHover: '#444',
      placeholderColor: '#666',
      green10: '#4CAF50',
      red10: '#f44336',
      orange10: '#FF9800',
      blue10: '#2196F3',
      gray10: '#9E9E9E',
    },
  },
  tokens: {
    size: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36,
      10: 40,
    },
    space: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36,
      10: 40,
    },
    radius: {
      0: 0,
      1: 4,
      2: 8,
      3: 12,
      4: 16,
    },
    zIndex: {
      0: 0,
      1: 100,
      2: 200,
      3: 300,
      4: 400,
      5: 500,
    },
  },
  shorthands: {
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    mx: 'marginHorizontal',
    my: 'marginVertical',
  },
});

export default config;

export type Conf = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

