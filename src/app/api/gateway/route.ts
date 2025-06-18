import { NextRequest, NextResponse } from "next/server";
import { getPinataClient } from "@/utils/pinataConfig";

/**
 * API route for converting CIDs to gateway URLs
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Pinata client
    const pinata = getPinataClient();
    
    // Get the CID from the query params
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');
    
    if (!cid) {
      return NextResponse.json(
        { error: "Missing CID parameter" },
        { status: 400 }
      );
    }
    
    console.log(`Converting CID to gateway URL: ${cid}`);
    
    // Convert the CID to a gateway URL
    const url = await pinata.gateways.public.convert(cid);
    
    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error('Error converting CID to gateway URL:', error);
    
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 