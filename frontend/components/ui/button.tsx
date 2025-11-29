import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { Text, TextClassContext } from '@/components/nativewindui/Text';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-lg font-semibold disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        destructive: 'bg-destructive',
        outline: 'border border-border bg-transparent',
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

// Separate CVA for text styling - follows NativeWind UI pattern
const buttonTextVariants = cva('font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
      link: 'text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ButtonProps
  extends TouchableOpacityProps,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  loading?: boolean;
}

export function Button({
  className,
  variant = 'default',
  size,
  children,
  loading,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant })}>
      <TouchableOpacity
        className={cn(buttonVariants({ variant, size }), className)}
        style={style}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text>{children}</Text>
        )}
      </TouchableOpacity>
    </TextClassContext.Provider>
  );
}

