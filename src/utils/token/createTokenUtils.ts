import { 
  Connection, 
  Transaction, 
  Keypair, 
  PublicKey, 
  SystemProgram, 
  Cluster
} from '@solana/web3.js';
import * as token from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { createMetadataInstruction } from '../tokenMetadata';
import { estimateTransactionFee } from './transactionUtils';

interface CreateTokenParams {
  connection: Connection;
  wallet: WalletContextState;
  publicKey: PublicKey;
  mintKeypair: Keypair;
  tokenName: string;
  tokenSymbol: string;
  tokenDescription: string;
  tokenDecimals: number;
  tokenSupply: string;
  revokeMint: boolean;
  revokeFreeze: boolean;
  metadataUri: string;
  setTransactionStatus: (status: string | null) => void;
  network: Cluster;
}

export const createToken = async ({
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
  network
}: CreateTokenParams) => {
  
  console.log('Creating token with connected wallet:', publicKey.toString());
  console.log('Using mint address:', mintKeypair.publicKey.toString());

  // Step 1: Create a transaction to create the token mint account
  setTransactionStatus('Creating token transaction...');
  const createAccountTransaction = new Transaction();
  
  // Get minimum lamports needed for mint
  const mintRent = await connection.getMinimumBalanceForRentExemption(token.MINT_SIZE);
  console.log('Mint rent (lamports):', mintRent);
  
  // Create account instruction
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: token.MINT_SIZE,
    lamports: mintRent,
    programId: token.TOKEN_PROGRAM_ID,
  });
  
  // Step 2: Initialize the mint
  const initializeMintInstruction = token.createInitializeMintInstruction(
    mintKeypair.publicKey,
    tokenDecimals,
    publicKey,
    publicKey // Always set freeze authority initially, we'll revoke it later if needed
  );
  
  // Add instructions to transaction
  createAccountTransaction.add(createAccountInstruction);
  createAccountTransaction.add(initializeMintInstruction);
  
  // Step 3: Create associated token account for the connected wallet
  const associatedTokenAddress = await token.getAssociatedTokenAddress(
    mintKeypair.publicKey,
    publicKey
  );
  
  const createAssociatedTokenAccountInstruction = token.createAssociatedTokenAccountInstruction(
    publicKey,
    associatedTokenAddress,
    publicKey,
    mintKeypair.publicKey
  );
  
  createAccountTransaction.add(createAssociatedTokenAccountInstruction);
  
  // Step 4: Mint tokens to the associated token account
  const supplyWithDecimals = parseFloat(tokenSupply) * Math.pow(10, tokenDecimals);
  const mintToInstruction = token.createMintToInstruction(
    mintKeypair.publicKey,
    associatedTokenAddress,
    publicKey,
    BigInt(supplyWithDecimals)
  );
  
  createAccountTransaction.add(mintToInstruction);
  
  // Step 5: Add token metadata if we have a name and symbol
  // This must be done BEFORE revoking mint authority
  if (tokenName && tokenSymbol) {
    try {
      setTransactionStatus('Preparing token metadata...');
      console.log('Starting token metadata preparation');
      
      // We'll always use IPFS metadata to avoid URI too long errors
      if (!metadataUri) {
        throw new Error('No metadata URI available. IPFS upload may have failed.');
      }
      
      console.log('Using IPFS metadata URI:', metadataUri);
      
      // Create and add the metadata instruction with the IPFS URI
      setTransactionStatus('Creating metadata instruction...');
      console.log('Creating metadata instruction for mint:', mintKeypair.publicKey.toString());
      
      try {
        const metadataInstruction = await createMetadataInstruction(
          mintKeypair.publicKey,
          publicKey,
          {
            name: tokenName.substring(0, 32),
            symbol: tokenSymbol.substring(0, 10),
            description: tokenDescription || '',
          },
          metadataUri // Always use the IPFS URI
        );
        
        console.log('Metadata instruction created successfully');
        createAccountTransaction.add(metadataInstruction);
        console.log('Added metadata instruction to transaction');
        setTransactionStatus('Metadata prepared successfully');
      } catch (metadataInstructionError) {
        console.error('Error creating metadata instruction:', metadataInstructionError);
        // Continue without metadata if there's an error
        setTransactionStatus('Continuing without metadata due to error');
      }
    } catch (metadataError) {
      console.error('Error creating metadata instruction:', metadataError);
      // Continue without metadata if there's an error
      setTransactionStatus('Continuing without metadata due to error');
    }
  }
  
  // Step 6: If requested, revoke mint authority
  if (revokeMint) {
    const revokeMintInstruction = token.createSetAuthorityInstruction(
      mintKeypair.publicKey,
      publicKey,
      token.AuthorityType.MintTokens,
      null
    );
    
    createAccountTransaction.add(revokeMintInstruction);
  }
  
  // Step 7: If requested, revoke freeze authority
  if (revokeFreeze) {
    const revokeFreezeInstruction = token.createSetAuthorityInstruction(
      mintKeypair.publicKey,
      publicKey,
      token.AuthorityType.FreezeAccount,
      null
    );
    
    createAccountTransaction.add(revokeFreezeInstruction);
  }
  
  // Set recent blockhash and fee payer
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
  createAccountTransaction.recentBlockhash = blockhash;
  createAccountTransaction.feePayer = publicKey;
  
  // Estimate transaction fee
  const estimatedFee = await estimateTransactionFee(connection, createAccountTransaction);
  
  // Get minimum lamports needed for metadata account (if metadata is being added)
  let metadataRent = 0;
  if (tokenName && tokenSymbol) {
    // Metadata accounts typically need about 679 bytes
    metadataRent = await connection.getMinimumBalanceForRentExemption(679);
    console.log('Metadata rent (lamports):', metadataRent);
  }
  
  const totalCost = mintRent + metadataRent + estimatedFee;
  console.log('Estimated fee (lamports):', estimatedFee);
  console.log('Total cost (lamports):', totalCost);
  console.log('Total cost (SOL):', totalCost / 1000000000);
  
  // Check if user has enough SOL
  const balance = await connection.getBalance(publicKey);
  console.log('Wallet balance (lamports):', balance);
  
  if (balance < totalCost) {
    throw new Error(`Insufficient balance. You need at least ${(totalCost / 1000000000).toFixed(6)} SOL for this transaction.`);
  }
  
  // Confirm transaction with user
  const confirmMessage = `Creating token will cost approximately ${(totalCost / 1000000000).toFixed(6)} SOL. This includes rent for token accounts and transaction fees.\n\nNote: Phantom wallet may show a higher amount that includes temporary deposits. Continue?`;
  if (!confirm(confirmMessage)) {
    setTransactionStatus(null);
    throw new Error('Transaction cancelled by user');
  }
  
  // Sign the transaction with the mint keypair
  createAccountTransaction.partialSign(mintKeypair);
  console.log('Transaction partially signed with mint keypair');
  
  setTransactionStatus('Sending transaction to wallet for approval...');
  
  // Check if wallet is still connected
  if (!wallet.connected || !publicKey) {
    throw new Error('Wallet disconnected. Please reconnect your wallet and try again.');
  }
  
  console.log('Preparing to send transaction with', createAccountTransaction.instructions.length, 'instructions');
  
  // Send the transaction
  console.log('Sending transaction to wallet...');
  const signature = await wallet.sendTransaction(createAccountTransaction, connection, {
    signers: [mintKeypair],
    preflightCommitment: 'processed',
    skipPreflight: true // Skip preflight to avoid simulation errors
  });
  
  console.log('Transaction sent with signature:', signature);
  setTransactionStatus('Transaction submitted. Waiting for confirmation...');
  
  // Wait for confirmation with increased timeout and retry logic
  setTransactionStatus('Confirming transaction (this may take up to 60 seconds)...');
  console.log('Waiting for transaction confirmation, signature:', signature);
  
  const status = await connection.confirmTransaction({
    signature,
    blockhash,
    lastValidBlockHeight
  }, 'confirmed');
  
  console.log('Transaction confirmation status:', status);
  
  if (status.value.err) {
    console.error('Transaction confirmation returned error:', status.value.err);
    throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
  }
  
  console.log('Transaction confirmed:', status);
  setTransactionStatus('Transaction confirmed! Finalizing...');
  
  return {
    success: true,
    signature,
    mintAddress: mintKeypair.publicKey.toString()
  };
}; 