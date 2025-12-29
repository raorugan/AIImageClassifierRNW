/**
 * TensorFlow.js setup utilities for React Native Windows
 * This ensures proper initialization and error handling for first-time model downloads
 */

import * as tf from '@tensorflow/tfjs';

export const initializeTensorFlow = async (): Promise<void> => {
  try {
    console.log('🔧 Initializing TensorFlow.js for React Native Windows...');
    
    // Verify fetch is available
    if (typeof fetch === 'undefined') {
      throw new Error('Fetch API is not available. Polyfills may not have loaded correctly.');
    }
    console.log('✅ Fetch API is available');
    
    // Configure TensorFlow.js environment
    tf.env().set('IS_BROWSER', true);
    tf.env().set('IS_NODE', false);
    tf.env().set('WEBGL_RENDER_FLOAT32_CAPABLE', false);
    tf.env().set('WEBGL_RENDER_FLOAT32_ENABLED', false);
    
    // Check available backends
    console.log('🔍 Checking available TensorFlow.js backends...');
    
    // Force CPU backend for React Native Windows compatibility
    try {
      await tf.setBackend('cpu');
      await tf.ready();
      console.log('✅ TensorFlow.js CPU backend initialized successfully');
    } catch (backendError) {
      console.warn('⚠️ Failed to set CPU backend, trying default:', backendError);
      await tf.ready();
    }
    
    console.log('📊 Active backend:', tf.getBackend());
    console.log('🎯 TensorFlow.js version:', tf.version.tfjs);
    
  } catch (error) {
    console.error('❌ Failed to initialize TensorFlow.js:', error);
    throw new Error(`TensorFlow.js initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Test network connectivity by attempting to fetch a small resource
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch (error) {
    console.warn('Network connectivity check failed:', error);
    return false;
  }
};

export const downloadModelWithRetry = async <T>(
  downloadFunction: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📥 Model download attempt ${attempt}/${maxRetries}`);
      
      // Check network connectivity before attempting download
      const hasNetwork = await checkNetworkConnectivity();
      if (!hasNetwork) {
        throw new Error('No network connectivity detected');
      }
      
      const result = await downloadFunction();
      console.log(`✅ Model downloaded successfully on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown download error');
      console.error(`❌ Download attempt ${attempt} failed:`, lastError.message);
      
      // Log more details about fetch errors
      if (lastError.message.includes('fetch')) {
        console.error('🔍 Fetch error details:', {
          fetchAvailable: typeof fetch !== 'undefined',
          globalFetch: typeof (global as any).fetch !== 'undefined',
          error: lastError.message
        });
      }
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 1.5; // Exponential backoff
      }
    }
  }
  
  throw new Error(`Failed to download model after ${maxRetries} attempts. Last error: ${lastError?.message}`);
};

// Add a direct model download test function
export const testModelDownload = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing model download capability...');
    
    // Test a simple fetch first
    const testUrl = 'https://www.gstatic.com/hostedmodels/saved_models/vision/classification/mobilenet_v2_100_224/feature_vector/3/1.json';
    const response = await fetch(testUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Model metadata fetch test successful');
    return true;
    
  } catch (error) {
    console.error('❌ Model download test failed:', error);
    return false;
  }
};