'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl, Keypair, PublicKey, Cluster } from '@solana/web3.js';

// Import components
import {
  WalletSection,
  StatusMessages,
  TokenDetailsForm,
  VanityAddressGenerator,
  ImageUploader
} from './token-creator';

// Import utils
import { uploadMetadataToIPFS } from '../utils/printaApi';
import { createToken } from '../utils/token/createTokenUtils';

export const TokenCreator = () => {
  // Solana network configuration from environment variables
  const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as Cluster;
  // Custom RPC URL configuration from environment variable
  const CUSTOM_RPC_URL = process.env.NEXT_PUBLIC_MAINNET_RPC_URL;
  
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;
  
  // Token creation fields
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDecimals, setTokenDecimals] = useState(6);
  const [tokenSupply, setTokenSupply] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [revokeUpdate, setRevokeUpdate] = useState(false);
  const [revokeFreeze, setRevokeFreeze] = useState(false);
  const [revokeMint, setRevokeMint] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Social links
  const [website, setWebsite] = useState<string>('');
  const [twitter, setTwitter] = useState<string>('');
  const [discord, setDiscord] = useState<string>('');
  const [telegram, setTelegram] = useState<string>('');

  // Premium token settings
  const [isPremiumEnabled, setIsPremiumEnabled] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [threadCount, setThreadCount] = useState(1);
  const [isVanityRunning, setIsVanityRunning] = useState(false);
  const [suffixError, setSuffixError] = useState('');
  
  // Progress and stats
  const [generatedCount, setGeneratedCount] = useState(0);
  const [processedAddresses, setProcessedAddresses] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Worker and timer references
  const workers = useRef<Worker[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  
  // Add state for vanity keypair and generated address
  const [vanityKeypair, setVanityKeypair] = useState<Keypair | null>(null);
  const [generatedAddress, setGeneratedAddress] = useState<string | null>(null);
  const [isGeneratingForReal, setIsGeneratingForReal] = useState(false);

  // Add a transaction status state
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  // Add new state variables for image uploading
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [metadataUrl, setMetadataUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Add state for direct URL input and custom createdOn
  const [directUrl, setDirectUrl] = useState<string>('');
  const [useDirectUrl, setUseDirectUrl] = useState<boolean>(false);
  const [customCreatedOn, setCustomCreatedOn] = useState<string>('');
  const [useCustomCreatedOn, setUseCustomCreatedOn] = useState<boolean>(false);

  // Start/stop vanity generation
  const toggleVanityGeneration = () => {
    if (isVanityRunning) {
      stopVanityGeneration();
    } else {
      startVanityGeneration();
    }
  };

  // Start vanity address generation
  const startVanityGeneration = async () => {
    if (prefix.length === 0 && suffix.length === 0) {
      setSuffixError('Please enter at least a prefix or suffix');
      return;
    }
    
    if (prefix.length + suffix.length > 44) {
      setSuffixError('Combined prefix and suffix length cannot exceed 44 characters');
      return;
    }
    
    // Warn user about long patterns
    if (prefix.length + suffix.length > 4) {
      if (!confirm(`You've entered a pattern with ${prefix.length + suffix.length} characters. This may take a very long time to generate (potentially hours). Continue anyway?`)) {
        return;
      }
    }
    
    setSuffixError('');
    setIsVanityRunning(true);
    setGeneratedCount(0);
    setProcessedAddresses(0);
    setProgress(0);
    setSpeed(0);
    setSuccess(null); // Clear any previous success message
    setGeneratedAddress(null); // Clear any previous generated address
    setVanityKeypair(null); // Clear any previous keypair
    setError(null); // Clear any previous errors
    
    const now = Date.now();
    startTimeRef.current = now;
    setLastUpdateTime(now);
    
    // Calculate estimated total addresses needed based on pattern length
    const totalPatternLength = prefix.length + suffix.length;
    const estimatedTotalAddresses = Math.pow(58, totalPatternLength);
    
    // Start a timer to update the UI
    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      
      const now = Date.now();
      const elapsedSeconds = (now - startTimeRef.current) / 1000;
      
      // Simulate progress for UI feedback
      let newProcessedAddresses = 0;
      let calculatedSpeed = 0;
      let estimatedSecondsRemaining = 99999;
      
      if (elapsedSeconds > 0) {
        // Calculate simulated progress based on pattern length
        if (totalPatternLength <= 2) {
          // For short patterns, simulate faster progress
          newProcessedAddresses = Math.min(10000, Math.floor(elapsedSeconds * 500));
        } else if (totalPatternLength <= 4) {
          // For medium patterns, simulate moderate progress
          newProcessedAddresses = Math.min(1000000, Math.floor(elapsedSeconds * 100));
        } else {
          // For long patterns, simulate slower progress
          newProcessedAddresses = Math.min(10000000, Math.floor(elapsedSeconds * 20));
        }
        
        // Update progress percentage (capped at 99% until real result arrives)
        const newProgress = Math.min(99, (newProcessedAddresses / estimatedTotalAddresses) * 100);
        setProgress(newProgress);
        setProcessedAddresses(newProcessedAddresses);
        
        // Calculate speed (addresses per second)
        if (lastUpdateTime) {
          const timeSinceLastUpdate = (now - lastUpdateTime) / 1000;
          if (timeSinceLastUpdate > 0) {
            calculatedSpeed = (newProcessedAddresses - processedAddresses) / timeSinceLastUpdate;
            setSpeed(Math.floor(calculatedSpeed));
          }
        }
        
        // Calculate estimated time remaining
        if (calculatedSpeed > 0) {
          if (totalPatternLength <= 2) {
            estimatedSecondsRemaining = Math.max(1, (10000 - processedAddresses) / calculatedSpeed);
          } else if (totalPatternLength <= 4) {
            estimatedSecondsRemaining = Math.max(5, (1000000 - processedAddresses) / calculatedSpeed);
          } else {
            estimatedSecondsRemaining = Math.max(30, (10000000 - processedAddresses) / calculatedSpeed);
          }
          
          estimatedSecondsRemaining = Math.min(99999, estimatedSecondsRemaining);
        } else {
          estimatedSecondsRemaining = 99999;
        }
        
        setEstimatedTime(Math.ceil(estimatedSecondsRemaining));
        
        // Update last update time
        setLastUpdateTime(now);
      }
    }, 100);
    
    try {
      setIsGeneratingForReal(true);
      
      // Call the API endpoint to generate the vanity address
      const response = await fetch('/api/generate-vanity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prefix,
          suffix,
          threadCount,
          ignoreCase: !isCaseSensitive
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 408) {
          // Timeout error - provide a specific message
          throw new Error(`${data.error} ${data.suggestion ? data.suggestion : ''}`);
        } else {
          throw new Error(data.error || 'Failed to generate vanity address');
        }
      }
      
      // Create a keypair from the returned data
      const keypairSecret = Uint8Array.from(data.keypairData);
      const generatedKeypair = Keypair.fromSecretKey(keypairSecret);
      
      // Store the keypair
      setVanityKeypair(generatedKeypair);
      
      // Update UI with the generated address
      setGeneratedAddress(data.publicKey);
      setGeneratedCount(1);
      setProgress(100);
      setSuccess(`Found vanity address: ${data.publicKey}`);
    } catch (error) {
      console.error('Error generating vanity address:', error);
      setError(`Error generating vanity address: ${error instanceof Error ? error.message : String(error)}`);
      
      // Do not use fallback address, just reset state
      setGeneratedAddress(null);
      setVanityKeypair(null);
      setGeneratedCount(0);
      setProgress(0);
    } finally {
      stopVanityGeneration();
      setIsGeneratingForReal(false);
    }
  };

  // Stop vanity generation
  const stopVanityGeneration = () => {
    setIsVanityRunning(false);
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Terminate workers
    workers.current.forEach(worker => worker.terminate());
    workers.current = [];
    
    // Reset progress if no address was generated
    if (!generatedAddress) {
      setProgress(0);
      setProcessedAddresses(0);
      setSpeed(0);
      setEstimatedTime(0);
    }
  };

  // Handle token creation
  const handleCreateToken = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!tokenName || !tokenSymbol || !tokenSupply) {
      setError('Please fill in all required fields');
      return;
    }

    if (isPremiumEnabled && !vanityKeypair) {
      setError('Please generate a vanity address first before creating token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setTransactionStatus('Preparing transaction...');

    try {
      // Connect to the Solana network using custom RPC URL if available
      const endpoint = SOLANA_NETWORK === 'mainnet-beta' && CUSTOM_RPC_URL 
        ? CUSTOM_RPC_URL 
        : clusterApiUrl(SOLANA_NETWORK);
      
      console.log('Using RPC endpoint:', endpoint);
      
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000, // 60 seconds timeout
      });
      
      // Step 1: Upload metadata to IPFS
      let metadataUri = '';
      
      try {
        // If user provided a direct URL, use that instead of uploading to IPFS
        if (useDirectUrl && directUrl) {
          console.log('Using direct URL provided by user:', directUrl);
          metadataUri = directUrl;
          setMetadataUrl(metadataUri);
        } else {
          setTransactionStatus('Uploading token metadata to IPFS...');
          
          // Determine createdOn value
          let createdOnValue;
          if (useCustomCreatedOn && customCreatedOn.trim()) {
            createdOnValue = customCreatedOn.trim();
          } else {
            createdOnValue = new Date().toISOString();
          }
          
          // Prepare metadata JSON with simplified structure
          const metadataJson: any = {
            name: tokenName.substring(0, 32),
            symbol: tokenSymbol.substring(0, 10),
            description: tokenDescription || "", // Always include description, even if empty
            createdOn: createdOnValue
          };
          
          // Only add image if provided
          if (imageUrl) {
            metadataJson.image = imageUrl;
          }
          
          // Add social links only if they are provided
          if (website && website.trim()) metadataJson.website = website.trim();
          if (twitter && twitter.trim()) metadataJson.twitter = twitter.trim();
          if (discord && discord.trim()) metadataJson.discord = discord.trim();
          if (telegram && telegram.trim()) metadataJson.telegram = telegram.trim();
          
          console.log('Uploading metadata to IPFS:', metadataJson);
          const result = await uploadMetadataToIPFS(metadataJson);
          metadataUri = result.url;
          console.log('Metadata uploaded to IPFS:', metadataUri);
          setMetadataUrl(metadataUri);
        }
      } catch (metadataError) {
        console.error('Error uploading metadata to IPFS:', metadataError);
        setError(`Error uploading metadata: ${metadataError instanceof Error ? metadataError.message : String(metadataError)}`);
        setIsLoading(false);
        return;
      }
      
      // For premium tokens, use the vanity keypair as the mint keypair
      // For regular tokens, generate a random keypair
      const mintKeypair = isPremiumEnabled ? vanityKeypair! : Keypair.generate();
      
      // Step 2: Create the token using our extracted createToken utility function
      const result = await createToken({
        connection,
        wallet,
        publicKey,
        mintKeypair,
        tokenName,
        tokenSymbol,
        tokenDescription,
        tokenDecimals,
        tokenSupply,
        revokeMint,
        revokeFreeze,
        metadataUri,
        setTransactionStatus,
        network: SOLANA_NETWORK
      });
      
      // Build success message
      let successMessage = `Token created successfully!\n\n`;
      successMessage += `Token Name: ${tokenName}\n`;
      successMessage += `Token Symbol: ${tokenSymbol}\n`;
      successMessage += `Decimals: ${tokenDecimals}\n`;
      successMessage += `Initial Supply: ${tokenSupply}\n\n`;
      
      if (tokenDescription) {
        successMessage += `Description: ${tokenDescription}\n\n`;
      }
      
      if (isPremiumEnabled) {
        successMessage += `Token Contract: ${mintKeypair.publicKey.toString()}\n\n`;
        successMessage += `Your vanity address has been used for the token contract!\n\n`;
      } else {
        successMessage += `Token Contract: ${mintKeypair.publicKey.toString()}\n\n`;
      }
      
      // Add authority status to success message
      if (revokeMint && revokeFreeze) {
        successMessage += `Mint Authority: Revoked (no one can mint more tokens)\n`;
        successMessage += `Freeze Authority: Revoked (no one can freeze token accounts)\n\n`;
      } else if (revokeMint) {
        successMessage += `Mint Authority: Revoked (no one can mint more tokens)\n`;
        successMessage += `Freeze Authority: Retained by your wallet\n\n`;
      } else if (revokeFreeze) {
        successMessage += `Mint Authority: Retained by your wallet\n`;
        successMessage += `Freeze Authority: Revoked (no one can freeze token accounts)\n\n`;
      } else {
        successMessage += `Mint Authority: Retained by your wallet\n`;
        successMessage += `Freeze Authority: Retained by your wallet\n\n`;
      }
      
      successMessage += `Transaction Signature: ${result.signature}\n`;
      successMessage += `View on Solana Explorer: https://explorer.solana.com/tx/${result.signature}?cluster=${SOLANA_NETWORK}\n\n`;
      successMessage += `Note: The total cost shown in your wallet includes rent deposits for the token accounts. Some of this SOL can be recovered if you delete these accounts in the future.`;
      
      // Add the transaction signature to the success message
      setSuccess(successMessage);
      
      // If we have a metadata URL, add it to the success message
      if (metadataUrl) {
        setSuccess(prevSuccess => `${prevSuccess}\n\nMetadata URL: ${metadataUrl}`);
      }
      
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setTokenDescription('');
      setTokenSupply('');
      setTokenDecimals(9);
      setImageUrl('');
      setLogoPreview('');
      setLogoFile(null);
      setUploadedImageUrl('');
      setMetadataUrl('');
      setVanityKeypair(null);
      setIsPremiumEnabled(false);
      setRevokeFreeze(false);
      setRevokeMint(false);
      
      setTransactionStatus('Complete!');
    } catch (err) {
      console.error('Error creating token:', err);
      setError(`Error creating token: ${err instanceof Error ? err.message : String(err)}`);
      setTransactionStatus('Transaction failed. See error details.');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      workers.current.forEach(worker => worker.terminate());
    };
  }, []);

  // Check Phantom wallet availability
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const phantomWallet = (window as any).solana;
      if (!phantomWallet || !phantomWallet.isPhantom) {
        console.log('Phantom wallet not detected');
      } else {
        console.log('Phantom wallet detected');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-6 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Solana SPL Token
            </h1>
            <p className="text-gray-400 max-w-2xl">
              Create your own Solana tokens with custom parameters and optional vanity addresses,
              all without any service fees.
            </p>
          </div>
          
          <div className={`mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-medium ${
            SOLANA_NETWORK === 'mainnet-beta' 
              ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
              : SOLANA_NETWORK === 'testnet'
                ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                : 'bg-blue-900/30 text-blue-400 border border-blue-500/30'
          }`}>
            {SOLANA_NETWORK.charAt(0).toUpperCase() + SOLANA_NETWORK.slice(1)} Network
          </div>
        </div>

        {/* Status Messages */}
        <StatusMessages 
          error={error}
          success={success}
          transactionStatus={transactionStatus}
        />

        {/* Main Content */}
        <div className="bg-gradient-to-b from-gray-900/80 to-gray-900/60 rounded-xl shadow-xl border border-gray-800/50 overflow-hidden backdrop-blur-sm">
          <div className="py-8 px-6 text-center border-b border-gray-800">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Solana Token Creator
            </h2>
          </div>

          {/* Wallet Connection */}
          <div className="p-6">
            <WalletSection />
          </div>

          {/* Vanity Toggle */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-900/20 to-purple-900/10 rounded-lg border border-purple-500/30">
              <div>
                <h3 className="text-lg font-medium text-purple-300">Enable Vanity Address</h3>
                <p className="text-sm text-gray-400">Create a token with a custom pattern in its address</p>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isPremiumEnabled}
                    onChange={() => {
                      // Reset vanity state when toggling off
                      if (isPremiumEnabled) {
                        setVanityKeypair(null);
                        setGeneratedAddress(null);
                        setGeneratedCount(0);
                        setProgress(0);
                      }
                      setIsPremiumEnabled(!isPremiumEnabled);
                    }}
                  />
                  <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 ${isPremiumEnabled ? 'lg:grid-cols-5' : 'lg:grid-cols-1'} gap-6 p-6`}>
            {/* Token Details Form */}
            <div className={`${isPremiumEnabled ? 'lg:col-span-3' : ''}`}>
              <TokenDetailsForm 
                tokenName={tokenName}
                tokenSymbol={tokenSymbol}
                tokenDecimals={tokenDecimals}
                tokenSupply={tokenSupply}
                tokenDescription={tokenDescription}
                showSocialLinks={showSocialLinks}
                revokeUpdate={revokeUpdate}
                revokeFreeze={revokeFreeze}
                revokeMint={revokeMint}
                website={website}
                twitter={twitter}
                discord={discord}
                telegram={telegram}
                useDirectUrl={useDirectUrl}
                directUrl={directUrl}
                useCustomCreatedOn={useCustomCreatedOn}
                customCreatedOn={customCreatedOn}
                metadataUrl={metadataUrl}
                isLoading={isLoading}
                publicKey={publicKey}
                setTokenName={setTokenName}
                setTokenSymbol={setTokenSymbol}
                setTokenDecimals={setTokenDecimals}
                setTokenSupply={setTokenSupply}
                setTokenDescription={setTokenDescription}
                setShowSocialLinks={setShowSocialLinks}
                setRevokeUpdate={setRevokeUpdate}
                setRevokeFreeze={setRevokeFreeze}
                setRevokeMint={setRevokeMint}
                setWebsite={setWebsite}
                setTwitter={setTwitter}
                setDiscord={setDiscord}
                setTelegram={setTelegram}
                setDirectUrl={setDirectUrl}
                setUseDirectUrl={setUseDirectUrl}
                setCustomCreatedOn={setCustomCreatedOn}
                setUseCustomCreatedOn={setUseCustomCreatedOn}
                createToken={handleCreateToken}
                isPremiumEnabled={isPremiumEnabled}
                vanityKeypair={vanityKeypair}
              />
              
              {!useDirectUrl && (
                <div className="mt-6">
                  <ImageUploader 
                    logoFile={logoFile}
                    logoPreview={logoPreview}
                    imageUrl={imageUrl}
                    uploadedImageUrl={uploadedImageUrl}
                    isUploading={isUploading}
                    uploadStatus={uploadStatus}
                    setLogoFile={setLogoFile}
                    setLogoPreview={setLogoPreview}
                    setImageUrl={setImageUrl}
                    setUploadedImageUrl={setUploadedImageUrl}
                    setIsUploading={setIsUploading}
                    setUploadStatus={setUploadStatus}
                    setError={setError}
                  />
                </div>
              )}
            </div>
            
            {/* Vanity Address Generator */}
            {isPremiumEnabled && (
              <div className="lg:col-span-2">
                <VanityAddressGenerator 
                  prefix={prefix}
                  suffix={suffix}
                  isCaseSensitive={isCaseSensitive}
                  threadCount={threadCount}
                  isVanityRunning={isVanityRunning}
                  generatedCount={generatedCount}
                  processedAddresses={processedAddresses}
                  estimatedTime={estimatedTime}
                  speed={speed}
                  progress={progress}
                  generatedAddress={generatedAddress}
                  vanityKeypair={vanityKeypair}
                  suffixError={suffixError}
                  setPrefix={setPrefix}
                  setSuffix={setSuffix}
                  setIsCaseSensitive={setIsCaseSensitive}
                  setThreadCount={setThreadCount}
                  setSuffixError={setSuffixError}
                  toggleVanityGeneration={toggleVanityGeneration}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>
            Created with 💜 for the Solana community • {new Date().getFullYear()} • No service fees • Open source
          </p>
        </div>
      </div>
    </div>
  );
}; 