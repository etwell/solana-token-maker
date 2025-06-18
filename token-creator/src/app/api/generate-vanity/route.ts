import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Keypair } from '@solana/web3.js';
import { randomUUID } from 'crypto';

// Promisify exec for async/await usage
const execAsync = promisify(exec);

// Timeout durations based on pattern length
const getTimeoutForPattern = (pattern: string): number => {
  const length = pattern.length;
  if (length <= 2) return 30000; // 30 seconds for 1-2 chars
  if (length <= 3) return 120000; // 2 minutes for 3 chars
  if (length <= 4) return 300000; // 5 minutes for 4 chars
  return 600000; // 10 minutes for 5+ chars
};

export async function POST(request: Request) {
  try {
    const { prefix, suffix, threadCount, ignoreCase } = await request.json();
    
    // Validate input
    if (!prefix && !suffix) {
      return NextResponse.json({ error: 'At least one of prefix or suffix must be provided' }, { status: 400 });
    }
    
    // Warn about long patterns
    const pattern = (prefix || '') + (suffix || '');
    if (pattern.length > 4) {
      console.warn(`Long vanity pattern requested: ${pattern}. This may take a long time.`);
    }
    
    // Create a unique keypair filename
    const uuid = randomUUID();
    const keypairFilename = `vanity-keypair-${uuid}.json`;
    
    // Build the solana-keygen vanity command with correct syntax
    let vanityCommand = `solana-keygen grind`;
    
    // Add number of threads (with reasonable limits)
    const threads = Math.min(Math.max(1, threadCount || 10), 16);
    vanityCommand += ` --num-threads ${threads}`;
    
    // Add case-insensitive option if requested
    if (ignoreCase) {
      vanityCommand += ` --ignore-case`;
    }
    
    // Add prefix/suffix parameters
    if (prefix && suffix) {
      // If both prefix and suffix are provided, use starts-and-ends-with
      vanityCommand += ` --starts-and-ends-with ${prefix}:${suffix}:1`;
    } else if (prefix) {
      // If only prefix is provided, use starts-with
      vanityCommand += ` --starts-with ${prefix}:1`;
    } else if (suffix) {
      // If only suffix is provided, use ends-with
      vanityCommand += ` --ends-with ${suffix}:1`;
    }
    
    // Create the keypair file directory
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    console.log(`Executing command: ${vanityCommand}`);
    
    // Determine timeout based on pattern length
    const timeout = getTimeoutForPattern(pattern);
    console.log(`Setting timeout to ${timeout}ms for pattern length ${pattern.length}`);
    
    try {
      // Execute the command with a timeout
      const { stdout, stderr } = await Promise.race([
        execAsync(vanityCommand),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Vanity generation timed out after ${timeout/1000} seconds`)), timeout)
        )
      ]) as { stdout: string, stderr: string };
      
      console.log('Vanity generation output:', stdout);
      if (stderr) console.error('Vanity generation error:', stderr);
      
      // Parse the output to find the generated keypair
      const outputLines = stdout.split('\n');
      
      // Find the line that contains "Wrote keypair to"
      const keypairLine = outputLines.find(line => line.includes('Wrote keypair to'));
      
      if (!keypairLine) {
        throw new Error('Could not find generated keypair in output');
      }
      
      // Extract the keypair file path
      const keypairPath = keypairLine.split('Wrote keypair to ')[1]?.trim();
      if (!keypairPath) {
        throw new Error('Could not parse keypair file path from output');
      }
      
      // The public key is the filename without the .json extension
      const pubkey = path.basename(keypairPath, '.json');
      console.log('Extracted pubkey:', pubkey);
      
      // Read the keypair file
      try {
        const keypairData = fs.readFileSync(keypairPath, 'utf8');
        const keypairSecret = Uint8Array.from(JSON.parse(keypairData));
        const generatedKeypair = Keypair.fromSecretKey(keypairSecret);
        
        // Verify the public key matches
        const actualPubkey = generatedKeypair.publicKey.toString();
        console.log('Actual pubkey from keypair:', actualPubkey);
        
        // Clean up the keypair file
        try {
          fs.unlinkSync(keypairPath);
        } catch (unlinkError) {
          console.warn('Could not delete keypair file:', unlinkError);
        }
        
        // Return the keypair data and public key
        return NextResponse.json({
          success: true,
          publicKey: actualPubkey,
          keypairData: JSON.parse(keypairData),
          message: 'Vanity address generated successfully'
        });
      } catch (readError: unknown) {
        console.error('Error reading keypair file:', readError);
        const errorMessage = readError instanceof Error ? readError.message : String(readError);
        throw new Error(`Could not read keypair file: ${errorMessage}`);
      }
    } catch (execError: unknown) {
      // Handle timeout or execution errors
      const errorMessage = execError instanceof Error ? execError.message : String(execError);
      
      if (errorMessage.includes('timed out')) {
        return NextResponse.json({ 
          error: `Vanity generation took too long. Try a shorter pattern or increase server timeout.`,
          suggestion: pattern.length > 2 ? `Try a pattern with ${pattern.length - 1} or fewer characters` : null
        }, { status: 408 }); // 408 Request Timeout
      } else {
        throw execError; // Re-throw for general error handling
      }
    }
    
  } catch (error) {
    console.error('Error generating vanity address:', error);
    return NextResponse.json({ 
      error: `Error generating vanity address: ${error instanceof Error ? error.message : String(error)}` 
    }, { status: 500 });
  }
} 