import { PinataSDK } from "pinata";

// Create and export a function to get a Pinata SDK instance
export function getPinataClient() {
  return new PinataSDK({
    pinataJwt: `${process.env.PINATA_JWT}`,
    pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`
  });
}

// Helper function to check if Pinata is configured
export async function isPinataConfigured(): Promise<boolean> {
  try {
    const jwt = process.env.PINATA_JWT;
    const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;
    
    return Boolean(jwt && gateway);
  } catch (error) {
    console.error("Error checking Pinata configuration:", error);
    return false;
  }
} 