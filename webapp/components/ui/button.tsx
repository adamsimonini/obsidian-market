import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Text } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-lg font-semibold disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-obsidian-green',
        destructive: 'bg-obsidian-red',
        outline: 'border border-obsidian-border bg-transparent',
        secondary: 'bg-obsidian-card',
        ghost: 'bg-transparent',
        link: 'bg-transparent',
      },
      size: {
        default: 'px-6 py-3',
        sm: 'px-4 py-2',
        lg: 'px-8 py-4',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends TouchableOpacityProps,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  children,
  loading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text
          className={cn(
            'font-semibold',
            variant === 'outline' || variant === 'ghost' || variant === 'link'
              ? 'text-obsidian-text'
              : 'text-white'
          )}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

