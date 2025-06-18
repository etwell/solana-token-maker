import { NextResponse, type NextRequest } from "next/server";
import { getPinataClient } from "@/utils/pinataConfig";

/**
 * API route for uploading files to Pinata IPFS
 */
export async function POST(request: NextRequest) {
  try {
    console.log('File upload request received');
    
    // Get the Pinata client
    const pinata = getPinataClient();
    
    // Parse the form data from the request
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    
    if (!file) {
      console.error('No file provided in the request');
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    console.log(`Uploading file: ${file.name}, size: ${file.size} bytes`);
    
    // Upload the file to Pinata
    const { cid } = await pinata.upload.public.file(file);
    console.log(`File uploaded successfully, CID: ${cid}`);
    
    // Convert the CID to a gateway URL
    const url = await pinata.gateways.public.convert(cid);
    console.log(`Gateway URL: ${url}`);
    
    // Return the gateway URL to the client
    return NextResponse.json({ url, cid }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 