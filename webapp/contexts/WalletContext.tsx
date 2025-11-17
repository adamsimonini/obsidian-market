import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert, TextInput } from 'react-native';
import { InputDialog } from '../components/InputDialog';

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
function WalletProviderInner({ children }: { children: ReactNode }) {
  const { wallet, publicKey, select, disconnect: officialDisconnect } =
    useOfficialWallet();
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // Sync publicKey to address
  useEffect(() => {
    if (publicKey) {
      setAddress(publicKey);
      setConnected(true);
      AsyncStorage.setItem('aleo_wallet_address', publicKey);
    } else {
      setAddress(null);
      setConnected(false);
      AsyncStorage.removeItem('aleo_wallet_address');
    }
  }, [publicKey]);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const loadStoredAddress = async () => {
      const storedAddress = await AsyncStorage.getItem('aleo_wallet_address');
      if (storedAddress && !publicKey) {
        setAddress(storedAddress);
        setConnected(true);
      }
    };
    loadStoredAddress();
  }, [publicKey]);

  const connect = useCallback(async () => {
    try {
      if (select) {
        const walletName = (wallet?.adapter?.name || 'Leo') as WalletName;
        await select(walletName);
      } else {
        throw new Error('Wallet selection not available. Please ensure Leo Wallet is installed.');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }, [select, wallet]);

  const disconnect = useCallback(() => {
    officialDisconnect();
    setAddress(null);
    setConnected(false);
    AsyncStorage.removeItem('aleo_wallet_address');
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

      throw new Error(
        'Transaction signing should use requestTransaction() from useWallet hook. This method is deprecated.',
      );
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

// Fallback provider for mobile/non-browser environments
function WalletProviderFallback({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [showInputDialog, setShowInputDialog] = useState(false);

  useEffect(() => {
    const loadStoredAddress = async () => {
      const storedAddress = await AsyncStorage.getItem('aleo_wallet_address');
      if (storedAddress) {
        setAddress(storedAddress);
        setConnected(true);
      }
    };
    loadStoredAddress();
  }, []);

  const handleAddressConfirm = useCallback((manualAddress: string) => {
    if (manualAddress && manualAddress.trim()) {
      setAddress(manualAddress.trim());
      setConnected(true);
      AsyncStorage.setItem('aleo_wallet_address', manualAddress.trim());
      setShowInputDialog(false);
    }
  }, []);

  const connect = useCallback(async () => {
    setShowInputDialog(true);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setConnected(false);
    AsyncStorage.removeItem('aleo_wallet_address');
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

// Main provider that wraps the official adapter
export function WalletProvider({ children }: { children: ReactNode }) {
  // On web, try to use official adapter; on mobile, use fallback
  const isWeb = Platform.OS === 'web';

  const wallets = useMemo(() => {
    if (!isWeb) return [];
    try {
      return [
        new LeoWalletAdapter({
          appName: 'Obsidian Market',
        }),
      ];
    } catch (error) {
      console.warn('Failed to create wallet adapter:', error);
      return [];
    }
  }, [isWeb]);

  if (!isWeb || wallets.length === 0) {
    return <WalletProviderFallback>{children}</WalletProviderFallback>;
  }

  return (
    <OfficialWalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={WalletAdapterNetwork.Testnet}
      autoConnect={true}
    >
      <WalletProviderInner>{children}</WalletProviderInner>
    </OfficialWalletProvider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

