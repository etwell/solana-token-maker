import { NextRequest, NextResponse } from "next/server";
import { getPinataClient } from "@/utils/pinataConfig";

/**
 * API route for uploading JSON metadata to Pinata IPFS
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Metadata upload request received');
    
    // Get the Pinata client
    const pinata = getPinataClient();
    
    // Parse the JSON data from the request
    const jsonData = await request.json();
    
    if (!jsonData) {
      console.error('No JSON data provided in the request');
      return NextResponse.json(
        { error: "No JSON data provided" },
        { status: 400 }
      );
    }
    
    console.log('Uploading metadata to Pinata:', JSON.stringify(jsonData).substring(0, 200) + '...');
    
    // Upload the JSON data to Pinata
    const { cid } = await pinata.upload.public.json(jsonData);
    console.log(`Metadata uploaded successfully, CID: ${cid}`);
    
    // Convert the CID to a gateway URL
    const url = await pinata.gateways.public.convert(cid);
    console.log(`Gateway URL: ${url}`);
    
    // Return the gateway URL to the client
    return NextResponse.json({ url, cid }, { status: 200 });
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 