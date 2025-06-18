import { NextResponse } from "next/server";
import { getPinataClient } from "@/utils/pinataConfig";

/**
 * API route for generating temporary signed upload URLs
 * This allows for secure client-side uploads without exposing API keys
 */
export const dynamic = "force-dynamic"; // Ensure this is always a dynamic route

export async function GET() {
  try {
    console.log('Generating signed upload URL');
    
    // Get the Pinata client
    const pinata = getPinataClient();
    
    // Create a signed URL that expires in 30 seconds
    const url = await pinata.upload.public.createSignedURL({
      expires: 30, // Expires in 30 seconds
    });
    
    console.log('Signed upload URL generated successfully');
    
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error('Error creating signed upload URL:', error);
    
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 