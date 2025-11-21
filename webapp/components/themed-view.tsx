import { View, type ViewProps } from 'react-native';

import { useColorScheme } from '@/lib/useColorScheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { colors, isDarkColorScheme } = useColorScheme();
  const backgroundColor = darkColor && isDarkColorScheme
    ? darkColor
    : lightColor && !isDarkColorScheme
    ? lightColor
    : colors.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
