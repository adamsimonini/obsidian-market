import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from '@lynx-js/react';
import {
  WalletProvider as OfficialWalletProvider,
  useWallet as useOfficialWallet,
} from '@demox-labs/aleo-wallet-adapter-react';
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo';
import {
  DecryptPermission,
  WalletAdapterNetwork,
  type WalletName,
} from '@demox-labs/aleo-wallet-adapter-base';
import { InputDialog } from '../components/InputDialog';

// Note: Polyfills are now in index.tsx to ensure they run before adapter initialization

// Wrapper interface that matches our existing API
interface WalletContextType {
  address: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string | null>;
  signTransaction: (transaction: unknown) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Internal component that uses the official adapter
function WalletProviderInner({ children }: { children: React.ReactNode }) {
  const { wallet, publicKey, select, disconnect: officialDisconnect } =
    useOfficialWallet();
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // Sync publicKey to address
  useEffect(() => {
    if (publicKey) {
      setAddress(publicKey);
      setConnected(true);
      localStorage.setItem('aleo_wallet_address', publicKey);
    } else {
      setAddress(null);
      setConnected(false);
      localStorage.removeItem('aleo_wallet_address');
    }
  }, [publicKey]);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem('aleo_wallet_address');
    if (storedAddress && !publicKey) {
      // Address stored but not connected - try to reconnect
      // The official adapter handles auto-connect, so this is just for UI state
      setAddress(storedAddress);
      setConnected(true);
    }
  }, [publicKey]);

  const connect = useCallback(async () => {
    try {
      // Use select() to choose the wallet, which will trigger connection
      // The adapter name for Leo Wallet is typically "Leo"
      if (select) {
        // Get the wallet name from the adapter if available, otherwise use "Leo"
        const walletName = (wallet?.adapter?.name || 'Leo') as WalletName;
        await select(walletName);
      } else {
        // Fallback: if select is not available, the adapter should auto-connect
        // This might happen if autoConnect is enabled
        throw new Error('Wallet selection not available. Please ensure Leo Wallet is installed.');
      }
      // Address will be set via useEffect when publicKey updates
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }, [select, wallet]);

  const disconnect = useCallback(() => {
    officialDisconnect();
    setAddress(null);
    setConnected(false);
    localStorage.removeItem('aleo_wallet_address');
  }, [officialDisconnect]);

  const signMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!connected || !publicKey || !wallet) {
        throw new Error('Wallet not connected');
      }

      try {
        const adapter = wallet.adapter as LeoWalletAdapter;
        
        if (typeof adapter.signMessage !== 'function') {
          throw new Error('Wallet does not support message signing');
        }

        const bytes = new TextEncoder().encode(message);
        const signatureBytes = await adapter.signMessage(bytes);
        const signature = new TextDecoder().decode(signatureBytes);
        return signature;
      } catch (error) {
        console.error('Message signing error:', error);
        throw error;
      }
    },
    [connected, publicKey, wallet],
  );

  const signTransaction = useCallback(
    async (transaction: unknown): Promise<string | null> => {
      if (!connected || !publicKey || !wallet) {
        throw new Error('Wallet not connected');
      }

      try {
        // The official adapter uses requestTransaction, not signTransaction
        // For now, we'll throw an error and implement this when we need actual transactions
        throw new Error(
          'Transaction signing should use requestTransaction() from useWallet hook. This method is deprecated.',
        );
      } catch (error) {
        console.error('Transaction signing error:', error);
        throw error;
      }
    },
    [connected, publicKey, wallet],
  );

  return (
    <WalletContext.Provider
      value={{
        address,
        connected,
        connect,
        disconnect,
        signMessage,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// Main provider that wraps the official adapter
export function WalletProvider({ children }: { children: React.ReactNode }) {
  // Check if we're in a browser environment
  // Check for actual browser APIs, not just polyfilled ones
  const isBrowser =
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    // Check if it's actually a browser, not just Lynx web runtime
    (window.navigator?.userAgent?.includes('Chrome') ||
      window.navigator?.userAgent?.includes('Firefox') ||
      window.navigator?.userAgent?.includes('Safari') ||
      // Also allow if we're in web preview (Lynx web bundle)
      window.location?.href?.includes('__web_preview'));

  const wallets = useMemo(() => {
    try {
      // Try to create the adapter - if it fails, we'll use fallback
      return [
        new LeoWalletAdapter({
          appName: 'Obsidian Market',
        }),
      ];
    } catch (error) {
      console.warn('Failed to create wallet adapter, using fallback:', error);
      return [];
    }
  }, []);

  // Try to use official adapter, fallback if it fails
  try {
    return (
      <OfficialWalletProvider
        wallets={wallets}
        decryptPermission={DecryptPermission.UponRequest}
        network={WalletAdapterNetwork.Testnet} // Change to Localnet for local dev
        autoConnect={true}
      >
        <WalletProviderInner>{children}</WalletProviderInner>
      </OfficialWalletProvider>
    );
  } catch (error) {
    console.warn('Official wallet provider failed, using fallback:', error);
    return <WalletProviderFallback>{children}</WalletProviderFallback>;
  }
}

// Fallback provider for non-browser environments (Lynx mobile)
function WalletProviderFallback({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [showInputDialog, setShowInputDialog] = useState(false);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem('aleo_wallet_address');
    if (storedAddress) {
      setAddress(storedAddress);
      setConnected(true);
    }
  }, []);

  const handleAddressConfirm = useCallback((manualAddress: string) => {
    if (manualAddress && manualAddress.trim()) {
      setAddress(manualAddress.trim());
      setConnected(true);
      localStorage.setItem('aleo_wallet_address', manualAddress.trim());
      setShowInputDialog(false);
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      // For mobile/Lynx, show input dialog for manual address entry
      // In the future, this could use deep linking or QR codes
      setShowInputDialog(true);
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setConnected(false);
    localStorage.removeItem('aleo_wallet_address');
  }, []);

  const signMessage = useCallback(
    async (message: string): Promise<string | null> => {
      throw new Error(
        'Message signing on mobile not yet implemented. Use web version for full functionality.',
      );
    },
    [],
  );

  const signTransaction = useCallback(
    async (transaction: unknown): Promise<string | null> => {
      throw new Error(
        'Transaction signing on mobile not yet implemented. Use web version for full functionality.',
      );
    },
    [],
  );

  return (
    <WalletContext.Provider
      value={{
        address,
        connected,
        connect,
        disconnect,
        signMessage,
        signTransaction,
      }}
    >
      {children}
      {showInputDialog && (
        <InputDialog
          title="Enter your Aleo wallet address"
          placeholder="aleo1..."
          onConfirm={handleAddressConfirm}
          onCancel={() => setShowInputDialog(false)}
        />
      )}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
