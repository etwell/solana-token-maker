'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletSectionProps {
  className?: string;
}

export const WalletSection: React.FC<WalletSectionProps> = ({ className = '' }) => {
  const { publicKey, disconnect } = useWallet();

  return (
    <div className={`mb-6 ${className}`}>
      {publicKey ? (
        <div className="flex items-center justify-between bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-green-300 font-medium">
              Connected: {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
            </span>
          </div>
          <button 
            onClick={() => disconnect()}
            className="text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 px-3 py-1 rounded-md transition duration-200"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-gray-800/40 border border-gray-700 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-gray-500 rounded-full mr-3"></div>
            <span className="text-gray-300 font-medium">Wallet not connected</span>
          </div>
          <WalletMultiButton className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium rounded-lg transition duration-200 px-4 py-2 shadow-lg" />
        </div>
      )}
    </div>
  );
};

export default WalletSection; 