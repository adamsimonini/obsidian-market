import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

import { useColorScheme } from '@/lib/useColorScheme';

export interface IconProps extends Omit<SymbolViewProps, 'style'> {
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
  className?: string;
}

export function Icon({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
  className,
  ...props
}: IconProps) {
  const { colors } = useColorScheme();
  // Use theme-aware foreground color as default, but allow override via color prop or className
  const defaultColor = color ?? colors.foreground;

  return (
    <SymbolView
      weight={weight}
      tintColor={defaultColor}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
      className={className}
      {...props}
    />
  );
}

