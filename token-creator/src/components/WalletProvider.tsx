'use client';

import { FC, ReactNode, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import the wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Dynamically import the WalletModalProvider to prevent hydration errors
const WalletModalProvider = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletModalProvider),
  { ssr: false }
);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  // Get the network from environment variable or default to devnet
  const networkFromEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
  
  // Map the string to WalletAdapterNetwork enum
  const getNetwork = (networkString: string): WalletAdapterNetwork => {
    switch (networkString.toLowerCase()) {
      case 'mainnet-beta':
        return WalletAdapterNetwork.Mainnet;
      case 'testnet':
        return WalletAdapterNetwork.Testnet;
      case 'devnet':
      default:
        return WalletAdapterNetwork.Devnet;
    }
  };
  
  const network = getNetwork(networkFromEnv);

  // You can also provide a custom RPC endpoint from env vars if available
  const getEndpoint = () => {
    // Check for custom RPC URL based on selected network
    if (network === WalletAdapterNetwork.Mainnet && process.env.NEXT_PUBLIC_MAINNET_RPC_URL) {
      return process.env.NEXT_PUBLIC_MAINNET_RPC_URL;
    }
    if (network === WalletAdapterNetwork.Testnet && process.env.NEXT_PUBLIC_TESTNET_RPC_URL) {
      return process.env.NEXT_PUBLIC_TESTNET_RPC_URL;
    }
    if (network === WalletAdapterNetwork.Devnet && process.env.NEXT_PUBLIC_DEVNET_RPC_URL) {
      return process.env.NEXT_PUBLIC_DEVNET_RPC_URL;
    }
    
    // Default to standard endpoints
    return clusterApiUrl(network);
  };
  
  const endpoint = useMemo(() => getEndpoint(), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
  // and lazy loading -- only the wallets you configure here will be compiled into your
  // application, and only the dependencies of wallets that your users connect to will be
  // loaded
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider 
        wallets={wallets} 
        autoConnect={false} 
        onError={(error) => {
          console.error('Wallet error:', error);
        }}
      >
        <WalletModalProvider>
          <div suppressHydrationWarning>
            {typeof window !== 'undefined' && children}
          </div>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}; 