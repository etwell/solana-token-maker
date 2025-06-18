import { 
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';
import { 
  PublicKey, 
  TransactionInstruction 
} from '@solana/web3.js';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image?: string;
  externalUrl?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  website?: string;
}

/**
 * Creates a token metadata instruction
 * 
 * @param mintAddress The mint address of the token
 * @param payer The payer public key
 * @param metadata The token metadata
 * @param externalUri Optional external URI for the metadata (e.g. IPFS URL)
 * @returns The metadata instruction
 */
export async function createMetadataInstruction(
  mintAddress: PublicKey,
  payer: PublicKey,
  metadata: TokenMetadata,
  externalUri?: string
): Promise<TransactionInstruction> {
  // Derive PDA for metadata
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintAddress.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  console.log('Creating metadata for mint:', mintAddress.toString());
  console.log('Using metadata PDA:', metadataPDA.toString());
  
  // Ensure name and symbol don't exceed maximum lengths
  const name = metadata.name.substring(0, 32); // Max 32 chars
  const symbol = metadata.symbol.substring(0, 10); // Max 10 chars

  // Use external URI if provided, otherwise generate from metadata
  let tokenMetadataUri: string;
  
  if (externalUri) {
    console.log('Using provided external URI:', externalUri);
    // Ensure the URI isn't too long (Solana has a limit)
    if (externalUri.length > 200) {
      console.warn('External URI is too long:', externalUri.length, 'chars');
      console.warn('This may cause the transaction to fail');
      console.warn('Truncating URI to 200 chars');
      tokenMetadataUri = externalUri.substring(0, 200);
    } else {
      tokenMetadataUri = externalUri;
    }
  } else {
    console.log('No external URI provided, generating on-chain metadata');
    // Generate minimal on-chain metadata without image to avoid URI too long errors
    const minimalMetadata = {
      name,
      symbol,
      description: metadata.description ? metadata.description.substring(0, 100) : '',
    };
    
    const minimalJson = JSON.stringify(minimalMetadata);
    tokenMetadataUri = `data:application/json;base64,${Buffer.from(minimalJson).toString('base64')}`;
    
    console.log('Generated minimal on-chain metadata URI length:', tokenMetadataUri.length);
    
    // If still too long, use an even more minimal version
    if (tokenMetadataUri.length > 200) {
      console.warn('Generated URI is still too long, using ultra-minimal metadata');
      const ultraMinimal = { name, symbol };
      tokenMetadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(ultraMinimal)).toString('base64')}`;
    }
  }
  
  console.log('Final metadata URI length:', tokenMetadataUri.length);

  // Create the metadata instruction
  const instruction = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: mintAddress,
      mintAuthority: payer,
      payer: payer,
      updateAuthority: payer,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: name,
          symbol: symbol,
          uri: tokenMetadataUri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
        collectionDetails: null,
      },
    }
  );

  return instruction;
}

/**
 * Generates a metadata URI from token metadata
 * 
 * @param metadata The token metadata
 * @returns A data URI containing the metadata
 */
export async function generateMetadataUri(metadata: TokenMetadata): Promise<string> {
  try {
    console.log('Starting metadata generation with:', {
      name: metadata.name,
      symbol: metadata.symbol,
      hasImage: !!metadata.image,
      imageLength: metadata.image ? metadata.image.length : 0,
      imageStart: metadata.image ? metadata.image.substring(0, 50) + '...' : 'none'
    });
    
    // Create the JSON metadata object following Metaplex standards
    const metadataJson: Record<string, unknown> = {
      name: metadata.name.substring(0, 32),
      symbol: metadata.symbol.substring(0, 10),
      description: metadata.description ? metadata.description.substring(0, 200) : '',
      seller_fee_basis_points: 0,
    };

    // Add external URL if available
    if (metadata.website || metadata.externalUrl) {
      metadataJson.external_url = metadata.website || metadata.externalUrl;
    }

    // Add social links if available
    if (metadata.twitter || metadata.discord || metadata.telegram || metadata.website) {
      metadataJson.properties = {
        ...(metadataJson.properties as object || {}),
        links: {
          ...(metadata.twitter ? { twitter: metadata.twitter } : {}),
          ...(metadata.discord ? { discord: metadata.discord } : {}),
          ...(metadata.telegram ? { telegram: metadata.telegram } : {}),
          ...(metadata.website ? { website: metadata.website } : {})
        }
      };
    }
    
    // If image is provided, try to add it but handle errors gracefully
    if (metadata.image) {
      try {
        console.log('Processing image in metadata, image data length:', metadata.image.length);
        
        // Check if the image is already a URL
        if (metadata.image.startsWith('http')) {
          // Handle the URL - Solana has URI length limits
          const originalUrl = metadata.image;
          console.log('Original image URL:', originalUrl);
          
          // Check if URL is from imgur and optimize it
          if (originalUrl.includes('imgur.com')) {
            // For imgur links, we can use their direct image format which is shorter
            // Convert https://i.imgur.com/qM4Xg0q.jpeg to https://i.imgur.com/qM4Xg0q.jpg
            const imgurId = originalUrl.split('/').pop()?.split('.')[0];
            if (imgurId) {
              const optimizedUrl = `https://i.imgur.com/${imgurId}.jpg`;
              console.log('Optimized imgur URL:', optimizedUrl);
              metadataJson.image = optimizedUrl;
            } else {
              // If we can't optimize, use the original but warn
              console.log('Could not optimize imgur URL, using original');
              metadataJson.image = originalUrl;
            }
          } else {
            // For other URLs, check if they're too long
            if (originalUrl.length > 100) {
              console.warn('Image URL is very long, this may cause issues with Solana metadata');
              console.warn('Consider using a shorter URL or a URL shortening service');
              
              // We'll still try with the original URL
              metadataJson.image = originalUrl;
            } else {
              console.log('Using provided image URL:', originalUrl);
              metadataJson.image = originalUrl;
            }
          }
        } else {
          // For data URIs, use a placeholder approach
          let imageType = 'png';
          if (metadata.image.startsWith('data:image/jpeg') || metadata.image.startsWith('data:image/jpg')) {
            imageType = 'jpg';
          } else if (metadata.image.startsWith('data:image/gif')) {
            imageType = 'gif';
          }
          
          // Use a simpler image reference to avoid serialization issues
          metadataJson.image = `https://token-creator.placeholder.img/${metadata.name.replace(/\s+/g, '-').toLowerCase()}.${imageType}`;
          console.log('Using placeholder image URL:', metadataJson.image);
          console.log('TIP: Upload your image to GitHub or Imgur and use a short URL for better compatibility.');
        }
        
        // Add files array to properties
        if (!metadataJson.properties) {
          metadataJson.properties = {};
        }
        
        // Set category
        (metadataJson.properties as any).category = "image";
        
        // Convert to string to check size
        const metadataString = JSON.stringify(metadataJson);
        console.log('Metadata with image reference size (bytes):', metadataString.length);
        
        // Check if the URI will be too long (Solana has a limit)
        const base64Metadata = Buffer.from(metadataString).toString('base64');
        const fullUri = `data:application/json;base64,${base64Metadata}`;
        
        if (fullUri.length > 200) {
          console.warn('Metadata URI is very long:', fullUri.length, 'chars. This may cause issues.');
          console.warn('Removing image to reduce URI size...');
          
          // Remove the image to reduce size
          delete metadataJson.image;
          
          // Try again without the image
          const smallerMetadataString = JSON.stringify(metadataJson);
          const smallerBase64 = Buffer.from(smallerMetadataString).toString('base64');
          console.log('Metadata without image size (bytes):', smallerMetadataString.length);
          console.log('URI without image size (chars):', smallerBase64.length);
          
          return `data:application/json;base64,${smallerBase64}`;
        }
        
        // If not too large, use the full metadata
        console.log('Using metadata with image reference');
        console.log('Base64 metadata length:', base64Metadata.length);
        return fullUri;
      } catch (error) {
        console.error('Error adding image to metadata:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        // Fall back to metadata without image
        delete metadataJson.image;
        if (metadataJson.properties && (metadataJson.properties as any).files) {
          (metadataJson.properties as any).files = [];
        }
        
        const fallbackString = JSON.stringify(metadataJson);
        console.log('Using fallback metadata without image, size (bytes):', fallbackString.length);
        return `data:application/json;base64,${Buffer.from(fallbackString).toString('base64')}`;
      }
    }
    
    // No image, just return the basic metadata
    const basicString = JSON.stringify(metadataJson);
    console.log('Using basic metadata without image, size (bytes):', basicString.length);
    return `data:application/json;base64,${Buffer.from(basicString).toString('base64')}`;
  } catch (error) {
    console.error('Error generating metadata URI:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    // Return a minimal valid metadata URI as fallback
    const fallbackJson = {
      name: metadata.name.substring(0, 32),
      symbol: metadata.symbol.substring(0, 10),
      description: '',
      seller_fee_basis_points: 0
    };
    console.log('Using minimal fallback metadata due to error');
    return `data:application/json;base64,${Buffer.from(JSON.stringify(fallbackJson)).toString('base64')}`;
  }
}

/**
 * Generates a complete metadata URI from token metadata
 * For use with external storage solutions
 * 
 * @param metadata The token metadata
 * @returns A JSON object containing the full metadata
 */
export function generateFullMetadata(metadata: TokenMetadata): object {
  // Create the JSON metadata object following Metaplex standards
  const metadataJson = {
    name: metadata.name.substring(0, 32), // Ensure name isn't too long
    symbol: metadata.symbol.substring(0, 10), // Ensure symbol isn't too long
    description: metadata.description || '',
    image: metadata.image || '',
    external_url: metadata.externalUrl || metadata.website || '',
    seller_fee_basis_points: 0,
    attributes: [],
    properties: {
      files: metadata.image ? [{uri: metadata.image, type: "image/png"}] : [],
      category: "image",
    },
    links: {
      twitter: metadata.twitter || '',
      discord: metadata.discord || '',
      telegram: metadata.telegram || '',
      website: metadata.website || '',
    }
  };

  return metadataJson;
}

/**
 * Converts an image file to a data URI
 * 
 * @param file The image file
 * @returns A promise that resolves to a data URI
 */
export function imageFileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting image processing for file:', file.name, 'size:', file.size, 'bytes, type:', file.type);
      
      // Check file size first to avoid processing very large files
      if (file.size > 1024 * 1024) { // 1MB
        console.warn('Image file too large (>1MB), will likely cause issues');
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        try {
          if (typeof reader.result === 'string') {
            console.log('File read complete, data URI length:', reader.result.length);
            
            // Check if the image is too large and resize if needed
            const maxSize = 3 * 1024; // 3KB max to keep transaction size reasonable
            if (reader.result.length > maxSize) {
              console.log('Image too large, resizing from', reader.result.length, 'bytes to target max', maxSize, 'bytes');
              // Resize the image
              resizeImage(reader.result, 64, 64, maxSize).then(resizedImage => {
                if (resizedImage && resizedImage.length > 0) {
                  console.log('Image successfully resized to', resizedImage.length, 'bytes');
                  resolve(resizedImage);
                } else {
                  console.warn('Image resize failed, skipping image');
                  resolve('');
                }
              }).catch(err => {
                console.error('Error resizing image:', err);
                console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
                resolve(''); // Skip image if resize fails
              });
            } else {
              console.log('Image already within size limits:', reader.result.length, 'bytes');
              resolve(reader.result);
            }
          } else {
            console.error('Reader result is not a string, type:', typeof reader.result);
            resolve('');
          }
        } catch (error) {
          console.error('Error processing image data:', error);
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          resolve('');
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        resolve('');
      };
      console.log('Starting file read as data URL');
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error in imageFileToDataUri:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      resolve('');
    }
  });
}

/**
 * Resizes an image to fit within maxSize bytes
 * 
 * @param dataUrl The original image as a data URL
 * @param maxWidth Maximum width of the resized image
 * @param maxHeight Maximum height of the resized image
 * @param maxSizeBytes Maximum size in bytes
 * @returns A promise that resolves to a resized data URL
 */
function resizeImage(dataUrl: string, maxWidth: number, maxHeight: number, maxSizeBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting image resize. Target dimensions:', maxWidth, 'x', maxHeight, 'max bytes:', maxSizeBytes);
      const img = new Image();
      img.onload = () => {
        try {
          console.log('Image loaded for resizing, original dimensions:', img.width, 'x', img.height);
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          console.log('Resized dimensions:', width, 'x', height);
          
          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error('Failed to get canvas context');
            resolve('');
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality settings until we get under maxSizeBytes
          let quality = 0.6; // Start with lower quality
          let result = canvas.toDataURL('image/jpeg', quality);
          console.log('Initial compression with quality', quality, 'resulted in size:', result.length, 'bytes');
          
          let attempts = 0;
          while (result.length > maxSizeBytes && quality > 0.1) {
            attempts++;
            quality -= 0.1;
            result = canvas.toDataURL('image/jpeg', quality);
            console.log('Compression attempt', attempts, 'with quality', quality.toFixed(1), 'resulted in size:', result.length, 'bytes');
          }
          
          if (result.length <= maxSizeBytes) {
            console.log('Final image size after compression:', result.length, 'bytes with quality', quality.toFixed(1));
            resolve(result);
          } else {
            console.log('Image too large even after compression, skipping. Final size:', result.length, 'bytes');
            resolve('');
          }
        } catch (error) {
          console.error('Error in canvas operations:', error);
          console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          resolve('');
        }
      };
      
      img.onerror = (error) => {
        console.error('Failed to load image:', error);
        resolve('');
      };
      
      console.log('Setting image source from data URL');
      img.src = dataUrl;
    } catch (error) {
      console.error('Error in resizeImage:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      resolve('');
    }
  });
} 