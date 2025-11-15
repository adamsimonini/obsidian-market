import { createContext, useContext, useState, useCallback, useEffect } from '@lynx-js/react'

interface WalletContextType {
  address: string | null
  connected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signMessage: (message: string) => Promise<string | null>
  signTransaction: (transaction: unknown) => Promise<string | null>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  // Check for existing wallet connection on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem('aleo_wallet_address')
    if (storedAddress) {
      setAddress(storedAddress)
      setConnected(true)
    }
  }, [])

  const connect = useCallback(async () => {
    try {
      // Check if Leo Wallet is installed
      if (typeof window === 'undefined' || !(window as any).leoWallet) {
        throw new Error('Leo Wallet not found. Please install Leo Wallet extension.')
      }

      // Request wallet connection
      const wallet = (window as any).leoWallet
      const response = await wallet.connect()

      if (response && response.address) {
        setAddress(response.address)
        setConnected(true)
        localStorage.setItem('aleo_wallet_address', response.address)
      } else {
        throw new Error('Failed to connect wallet')
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      throw error
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setConnected(false)
    localStorage.removeItem('aleo_wallet_address')
  }, [])

  const signMessage = useCallback(
    async (message: string): Promise<string | null> => {
      if (!connected || !address) {
        throw new Error('Wallet not connected')
      }

      try {
        const wallet = (window as any).leoWallet
        const signature = await wallet.signMessage(message)
        return signature
      } catch (error) {
        console.error('Message signing error:', error)
        return null
      }
    },
    [connected, address],
  )

  const signTransaction = useCallback(
    async (transaction: unknown): Promise<string | null> => {
      if (!connected || !address) {
        throw new Error('Wallet not connected')
      }

      try {
        const wallet = (window as any).leoWallet
        const signedTx = await wallet.signTransaction(transaction)
        return signedTx
      } catch (error) {
        console.error('Transaction signing error:', error)
        return null
      }
    },
    [connected, address],
  )

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
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

