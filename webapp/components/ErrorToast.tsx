import { useEffect } from 'react';
import { Text, XStack, YStack } from 'tamagui';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function ErrorToast({
  message,
  onClose,
  duration = 3000,
}: ErrorToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <XStack
      position="absolute"
      top={60}
      right="$5"
      left="$5"
      zIndex={1001}
      alignItems="flex-end"
    >
      <YStack
        backgroundColor="$red10"
        padding="$3"
        paddingHorizontal="$6"
        borderRadius="$2"
        maxWidth={400}
        shadowColor="$color"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.3}
        shadowRadius={4}
        elevation={5}
      >
        <Text color="white" fontWeight="bold">
          {message}
        </Text>
      </YStack>
    </XStack>
  );
}

