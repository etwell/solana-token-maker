import { NextResponse } from 'next/server';
import https from 'node:https';

/**
 * Test endpoint to verify Printa API connectivity
 */
export async function GET() {
  try {
    console.log('Testing Printa API connection');
    
    // Get the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_PRINTA_API_KEY;
    
    if (!apiKey) {
      console.error('Missing Printa API key in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Printa API key' },
        { status: 500 }
      );
    }
    
    // Simple test request to Printa API
    const testEndpoint = 'https://api.printa.io/v1/ipfs/status';
    
    console.log(`Testing connection to: ${testEndpoint}`);
    
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Host': 'api.printa.io'
    };
    
    const response = await fetch(testEndpoint, {
      method: 'GET',
      headers,
      // Fix for SSL issues in development environments
      ...(process.env.NODE_ENV === 'development' ? { 
        agent: new https.Agent({
          rejectUnauthorized: false
        })
      } : {})
    });
    
    console.log('Printa test response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Printa API test error (${response.status}): ${errorText}`);
      
      return NextResponse.json(
        { success: false, error: `Printa API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    // Return success response
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Printa API',
      data
    });
  } catch (error) {
    console.error('Error testing Printa API connection:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { success: false, error: 'Connection test failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 