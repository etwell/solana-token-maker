import { Connection, Transaction, Keypair } from '@solana/web3.js';

// Function to send transaction via Phantom wallet
export async function sendTransaction(
  transaction: Transaction,
  connection: Connection,
  options: {
    signers?: Keypair[];
    skipPreflight?: boolean;
    preflightCommitment?: 'processed' | 'confirmed' | 'finalized';
  } = {}
) {
  const { signers = [], skipPreflight = false } = options;
  
  // Get the wallet adapter from window
  const wallet = (window as any).solana;
  
  if (!wallet) {
    throw new Error('Phantom wallet not connected');
  }
  
  // Sign the transaction with any additional signers
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }
  
  // Send the transaction to the network via Phantom
  try {
    const { signature } = await wallet.signAndSendTransaction(transaction);
    return signature;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
}

// Estimate transaction fee
export const estimateTransactionFee = async (connection: Connection, transaction: Transaction): Promise<number> => {
  try {
    // Get the recent fee schedule
    const feeCalculator = await connection.getRecentBlockhash('finalized');
    
    // Estimate the fee based on the transaction size and the recent fee schedule
    const fee = await connection.getFeeForMessage(
      transaction.compileMessage(),
      'finalized'
    );
    
    return fee.value || 5000; // Default to 5000 lamports (0.000005 SOL) if estimation fails
  } catch (error) {
    console.error('Error estimating fee:', error);
    return 5000; // Default to 5000 lamports (0.000005 SOL)
  }
}; 