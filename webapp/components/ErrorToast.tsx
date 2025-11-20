import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/nativewindui/Text';

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
    <View style={styles.container}>
      <View style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    left: 20,
    zIndex: 1001,
    alignItems: 'flex-end',
  },
  toast: {
    backgroundColor: '#f44336',
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 400,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

