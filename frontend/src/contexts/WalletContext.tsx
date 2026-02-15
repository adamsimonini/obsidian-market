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
import { ShieldWalletAdapter } from '@provablehq/aleo-wallet-adaptor-shield';
import { PuzzleWalletAdapter } from '@provablehq/aleo-wallet-adaptor-puzzle';
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core';
import { Network } from '@provablehq/aleo-types';
import type { TransactionOptions, TransactionStatusResponse } from '@provablehq/aleo-types';

/** Wallet option exposed to the UI */
export interface WalletOption {
  name: string;
}

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  network: 'testnet' | 'mainnet';
  /** Available wallet adapters the user can choose from */
  availableWallets: WalletOption[];
  /** Connect to a specific wallet by name */
  connect: (walletName: string) => void;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  /** Execute a program transition via the wallet (wallet generates proof + broadcasts) */
  executeTransaction: (options: TransactionOptions) => Promise<string>;
  /** Check the status of a submitted transaction */
  transactionStatus: (transactionId: string) => Promise<TransactionStatusResponse>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function WalletProviderInner({ children }: { children: ReactNode }) {
  const provable = useProvableWallet();
  const [pendingConnect, setPendingConnect] = useState(false);

  const availableWallets: WalletOption[] = useMemo(
    () => (provable.wallets ?? []).map((w) => ({ name: w.adapter.name })),
    [provable.wallets],
  );

  // Step 1: User picks a wallet → select by name + flag pending
  const connect = useCallback(
    (walletName: string) => {
      console.debug('[WalletContext] connect requested:', walletName, {
        connected: provable.connected,
        connecting: provable.connecting,
        disconnecting: provable.disconnecting,
        wallet: provable.wallet?.adapter.name,
        availableWallets: provable.wallets?.map((w) => w.adapter.name),
      });
      if (provable.connected || provable.connecting || provable.disconnecting) return;
      // @ts-expect-error - WalletName type is derived from registered wallets
      provable.selectWallet(walletName);
      setPendingConnect(true);
    },
    [provable],
  );

  // Step 2: Once the adapter picks up the wallet (next render), call connect
  useEffect(() => {
    if (!pendingConnect) return;
    if (!provable.wallet) return; // adapter hasn't resolved yet, wait for next render
    if (provable.connected || provable.connecting) {
      setPendingConnect(false);
      return;
    }

    console.debug('[WalletContext] triggering provable.connect for', provable.wallet?.adapter.name);
    setPendingConnect(false);
    // Network arg satisfies TS types but the provider internally uses its own
    // initialNetwork, decryptPermission, and programs props for the actual call
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
      console.debug('[WalletContext] executeTransaction payload:', JSON.stringify(options, null, 2));
      console.debug('[WalletContext] wallet adapter:', provable.wallet?.adapter.name);
      try {
        const result = await provable.executeTransaction(options);
        if (!result?.transactionId) {
          throw new Error('Transaction rejected or failed');
        }
        return result.transactionId;
      } catch (err) {
        console.error('[WalletContext] executeTransaction FAILED. Payload was:', options);
        throw err;
      }
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
        availableWallets,
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

const PROGRAMS = ['obsidian_market_v2.aleo', 'test_usdcx_stablecoin.aleo', 'credits.aleo'];

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => {
    try {
      return [
        new LeoWalletAdapter({ appName: 'Obsidian Market' }),
        new ShieldWalletAdapter(),
        // new PuzzleWalletAdapter({
        //   appName: 'Obsidian Market',
        //   appDescription: 'Privacy-focused prediction market built on Aleo',
        //   appIconUrl: '',
        // }),
      ];
    } catch (error) {
      console.warn('Failed to create wallet adapters:', error);
      return [];
    }
  }, []);

  return (
    <AleoWalletProvider
      wallets={wallets}
      decryptPermission={DecryptPermission.UponRequest}
      network={Network.TESTNET}
      programs={PROGRAMS}
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
