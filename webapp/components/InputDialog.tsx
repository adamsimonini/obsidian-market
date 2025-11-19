import { useState, useCallback } from 'react';
import { Modal } from 'react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';

interface InputDialogProps {
  title: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function InputDialog({
  title,
  placeholder = '',
  onConfirm,
  onCancel,
}: InputDialogProps) {
  const [value, setValue] = useState('');

  const handleConfirm = useCallback(() => {
    if (value.trim()) {
      onConfirm(value.trim());
    }
  }, [value, onConfirm]);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <YStack
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.7)"
        justifyContent="center"
        alignItems="center"
      >
        <YStack
          backgroundColor="$backgroundHover"
          padding="$6"
          borderRadius="$2"
          minWidth={300}
          maxWidth="90%"
          borderWidth={1}
          borderColor="$borderColor"
          gap="$4"
        >
          <Text fontSize="$6" fontWeight="bold" color="$color">
            {title}
          </Text>
          <Input
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            backgroundColor="$background"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$placeholderColor"
            autoFocus
          />
          <XStack gap="$3" justifyContent="flex-end">
            <Button
              onPress={onCancel}
              backgroundColor="$placeholderColor"
              color="white"
              paddingVertical="$2"
              paddingHorizontal="$4"
              borderRadius="$1"
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="white">Cancel</Text>
            </Button>
            <Button
              onPress={handleConfirm}
              backgroundColor="$green10"
              color="white"
              fontWeight="bold"
              paddingVertical="$2"
              paddingHorizontal="$4"
              borderRadius="$1"
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="white" fontWeight="bold">
                Confirm
              </Text>
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}


