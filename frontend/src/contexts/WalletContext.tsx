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
  connecting: boolean;
  disconnecting: boolean;
  network: 'testnet' | 'mainnet';
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function WalletProviderInner({ children }: { children: ReactNode }) {
  const provable = useProvableWallet();

  const connect = useCallback(async () => {
    if (provable.connected || provable.connecting || provable.disconnecting) return;

    try {
      // Always select the wallet to ensure it's ready
      provable.selectWallet('Leo Wallet' as never);

      // Wait for wallet to be selected (poll with timeout)
      let retries = 30;
      while (!provable.wallet && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        retries--;
      }

      if (!provable.wallet) {
        throw new Error('Wallet selection failed - Leo Wallet not found');
      }

      await provable.connect(Network.TESTNET);
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }, [provable]);

  const disconnect = useCallback(async () => {
    await provable.disconnect();
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
        connecting: provable.connecting,
        disconnecting: provable.disconnecting,
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
