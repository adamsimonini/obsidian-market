import { View, ViewProps } from 'react-native';
import { Text } from 'react-native';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        'rounded-lg border border-obsidian-border bg-obsidian-card p-4',
        className
      )}
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
      className={cn('text-lg font-semibold leading-none tracking-tight text-obsidian-text', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ViewProps & { children: React.ReactNode }) {
  return (
    <Text
      className={cn('text-sm text-obsidian-text-muted', className)}
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

