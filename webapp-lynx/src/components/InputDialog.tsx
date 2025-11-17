import { useState, useCallback } from '@lynx-js/react';

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
    <view
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <view
        style={{
          backgroundColor: '#1a1a1a',
          padding: '24px',
          borderRadius: '8px',
          minWidth: '300px',
          maxWidth: '90%',
          border: '1px solid #333',
        }}
      >
        <text
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '16px',
            display: 'block',
            color: 'white',
          }}
        >
          {title}
        </text>
        <input
          key={`input-${value}`}
          type="text"
          bindinput={(e: any) => {
            const val = e.detail?.value || e.target?.value || '';
            setValue(val);
          }}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: '#0a0a0a',
            border: '1px solid #333',
            color: 'white',
            marginBottom: '16px',
          }}
        />
        <view style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <view
            bindtap={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#666',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <text style={{ color: 'white' }}>Cancel</text>
          </view>
          <view
            bindtap={handleConfirm}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <text style={{ color: 'white', fontWeight: 'bold' }}>Confirm</text>
          </view>
        </view>
      </view>
    </view>
  );
}

