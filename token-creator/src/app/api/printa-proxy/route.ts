import { NextRequest, NextResponse } from 'next/server';
import https from 'node:https';

/**
 * API route that proxies requests to Printa's API to avoid CORS issues
 */
export async function POST(req: NextRequest) {
  try {
    console.log('Printa proxy request received');
    
    // Get the endpoint from the query params
    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint') || 'upload';
    
    console.log(`Requested endpoint: ${endpoint}`);
    
    // Get the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_PRINTA_API_KEY;
    
    if (!apiKey) {
      console.error('Missing Printa API key in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Printa API key' },
        { status: 500 }
      );
    }
    
    console.log(`Using API key from environment variables (length: ${apiKey.length})`);
    
    // Determine the Printa API endpoint
    let printaEndpoint = 'https://api.printa.io/v1/ipfs/upload';
    if (endpoint === 'json') {
      printaEndpoint = 'https://api.printa.io/v1/ipfs/upload/json';
    }
    
    console.log(`Proxying request to Printa: ${printaEndpoint}`);
    
    // Handle the request body based on the content type
    let body;
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Host': 'api.printa.io' // Add explicit host header to fix SSL issues
    };
    
    if (endpoint === 'json') {
      // For JSON uploads, parse the request body as JSON
      const jsonData = await req.json();
      console.log('JSON request body:', JSON.stringify(jsonData).substring(0, 200) + '...');
      body = JSON.stringify(jsonData);
      headers['Content-Type'] = 'application/json';
    } else {
      // For file uploads, use the request body as is
      body = await req.blob();
      console.log('File upload request, content type:', req.headers.get('content-type'));
      console.log('File size:', body.size, 'bytes');
    }
    
    console.log('Sending request to Printa with headers:', headers);
    
    // Create fetch options with SSL fix for Node.js
    const fetchOptions = {
      method: 'POST',
      headers,
      body
    };
    
    // Add NODE_TLS_REJECT_UNAUTHORIZED=0 environment variable for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Setting NODE_TLS_REJECT_UNAUTHORIZED=0 for development');
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    
    // Forward the request to Printa
    const printaResponse = await fetch(printaEndpoint, fetchOptions);
    
    // Reset NODE_TLS_REJECT_UNAUTHORIZED for security
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    }
    
    console.log('Printa response status:', printaResponse.status);
    
    if (!printaResponse.ok) {
      const errorText = await printaResponse.text();
      console.error(`Printa API error (${printaResponse.status}): ${errorText}`);
      
      return NextResponse.json(
        { error: `Printa API error: ${printaResponse.status}`, details: errorText },
        { status: printaResponse.status }
      );
    }
    
    // Return the response from Printa
    const data = await printaResponse.json();
    console.log('Printa API response:', JSON.stringify(data).substring(0, 200));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Printa proxy:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 