import { TextInput, TextInputProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface InputProps extends TextInputProps {
  className?: string;
}

export function Input({ className, ...props }: InputProps) {
  return (
    <TextInput
      className={cn(
        'h-10 rounded-md border border-obsidian-border bg-obsidian-card px-3 py-2 text-obsidian-text',
        'placeholder:text-obsidian-text-muted',
        'focus:border-obsidian-green focus:outline-none',
        className
      )}
      placeholderTextColor="#666"
      {...props}
    />
  );
}

