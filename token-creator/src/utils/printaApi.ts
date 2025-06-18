/**
 * Printa API integration for image uploads and metadata hosting
 */

/**
 * Upload an image to Printa
 * 
 * @param file The image file to upload
 * @returns The IPFS URL of the uploaded image
 */
export async function uploadImageToPrinta(file: File): Promise<string> {
  try {
    console.log('Uploading image to Printa via proxy:', file.name, file.size, 'bytes');
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Use our proxy API route instead of calling Printa directly
    const response = await fetch('/api/printa-proxy?endpoint=upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Printa API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Printa image upload response:', data);
    
    if (data.ipfs_url) {
      console.log('Image uploaded successfully to IPFS:', data.ipfs_url);
      return data.ipfs_url;
    } else {
      throw new Error('No IPFS URL in Printa response');
    }
  } catch (error) {
    console.error('Error uploading image to Printa:', error);
    throw error;
  }
}

/**
 * Upload token metadata to Printa
 * 
 * @param metadata The token metadata
 * @returns The IPFS URL of the uploaded metadata
 */
export async function uploadMetadataToPrinta(metadata: any): Promise<string> {
  try {
    console.log('Uploading metadata to Printa via proxy:', metadata);
    
    // Use our proxy API route instead of calling Printa directly
    const response = await fetch('/api/printa-proxy?endpoint=json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Printa API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Printa metadata upload response:', data);
    
    if (data.ipfs_url) {
      console.log('Metadata uploaded successfully to IPFS:', data.ipfs_url);
      return data.ipfs_url;
    } else {
      throw new Error('No IPFS URL in Printa response');
    }
  } catch (error) {
    console.error('Error uploading metadata to Printa:', error);
    throw error;
  }
}

/**
 * Client-side API functions for uploading files and metadata to IPFS
 */

/**
 * Upload an image to IPFS via the server-side API
 * 
 * @param file The image file to upload
 * @returns The IPFS URL and CID of the uploaded image
 */
export async function uploadImageToIPFS(file: File): Promise<{ url: string, cid: string }> {
  try {
    console.log('Uploading image to IPFS:', file.name, file.size, 'bytes');
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Use the server-side API route
    const response = await fetch('/api/files', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Image upload response:', data);
    
    if (!data.url || !data.cid) {
      throw new Error('Invalid response from API');
    }
    
    return { url: data.url, cid: data.cid };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Upload token metadata to IPFS via the server-side API
 * 
 * @param metadata The token metadata
 * @returns The IPFS URL and CID of the uploaded metadata
 */
export async function uploadMetadataToIPFS(metadata: any): Promise<{ url: string, cid: string }> {
  try {
    console.log('Uploading metadata to IPFS:', metadata);
    
    // Use the server-side API route
    const response = await fetch('/api/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Metadata upload response:', data);
    
    if (!data.url || !data.cid) {
      throw new Error('Invalid response from API');
    }
    
    return { url: data.url, cid: data.cid };
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw error;
  }
}

/**
 * Upload an image to IPFS directly from the client using a signed URL
 * This is useful for larger files that might exceed API route limits
 * 
 * @param file The image file to upload
 * @returns The IPFS URL and CID of the uploaded image
 */
export async function uploadLargeImageToIPFS(file: File): Promise<{ url: string, cid: string }> {
  try {
    console.log('Uploading large image to IPFS:', file.name, file.size, 'bytes');
    
    // Get a signed URL from the server
    const urlResponse = await fetch('/api/url');
    if (!urlResponse.ok) {
      throw new Error(`Failed to get signed URL: ${urlResponse.status}`);
    }
    
    const { url: signedUrl } = await urlResponse.json();
    
    // Create a form data object for the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload directly to Pinata using the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload error (${uploadResponse.status}): ${errorText}`);
    }
    
    const data = await uploadResponse.json();
    console.log('Direct upload response:', data);
    
    if (!data.IpfsHash) {
      throw new Error('Invalid response from Pinata');
    }
    
    // Convert the CID to a gateway URL using our server endpoint
    const gatewayResponse = await fetch(`/api/gateway?cid=${data.IpfsHash}`);
    const { url } = await gatewayResponse.json();
    
    return { url, cid: data.IpfsHash };
  } catch (error) {
    console.error('Error uploading large image:', error);
    throw error;
  }
} 