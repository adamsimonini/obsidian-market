'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  AleoWalletProvider,
  useWallet as useProvableWallet,
} from '@provablehq/aleo-wallet-adaptor-react';
import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo';
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core';
import { Network } from '@provablehq/aleo-types';

interface WalletContextType {
  address: string | null;
  connected: boolean;
  network: 'testnet' | 'mainnet';
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function WalletProviderInner({ children }: { children: ReactNode }) {
  const provable = useProvableWallet();

  const connect = useCallback(async () => {
    // Already connected (e.g. autoConnect finished) — nothing to do
    if (provable.connected) return;

    try {
      // If a wallet is already selected, connect directly
      if (provable.wallet) {
        await provable.connect(Network.TESTNET);
        return;
      }

      // No wallet selected — pick Leo Wallet, wait for adapter, then connect
      provable.selectWallet('Leo Wallet' as never);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await provable.connect(Network.TESTNET);
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }, [provable]);

  const disconnect = useCallback(() => {
    provable.disconnect();
  }, [provable]);

  const signMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!provable.connected || !provable.address) {
        throw new Error('Wallet not connected');
      }
      const bytes = new TextEncoder().encode(message);
      const signatureBytes = await provable.signMessage(bytes);
      if (!signatureBytes) return null;
      return new TextDecoder().decode(signatureBytes);
    },
    [provable],
  );

  return (
    <WalletContext.Provider
      value={{
        address: provable.address,
        connected: provable.connected,
        network: 'testnet',
        connect,
        disconnect,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => {
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
  }, []);

  return (
    <AleoWalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={Network.TESTNET}
      autoConnect
    >
      <WalletProviderInner>{children}</WalletProviderInner>
    </AleoWalletProvider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
