'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AleoWalletProvider,
  useWallet as useProvableWallet,
} from '@provablehq/aleo-wallet-adaptor-react';
import { LeoWalletAdapter } from '@provablehq/aleo-wallet-adaptor-leo';
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core';
import { Network } from '@provablehq/aleo-types';
import type { TransactionOptions, TransactionStatusResponse } from '@provablehq/aleo-types';

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  network: 'testnet' | 'mainnet';
  connect: () => void;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  /** Execute a program transition via the wallet (Leo Wallet generates proof + broadcasts) */
  executeTransaction: (options: TransactionOptions) => Promise<string>;
  /** Check the status of a submitted transaction */
  transactionStatus: (transactionId: string) => Promise<TransactionStatusResponse>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function WalletProviderInner({ children }: { children: ReactNode }) {
  const provable = useProvableWallet();
  const [pendingConnect, setPendingConnect] = useState(false);

  // Step 1: User clicks "Connect" → select wallet name + flag pending
  const connect = useCallback(() => {
    if (provable.connected || provable.connecting || provable.disconnecting) return;
    provable.selectWallet('Leo Wallet' as never);
    setPendingConnect(true);
  }, [provable]);

  // Step 2: Once the adapter picks up the wallet (next render), call connect
  useEffect(() => {
    if (!pendingConnect) return;
    if (!provable.wallet) return; // adapter hasn't resolved yet, wait for next render
    if (provable.connected || provable.connecting) {
      setPendingConnect(false);
      return;
    }

    setPendingConnect(false);
    provable.connect(Network.TESTNET).catch((err) => {
      console.error('Wallet connection error:', err);
    });
  }, [pendingConnect, provable]);

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

  const executeTransaction = useCallback(
    async (options: TransactionOptions): Promise<string> => {
      if (!provable.connected || !provable.address) {
        throw new Error('Wallet not connected');
      }
      const result = await provable.executeTransaction(options);
      if (!result?.transactionId) {
        throw new Error('Transaction rejected or failed');
      }
      return result.transactionId;
    },
    [provable],
  );

  const transactionStatus = useCallback(
    async (transactionId: string): Promise<TransactionStatusResponse> => {
      if (!provable.connected) {
        throw new Error('Wallet not connected');
      }
      return await provable.transactionStatus(transactionId);
    },
    [provable],
  );

  return (
    <WalletContext.Provider
      value={{
        address: provable.address,
        connected: provable.connected,
        connecting: provable.connecting || pendingConnect,
        disconnecting: provable.disconnecting,
        network: 'testnet',
        connect,
        disconnect,
        signMessage,
        executeTransaction,
        transactionStatus,
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
