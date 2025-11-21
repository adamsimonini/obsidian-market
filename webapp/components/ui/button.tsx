import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-lg font-semibold disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-border bg-transparent text-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: 'bg-transparent text-foreground',
        link: 'bg-transparent text-foreground',
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
  style,
  ...props
}: ButtonProps) {
  const isOutlineVariant = variant === 'outline' || variant === 'ghost' || variant === 'link';
  
  return (
    <TouchableOpacity
      className={cn(buttonVariants({ variant, size }), className)}
      style={style}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
        />
      ) : (
        <Text className="font-semibold">
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

