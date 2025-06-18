import { NextResponse } from "next/server";
import { getPinataClient, isPinataConfigured } from "@/utils/pinataConfig";

/**
 * Test endpoint to verify Pinata IPFS connectivity
 */
export async function GET() {
  try {
    console.log('Testing Pinata IPFS connection');
    
    // Check if Pinata is configured
    const isConfigured = await isPinataConfigured();
    
    if (!isConfigured) {
      console.warn('Pinata is not properly configured');
      return NextResponse.json({
        status: 'error',
        message: 'Pinata is not properly configured. Missing JWT or gateway URL.',
      }, { status: 500 });
    }
    
    // Get the Pinata client
    const pinata = getPinataClient();
    
    // Test the connection by attempting to convert a test CID
    try {
      // Use a known test CID to check gateway functionality
      const testCid = "QmZtmD2qt6fJot32nabSP3CUjicnypEBz7bHVDhPQt9aAy";
      const gatewayUrl = await pinata.gateways.public.convert(testCid);
      
      // Create an example of the simplified metadata format
      const exampleMetadata = {
        name: "EXAMPLE",
        symbol: "$EX",
        description: "", // Empty but still included
        createdOn: "https://pump.fun", // Custom createdOn as a URL
        image: "https://example.com/image.png",
        website: "https://example.com",
        twitter: "https://twitter.com/example",
        telegram: "https://t.me/example"
      };
      
      // Example with minimal fields
      const minimalExample = {
        name: "MINIMAL",
        symbol: "MIN",
        description: "",
        createdOn: new Date().toISOString() // Default timestamp
      };
      
      return NextResponse.json({
        status: 'success',
        message: 'Successfully connected to Pinata IPFS',
        gatewayUrl,
        testCid,
        exampleMetadata,
        minimalExample
      });
    } catch (apiError) {
      console.error('Error connecting to Pinata API:', apiError);
      
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Pinata API',
        error: apiError instanceof Error ? apiError.message : String(apiError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error testing Pinata connection:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Error testing Pinata connection',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 