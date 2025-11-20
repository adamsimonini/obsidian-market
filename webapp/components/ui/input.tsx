import { TextInput, TextInputProps } from 'react-native';
import { cn } from '@/lib/cn';
import { useColorScheme } from '@/lib/useColorScheme';

export interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  const { colors } = useColorScheme();
  // Use muted-foreground color for placeholder
  const placeholderColor = colors.mutedForeground;
  
  return (
    <TextInput
      className={cn(
        'h-10 rounded-md border border-border bg-card px-3 py-2 text-foreground',
        'placeholder:text-muted-foreground',
        'focus:border-primary focus:outline-none',
        className
      )}
      placeholderTextColor={placeholderColor}
      {...props}
    />
  );
}

