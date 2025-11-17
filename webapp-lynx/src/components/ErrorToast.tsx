import { useEffect } from '@lynx-js/react';

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
    <view
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#f44336',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        zIndex: 1001,
        maxWidth: '400px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      }}
      bindtap={onClose}
    >
      <text style={{ color: 'white', fontWeight: 'bold' }}>{message}</text>
    </view>
  );
}

