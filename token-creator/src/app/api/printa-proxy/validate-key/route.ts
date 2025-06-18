import { NextResponse } from 'next/server';
import https from 'node:https';

/**
 * Endpoint to validate if the Printa API key is configured
 */
export async function GET() {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_PRINTA_API_KEY;
    
    if (!apiKey) {
      console.warn('Missing Printa API key in environment variables');
      return NextResponse.json(
        { 
          configured: false,
          message: 'Printa API key is not configured in environment variables'
        }
      );
    }
    
    // Test the API key with a simple request
    const testEndpoint = 'https://api.printa.io/v1/ipfs/status';
    
    const response = await fetch(testEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Host': 'api.printa.io'
      },
      // Fix for SSL issues in development environments
      ...(process.env.NODE_ENV === 'development' ? { 
        agent: new https.Agent({
          rejectUnauthorized: false
        })
      } : {})
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Printa API key validation failed (${response.status}): ${errorText}`);
      
      return NextResponse.json({
        configured: true,
        valid: false,
        message: `API key is configured but appears to be invalid: ${response.status} error`
      });
    }
    
    // Return success response
    return NextResponse.json({
      configured: true,
      valid: true,
      message: 'Printa API key is configured and valid'
    });
  } catch (error) {
    console.error('Error validating Printa API key:', error);
    
    return NextResponse.json({
      configured: true,
      valid: false,
      message: `Error validating API key: ${error instanceof Error ? error.message : String(error)}`
    });
  }
} 