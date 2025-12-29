/**
 * Load an image from a URI as an HTMLImageElement
 * React Native Windows compatible image loading with fallbacks
 * 
 * Supports:
 * - HTTP/HTTPS URLs
 * - Data URIs (base64)
 * - Local file paths (via FileReader data URLs)
 * 
 * NO NATIVE MODULES REQUIRED - Pure web API with RNW compatibility
 */

import { createImageElement } from './domPolyfills';

export const loadImageAsHTMLImage = (uri: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Creating image element for:', uri);
      const img = createImageElement();
      setupImageHandlers(img, uri, resolve, reject);
      
    } catch (error) {
      console.error('Error creating image element:', error);
      reject(new Error(`Failed to create image element: ${error}`));
    }
  });
};

/**
 * Setup image event handlers and load image
 */
function setupImageHandlers(
  img: HTMLImageElement, 
  uri: string, 
  resolve: (img: HTMLImageElement) => void, 
  reject: (error: Error) => void
): void {
  // Set up event handlers
  img.onload = () => {
    console.log(`Image loaded successfully: ${img.width}x${img.height}`);
    resolve(img);
  };
  
  img.onerror = (error) => {
    console.error('Image loading error:', error);
    
    // Provide more specific error messages
    let errorMessage = `Failed to load image from ${uri}`;
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      errorMessage += '. This might be due to CORS restrictions or network connectivity issues.';
    } else if (uri.startsWith('data:')) {
      errorMessage += '. The base64 data might be corrupted or invalid.';
    }
    
    reject(new Error(errorMessage));
  };
  
  // Handle CORS for remote images
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    img.crossOrigin = 'anonymous';
    
    // Add a timeout for network requests
    const timeout = setTimeout(() => {
      reject(new Error(`Image loading timeout: ${uri}`));
    }, 30000); // 30 second timeout
    
    const originalOnLoad = img.onload;
    const originalOnError = img.onerror;
    
    img.onload = (event) => {
      clearTimeout(timeout);
      if (originalOnLoad) originalOnLoad.call(img, event);
    };
    
    img.onerror = (event) => {
      clearTimeout(timeout);
      if (originalOnError) originalOnError.call(img, event);
    };
  }
  
  // Start loading the image
  img.src = uri;
}

/**
 * Convert a base64 data URI to an HTMLImageElement
 */
export const loadImageFromBase64 = (base64: string): Promise<HTMLImageElement> => {
  const dataUri = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
  return loadImageAsHTMLImage(dataUri);
};
