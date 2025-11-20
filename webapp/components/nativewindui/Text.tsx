import { VariantProps, cva } from 'class-variance-authority';

import * as React from 'react';

import { Text as RNText } from 'react-native';

import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';

const textVariants = cva('', {
  variants: {
    variant: {
      largeTitle: 'text-4xl',
      title1: 'text-2xl',
      title2: 'text-[22px] leading-7',
      title3: 'text-xl',
      heading: 'text-[17px] leading-6 font-semibold',
      body: 'text-[17px] leading-6',
      callout: 'text-base',
      subhead: 'text-[15px] leading-6',
      footnote: 'text-[13px] leading-5',
      caption1: 'text-xs',
      caption2: 'text-[11px] leading-4',
    },
    color: {
      primary: '',
      secondary: '',
      tertiary: '',
      quarternary: '',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'primary',
  },
});

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  variant,
  color,
  style,
  ...props
}: React.ComponentPropsWithoutRef<typeof RNText> & VariantProps<typeof textVariants>) {
  const textClassName = React.useContext(TextClassContext);
  const { colors } = useColorScheme();
  
  // Get the appropriate color based on the color variant
  const getColor = () => {
    switch (color) {
      case 'secondary':
        return colors.secondaryForeground;
      case 'tertiary':
        return colors.mutedForeground;
      case 'quarternary':
        return colors.mutedForeground;
      default:
        return colors.foreground;
    }
  };

  return (
    <RNText 
      className={cn(textVariants({ variant, color }), textClassName, className)} 
      style={[{ color: getColor() }, style]}
      {...props} 
    />
  );
}

export { Text, TextClassContext, textVariants };

