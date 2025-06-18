'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Keypair } from '@solana/web3.js';
import { getExampleMiddle, calculateDifficulty } from '../../utils/token/vanityUtils';

interface VanityAddressGeneratorProps {
  prefix: string;
  suffix: string;
  isCaseSensitive: boolean;
  threadCount: number;
  isVanityRunning: boolean;
  generatedCount: number;
  processedAddresses: number;
  estimatedTime: number;
  speed: number;
  progress: number;
  generatedAddress: string | null;
  vanityKeypair: Keypair | null;
  suffixError: string;
  setPrefix: (prefix: string) => void;
  setSuffix: (suffix: string) => void;
  setIsCaseSensitive: (isCaseSensitive: boolean) => void;
  setThreadCount: (threadCount: number) => void;
  setSuffixError: (error: string) => void;
  toggleVanityGeneration: () => void;
}

export const VanityAddressGenerator: React.FC<VanityAddressGeneratorProps> = ({
  prefix,
  suffix,
  isCaseSensitive,
  threadCount,
  isVanityRunning,
  generatedCount,
  processedAddresses,
  estimatedTime,
  speed,
  progress,
  generatedAddress,
  vanityKeypair,
  suffixError,
  setPrefix,
  setSuffix,
  setIsCaseSensitive,
  setThreadCount,
  setSuffixError,
  toggleVanityGeneration
}) => {
  const [difficulty, setDifficulty] = useState('0');

  // Calculate difficulty based on prefix and suffix
  useEffect(() => {
    setDifficulty(calculateDifficulty(prefix, suffix));
  }, [prefix, suffix]);

  // Handle prefix input validation
  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length + suffix.length > 44) {
      setSuffixError('Combined prefix and suffix length cannot exceed 44 characters');
    } else {
      setPrefix(value);
      setSuffixError('');
    }
  };

  // Handle suffix input validation
  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (prefix.length + value.length > 44) {
      setSuffixError('Combined prefix and suffix length cannot exceed 44 characters');
    } else {
      setSuffix(value);
      setSuffixError('');
    }
  };

  // Update thread count
  const increaseThreads = () => {
    if (threadCount < 16) {
      setThreadCount(threadCount + 1);
    }
  };

  const decreaseThreads = () => {
    if (threadCount > 1) {
      setThreadCount(threadCount - 1);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900/60 to-gray-900/80 rounded-xl border border-purple-800/30 p-6 shadow-xl">
      <h3 className="text-xl font-semibold mb-6 text-purple-300">Vanity Token Address</h3>
      
      <div className="mb-5">
        <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border-l-4 border-amber-500/50 text-amber-200/90 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-amber-500 font-bold">⚠</span>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm mb-2 break-words">
                <strong>Vanity Token Address:</strong> Create a token with a custom pattern in its address.
              </p>
              <p className="text-sm mb-1">Examples:</p>
              <ul className="list-disc pl-5 mb-2 text-sm">
                <li className="break-words">A token ending with "pump" (like the "Pump Fun" token)</li>
                <li className="break-words">A token starting with your name or brand</li>
                <li className="break-words">A token containing specific characters</li>
              </ul>
              <p className="text-sm break-words">
                <strong>Tips:</strong> Keep patterns under 4 characters for reasonable generation times.
                Longer patterns (5+ chars) can take hours or days to generate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prefix Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Prefix (start of address)</label>
        <input
          type="text"
          value={prefix}
          onChange={handlePrefixChange}
          disabled={isVanityRunning}
          className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
          placeholder="Optional prefix"
        />
      </div>

      {/* Suffix Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Suffix (end of address)</label>
        <input
          type="text"
          value={suffix}
          onChange={handleSuffixChange}
          disabled={isVanityRunning}
          className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
          placeholder="Optional suffix"
        />
        {suffixError && (
          <p className="text-xs text-red-400 mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {suffixError}
          </p>
        )}
      </div>

      <div className="mb-5 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400 mb-2 break-all">
          Example: <span className="text-purple-400 font-medium">{prefix || "[prefix]"}</span><span className="text-gray-500">{getExampleMiddle(prefix, suffix)}</span><span className="text-purple-400 font-medium">{suffix || "[suffix]"}</span>
        </p>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">Difficulty: {difficulty !== '0' && difficulty}</p>
          {Number(difficulty) > 1e6 && (
            <span className="text-xs text-amber-400">High complexity - may take time</span>
          )}
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="case-sensitive"
            checked={isCaseSensitive}
            onChange={() => setIsCaseSensitive(!isCaseSensitive)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 bg-gray-800 border-gray-600 rounded"
            disabled={isVanityRunning}
          />
          <label htmlFor="case-sensitive" className="ml-2 text-gray-300 text-sm">
            Case Sensitive
            <span className="ml-1 text-xs text-gray-400">(unchecked = faster)</span>
          </label>
          <div className="ml-2 group relative">
            <span className="cursor-help text-gray-400">ⓘ</span>
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-xs text-gray-200 p-2 rounded w-52 shadow-lg z-10">
              Case sensitive means "Pump" and "pump" are different. Turn off for faster generation.
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">Threads</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={decreaseThreads}
              disabled={threadCount <= 1 || isVanityRunning}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-8 text-center">{threadCount}</span>
            <button
              onClick={increaseThreads}
              disabled={threadCount >= 16 || isVanityRunning}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>
        
        {isVanityRunning && (
          <div className="text-xs text-gray-400 mt-1">
            {threadCount} active thread{threadCount !== 1 ? 's' : ''} - more threads = faster generation
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {(isVanityRunning || progress > 0) && (
        <div className="mb-5 bg-gray-800/70 p-3 rounded-lg border border-gray-700">
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <div>Addresses: {processedAddresses.toLocaleString()}</div>
            <div>{generatedCount} found</div>
          </div>
          {isVanityRunning && (
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <div>{speed.toLocaleString()} addr/s</div>
              <div>~{estimatedTime > 60 ? `${Math.floor(estimatedTime / 60)}m ${estimatedTime % 60}s` : `${estimatedTime}s`} remaining</div>
            </div>
          )}
        </div>
      )}

      {/* Generated Address Display */}
      {generatedAddress && (
        <div className="mb-5 p-4 bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-500/30 rounded-lg">
          <label className="block text-xs font-medium text-gray-400 mb-1">Generated Address</label>
          <div className="text-sm text-purple-300 font-mono break-all">{generatedAddress}</div>
        </div>
      )}

      {/* Generate Button */}
      <div className="mt-8">
        {!isVanityRunning ? (
          <button
            onClick={toggleVanityGeneration}
            disabled={(prefix.length === 0 && suffix.length === 0)}
            className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg ${
              (prefix.length === 0 && suffix.length === 0)
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-lg'
            } transition-all duration-200`}
          >
            {generatedAddress ? 'Generate New Address' : 'Generate Vanity Address'}
          </button>
        ) : (
          <button
            onClick={toggleVanityGeneration}
            className="w-full py-4 px-6 rounded-lg text-white font-semibold text-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all duration-200 shadow-lg"
          >
            Stop Generation
          </button>
        )}
      </div>
      
      {!isVanityRunning && !generatedAddress && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Enter a prefix and/or suffix and click Generate
        </p>
      )}
    </div>
  );
};

export default VanityAddressGenerator; 