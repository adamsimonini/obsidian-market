import { View, ViewProps, Pressable, PressableProps, TextProps } from 'react-native';
import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';

// Utility function to add opacity to RGB color
export function addOpacityToRgb(rgb: string, opacity: number): string {
  // Handle rgb() format: "rgb(255, 255, 255)" -> "rgba(255, 255, 255, 0.5)"
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const [, r, g, b] = match;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // If already rgba or hex, return as is
  return rgb;
}

// Main Card component
export function Card({ className, style, ...props }: ViewProps) {
  const { colors } = useColorScheme();
  
  return (
    <View
      className={cn(
        'rounded-lg border bg-card',
        className
      )}
      style={[{ borderColor: colors.border }, style]}
      {...props}
    />
  );
}

// Pressable Card variant
export function PressableCard({ className, style, ...props }: PressableProps) {
  const { colors } = useColorScheme();
  
  return (
    <Pressable
      className={cn(
        'rounded-lg border bg-card active:opacity-80',
        className
      )}
      style={[{ borderColor: colors.border }, style]}
      {...props}
    />
  );
}

// CardContent
export function CardContent({ className, ...props }: ViewProps) {
  return (
    <View className={cn('p-4', className)} {...props} />
  );
}

// CardTitle
export function CardTitle({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn('text-lg font-semibold leading-none tracking-tight text-card-foreground', className)}
      {...props}
    />
  );
}

// CardSubtitle
export function CardSubtitle({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn('text-sm font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

// CardDescription
export function CardDescription({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

// CardFooter
export function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View className={cn('flex flex-row items-center p-4 pt-0', className)} {...props} />
  );
}

// CardBadge
export function CardBadge({ className, ...props }: ViewProps & { children: React.ReactNode }) {
  return (
    <View
      className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors', className)}
      {...props}
    />
  );
}

// CardImage (for future use)
export function CardImage({ className, ...props }: ViewProps) {
  return (
    <View className={cn('aspect-video w-full overflow-hidden rounded-t-lg', className)} {...props} />
  );
}

