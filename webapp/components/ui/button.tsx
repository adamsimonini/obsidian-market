import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-lg font-semibold disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        destructive: 'bg-destructive',
        outline: 'border bg-transparent',
        secondary: 'bg-secondary',
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
  style,
  ...props
}: ButtonProps) {
  const { colors } = useColorScheme();
  const isOutlineVariant = variant === 'outline' || variant === 'ghost' || variant === 'link';
  const indicatorColor = isOutlineVariant ? colors.foreground : colors.primaryForeground;
  
  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'default':
        return colors.primary;
      case 'destructive':
        return colors.destructive;
      case 'secondary':
        return colors.secondary;
      case 'outline':
      case 'ghost':
      case 'link':
        return 'transparent';
      default:
        return colors.primary;
    }
  };
  
  // Apply border color for outline variant
  const borderStyle = variant === 'outline' ? { borderColor: colors.border } : {};
  const backgroundColor = getBackgroundColor();
  
  return (
    <TouchableOpacity
      className={cn(buttonVariants({ variant, size }), className)}
      style={[{ backgroundColor, ...borderStyle }, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={indicatorColor}
          size="small" 
        />
      ) : (
        <Text
          className={cn(
            'font-semibold',
            isOutlineVariant
              ? 'text-foreground'
              : 'text-primary-foreground'
          )}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

