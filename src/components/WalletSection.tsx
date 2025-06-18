import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FC } from 'react';

interface WalletSectionProps {
  isLoading: boolean;
}

export const WalletSection: FC<WalletSectionProps> = ({ isLoading }) => {
  const { publicKey } = useWallet();
  
  return (
    <div className="mb-6">
      {publicKey ? (
        <div className="flex items-center justify-between bg-green-900/20 border border-green-500/30 rounded-md p-3">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-300 font-medium">Connected: {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}</span>
          </div>
          <button 
            className="text-sm text-red-400 hover:text-red-300 transition"
            onClick={() => window.solana?.disconnect()}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-md p-3">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-gray-300 font-medium">Wallet not connected</span>
          </div>
          <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition duration-200 px-4 py-2" />
        </div>
      )}
    </div>
  );
}; 