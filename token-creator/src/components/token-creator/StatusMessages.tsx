'use client';

import React from 'react';

interface StatusMessagesProps {
  error: string | null;
  success: string | null;
  transactionStatus: string | null;
}

export const StatusMessages: React.FC<StatusMessagesProps> = ({ 
  error,
  success, 
  transactionStatus
}) => {
  return (
    <>
      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-900/40 to-red-800/30 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg mb-6 backdrop-blur-sm shadow-lg animate-fade-in">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              {error}
              {error.toString().includes("403") && (
                <div className="mt-4 pt-3 border-t border-red-500/50">
                  <p className="font-medium">⚠️ Rate Limit Error - Missing Custom RPC URL</p>
                  <p className="mt-2">Please create an <code className="bg-red-800/50 px-2 py-1 rounded">env-config.js</code> file in the project root with:</p>
                  <pre className="bg-red-800/30 p-3 mt-2 rounded-md overflow-x-auto">
                    NEXT_PUBLIC_MAINNET_RPC_URL=https://your-rpc-endpoint
                  </pre>
                  <p className="mt-2 text-sm">
                    You can get free RPC endpoints from <a href="https://helius.dev" className="underline hover:text-red-100 transition">Helius</a> or <a href="https://quicknode.com" className="underline hover:text-red-100 transition">QuickNode</a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Transaction Status */}
      {transactionStatus && !success && !error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/40 to-blue-800/20 border border-blue-500/50 text-blue-200 rounded-lg shadow-lg backdrop-blur-sm animate-pulse">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent mr-3"></div>
            <div className="font-medium">{transactionStatus}</div>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="mt-6 mb-6 p-5 bg-gradient-to-r from-green-900/30 to-green-800/20 border border-green-600/50 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-green-400 mb-2">Success!</h3>
              {success.split('\n').map((line, i) => (
                <p key={i} className="text-green-300 mb-1">
                  {line}
                </p>
              ))}
              
              <div className="mt-4">
                <p className="font-medium text-green-300">What's next?</p>
                <ul className="list-disc pl-5 mt-2 text-green-300">
                  <li>Your tokens have been minted to your connected wallet</li>
                  <li>You can view them in your Phantom wallet (you may need to add the token)</li>
                  <li>To add the token to Phantom, copy the Token Contract address above and import it</li>
                  <li>In Phantom wallet, click "Tokens" tab, then "+" button, and paste the token address</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusMessages; 