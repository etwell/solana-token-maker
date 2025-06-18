'use client';

import React, { ChangeEvent, useState } from 'react';
import { uploadImageToIPFS, uploadLargeImageToIPFS } from '../../utils/printaApi';

interface ImageUploaderProps {
  logoFile: File | null;
  logoPreview: string;
  imageUrl: string;
  uploadedImageUrl: string;
  isUploading: boolean;
  uploadStatus: string | null;
  setLogoFile: (file: File | null) => void;
  setLogoPreview: (url: string) => void;
  setImageUrl: (url: string) => void;
  setUploadedImageUrl: (url: string) => void;
  setIsUploading: (isUploading: boolean) => void;
  setUploadStatus: (status: string | null) => void;
  setError: (error: string | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  logoFile,
  logoPreview,
  imageUrl,
  uploadedImageUrl,
  isUploading,
  uploadStatus,
  setLogoFile,
  setLogoPreview,
  setImageUrl,
  setUploadedImageUrl,
  setIsUploading,
  setUploadStatus,
  setError
}) => {
  // Handle logo file selection
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      // Reset uploaded image URL when a new file is selected
      setUploadedImageUrl('');
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    
    // Try to preview the image
    if (e.target.value) {
      setLogoPreview(e.target.value);
    } else {
      setLogoPreview('');
    }
  };

  // Upload image to IPFS
  const handleUploadImage = async () => {
    if (!logoFile) {
      setError('Please select an image file first');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('Uploading image to IPFS...');
    setError(null);
    
    try {
      console.log('Starting image upload to IPFS...');
      console.log('File details:', {
        name: logoFile.name,
        type: logoFile.type,
        size: logoFile.size
      });
      
      // Check if file is too large (10MB limit)
      if (logoFile.size > 10 * 1024 * 1024) {
        throw new Error('File is too large. Maximum size is 10MB.');
      }
      
      // Use the appropriate upload function based on file size
      let result;
      if (logoFile.size > 4 * 1024 * 1024) {
        // For files larger than 4MB, use the direct upload with signed URL
        result = await uploadLargeImageToIPFS(logoFile);
      } else {
        // For smaller files, use the standard server-side upload
        result = await uploadImageToIPFS(logoFile);
      }
      
      setUploadedImageUrl(result.url);
      setImageUrl(result.url); // Also update the image URL field
      setUploadStatus('Image uploaded successfully to IPFS!');
      
      // Display the IPFS URL
      console.log('IPFS URL:', result.url);
      console.log('IPFS CID:', result.cid);
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Provide more detailed error message
      let errorMessage = 'Failed to upload image';
      
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        
        // Check for specific error types
        if (error.message.includes('NetworkError')) {
          errorMessage += ' - This may be due to network connectivity issues.';
        } else if (error.message.includes('413')) {
          errorMessage += ' - File is too large.';
        }
      } else {
        errorMessage += `: ${String(error)}`;
      }
      
      setError(errorMessage);
      setUploadStatus('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Token Logo
      </label>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* File Upload Section */}
        <div className="flex-1 border border-gray-700 rounded-lg p-4 bg-gray-800/40 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Step 1: Upload Image to IPFS</h3>
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <div className="flex-grow">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <label
                htmlFor="logo-upload"
                className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg cursor-pointer transition-colors shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Choose File
              </label>
            </div>
            
            {logoFile && (
              <span className="text-sm text-gray-300 truncate max-w-xs">
                {logoFile.name} ({Math.round(logoFile.size / 1024)} KB)
              </span>
            )}
          </div>
          
          <div className="flex flex-row gap-4 items-start mb-4">
            {logoPreview && (
              <div className="flex-shrink-0">
                <p className="text-sm text-gray-400 mb-1">Preview:</p>
                <div className="relative w-16 h-16 bg-gray-800 rounded-md overflow-hidden border border-gray-700">
                  <img
                    src={logoPreview}
                    alt="Token Logo Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
            
            <div className="flex-grow">
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={!logoFile || isUploading}
                className={`w-full px-4 py-3 rounded-lg transition-colors shadow-md ${
                  !logoFile || isUploading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white'
                }`}
              >
                <div className="flex items-center justify-center">
                  {isUploading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  )}
                  {isUploading ? 'Uploading...' : 'Upload to IPFS'}
                </div>
              </button>
              
              {uploadStatus && (
                <p className={`mt-2 text-sm ${uploadedImageUrl ? 'text-green-400' : 'text-gray-400'}`}>
                  {uploadStatus}
                </p>
              )}
            </div>
          </div>
          
          {uploadedImageUrl && (
            <div className="mt-2 p-2 bg-green-900/20 rounded-md border border-green-500/30">
              <p className="text-sm text-green-400 break-all">
                <span className="font-medium">Image URL:</span> {uploadedImageUrl}
              </p>
            </div>
          )}
        </div>
        
        {/* Image URL Section */}
        <div className="flex-1 border border-gray-700 rounded-lg p-4 bg-gray-800/40 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Step 2: Confirm IPFS Image URL</h3>
          <input
            type="text"
            value={imageUrl}
            onChange={handleImageUrlChange}
            placeholder="IPFS URL from Step 1 or enter manually"
            className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
          />
          <p className="mt-2 text-xs text-gray-400">
            The IPFS URL should be automatically filled from Step 1, or you can enter it manually
          </p>
          {imageUrl && !imageUrl.startsWith('https://ipfs.io/') && !imageUrl.startsWith('ipfs://') && (
            <p className="mt-2 text-xs text-yellow-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              URL doesn't appear to be an IPFS URL. For best compatibility, use IPFS URLs.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader; 