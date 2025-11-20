import { View, ViewProps } from 'react-native';
import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';

export function Card({ className, style, ...props }: ViewProps) {
  const { colors } = useColorScheme();
  
  return (
    <View
      className={cn(
        'rounded-lg border bg-card p-4',
        className
      )}
      style={[{ borderColor: colors.border }, style]}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ViewProps) {
  return (
    <View className={cn('flex flex-col space-y-1.5 p-4', className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: ViewProps & { children: React.ReactNode }) {
  return (
    <Text
      className={cn('text-lg font-semibold leading-none tracking-tight text-card-foreground', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ViewProps & { children: React.ReactNode }) {
  return (
    <Text
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn('p-4 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View className={cn('flex flex-row items-center p-4 pt-0', className)} {...props} />
  );
}

