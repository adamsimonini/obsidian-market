import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

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
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
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

