'use client';

import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';

interface TokenDetailsFormProps {
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenSupply: string;
  tokenDescription: string;
  showSocialLinks: boolean;
  revokeUpdate: boolean;
  revokeFreeze: boolean;
  revokeMint: boolean;
  website: string;
  twitter: string;
  discord: string;
  telegram: string;
  useDirectUrl: boolean;
  directUrl: string;
  useCustomCreatedOn: boolean;
  customCreatedOn: string;
  metadataUrl: string;
  isLoading: boolean;
  publicKey: PublicKey | null;
  setTokenName: (name: string) => void;
  setTokenSymbol: (symbol: string) => void;
  setTokenDecimals: (decimals: number) => void;
  setTokenSupply: (supply: string) => void;
  setTokenDescription: (description: string) => void;
  setShowSocialLinks: (show: boolean) => void;
  setRevokeUpdate: (revoke: boolean) => void;
  setRevokeFreeze: (revoke: boolean) => void;
  setRevokeMint: (revoke: boolean) => void;
  setWebsite: (website: string) => void;
  setTwitter: (twitter: string) => void;
  setDiscord: (discord: string) => void;
  setTelegram: (telegram: string) => void;
  setDirectUrl: (url: string) => void;
  setUseDirectUrl: (use: boolean) => void;
  setCustomCreatedOn: (date: string) => void;
  setUseCustomCreatedOn: (use: boolean) => void;
  createToken: () => void;
  isPremiumEnabled: boolean;
  vanityKeypair: any | null;
}

export const TokenDetailsForm: React.FC<TokenDetailsFormProps> = ({
  tokenName,
  tokenSymbol,
  tokenDecimals,
  tokenSupply,
  tokenDescription,
  showSocialLinks,
  revokeUpdate,
  revokeFreeze,
  revokeMint,
  website,
  twitter,
  discord,
  telegram,
  useDirectUrl,
  directUrl,
  useCustomCreatedOn,
  customCreatedOn,
  metadataUrl,
  isLoading,
  publicKey,
  setTokenName,
  setTokenSymbol,
  setTokenDecimals,
  setTokenSupply,
  setTokenDescription,
  setShowSocialLinks,
  setRevokeUpdate,
  setRevokeFreeze,
  setRevokeMint,
  setWebsite,
  setTwitter,
  setDiscord,
  setTelegram,
  setDirectUrl,
  setUseDirectUrl,
  setCustomCreatedOn,
  setUseCustomCreatedOn,
  createToken,
  isPremiumEnabled,
  vanityKeypair
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-900/60 to-gray-800/40 rounded-xl border border-gray-700/50 p-6 shadow-xl">
      <h3 className="text-xl font-semibold mb-6 text-white">Token Details</h3>
      
      {/* Token Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Token Name *</label>
        <input
          type="text"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
          placeholder="My Awesome Token"
        />
      </div>
      
      {/* Token Symbol */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol *</label>
        <input
          type="text"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
          placeholder="AWESOME"
          maxLength={10}
        />
        <p className="text-xs text-gray-400 mt-2">Max 10 characters</p>
      </div>
      
      {/* Token Decimals */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Decimals *</label>
        <input
          type="number"
          value={tokenDecimals}
          onChange={(e) => setTokenDecimals(parseInt(e.target.value) || 0)}
          min={0}
          max={9}
          className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
        />
        <p className="text-xs text-gray-400 mt-2">How many decimal places your token will have (0-9)</p>
      </div>
      
      {/* Initial Supply */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Initial Supply *</label>
        <input
          type="text"
          value={tokenSupply}
          onChange={(e) => setTokenSupply(e.target.value.replace(/[^0-9.]/g, ''))}
          className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
          placeholder="1000000"
        />
      </div>
      
      {/* Direct URL Input */}
      <div className="mb-6 border border-gray-700 rounded-lg p-4 bg-gray-800/40 backdrop-blur-sm">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="use-direct-url"
            checked={useDirectUrl}
            onChange={() => setUseDirectUrl(!useDirectUrl)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-gray-800 border-gray-600 rounded"
          />
          <label htmlFor="use-direct-url" className="ml-2 text-sm font-medium text-gray-300">
            Use Direct Metadata URL
          </label>
        </div>
        
        <p className="text-xs text-gray-400 mb-2">
          If you already have a metadata JSON file hosted somewhere, you can use its URL directly.
        </p>
        
        {useDirectUrl && (
          <div>
            <input
              type="text"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="https://example.com/metadata.json"
              className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
            />
            <p className="mt-2 text-xs text-gray-400">
              Make sure your JSON follows the correct format with name, symbol, and other required fields.
            </p>
          </div>
        )}
      </div>
      
      {/* Only show metadata-related fields if not using direct URL */}
      {!useDirectUrl && (
        <>
          {/* Token Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Token Description</label>
            <textarea
              value={tokenDescription}
              onChange={(e) => setTokenDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
              placeholder="Describe your token's purpose and features"
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-2">This will be visible in wallets that support token metadata</p>
          </div>
          
          {/* Custom CreatedOn Field */}
          <div className="mb-6 border border-gray-700 rounded-lg p-4 bg-gray-800/40 backdrop-blur-sm">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="use-custom-created-on"
                checked={useCustomCreatedOn}
                onChange={() => setUseCustomCreatedOn(!useCustomCreatedOn)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-gray-800 border-gray-600 rounded"
              />
              <label htmlFor="use-custom-created-on" className="ml-2 text-sm font-medium text-gray-300">
                Custom "createdOn" Field
              </label>
            </div>
            
            <p className="text-xs text-gray-400 mb-2">
              By default, "createdOn" will be set to the current timestamp. You can customize it here (e.g., to a website URL).
            </p>
            
            {useCustomCreatedOn && (
              <div>
                <input
                  type="text"
                  value={customCreatedOn}
                  onChange={(e) => setCustomCreatedOn(e.target.value)}
                  placeholder="https://pump.fun"
                  className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Example: "https://pump.fun" or any other value you want to include
                </p>
              </div>
            )}
          </div>
          
          {/* Social Links */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Social Links</label>
              <button 
                type="button" 
                onClick={() => setShowSocialLinks(!showSocialLinks)}
                className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-900/30 px-3 py-1 rounded-md transition-colors"
              >
                {showSocialLinks ? 'Hide' : 'Show'} Links
              </button>
            </div>
            
            {showSocialLinks && (
              <div className="space-y-3 bg-gray-800/40 border border-gray-700 rounded-lg p-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Website</label>
                  <input
                    type="text"
                    value={website || ''}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Twitter</label>
                  <input
                    type="text"
                    value={twitter || ''}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Discord</label>
                  <input
                    type="text"
                    value={discord || ''}
                    onChange={(e) => setDiscord(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
                    placeholder="https://discord.gg/yourinvite"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Telegram</label>
                  <input
                    type="text"
                    value={telegram || ''}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-inner"
                    placeholder="https://t.me/yourgroup"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Token Permissions */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-300 mb-3">Token Permissions</h3>
        <div className="space-y-3 bg-gray-800/40 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="revoke-mint"
              checked={revokeMint}
              onChange={() => setRevokeMint(!revokeMint)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-gray-800 border-gray-600 rounded"
            />
            <label htmlFor="revoke-mint" className="ml-2 text-sm text-gray-300">
              Revoke Mint Authority (no one can mint more tokens)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="revoke-freeze"
              checked={revokeFreeze}
              onChange={() => setRevokeFreeze(!revokeFreeze)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-gray-800 border-gray-600 rounded"
            />
            <label htmlFor="revoke-freeze" className="ml-2 text-sm text-gray-300">
              Revoke Freeze Authority (no one can freeze token accounts)
            </label>
          </div>
        </div>
      </div>
      
      {/* Metadata URL */}
      {metadataUrl && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Token Metadata URL
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="text"
              value={metadataUrl}
              readOnly
              className="w-full px-4 py-3 bg-gray-800/60 text-gray-300 border border-gray-700 rounded-lg focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(metadataUrl);
                // We would normally provide user feedback here but to keep the component clean
                // and avoid state in child components, this is handled by the parent
              }}
              className="whitespace-nowrap px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
              title="Copy to clipboard"
            >
              Copy URL
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            This is the IPFS URL for your token's metadata
          </p>
        </div>
      )}
      
      {isPremiumEnabled && !vanityKeypair ? (
        <div className="mt-6">
          <button
            disabled={true}
            className="w-full py-4 px-6 rounded-lg text-white font-semibold bg-gray-600 cursor-not-allowed"
          >
            Generate Vanity Address First
          </button>
        </div>
      ) : (
        <div className="mt-8">
          <button
            onClick={createToken}
            disabled={isLoading || !publicKey}
            className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg ${
              !publicKey 
                ? 'bg-gray-600 cursor-not-allowed' 
                : isLoading 
                  ? 'bg-purple-700/50 cursor-wait' 
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg'
            } transition-all duration-200`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Creating Token...
              </div>
            ) : !publicKey ? (
              'Connect Wallet First'
            ) : (
              'Create Token on Solana'
            )}
          </button>
          
          <p className="text-sm text-gray-400 mt-3 text-center">
            This will create your token on the Solana network. 
            You'll need to approve the transaction in your Phantom wallet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TokenDetailsForm; 