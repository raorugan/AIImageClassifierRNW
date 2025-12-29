import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-core';
import * as mobilenet from '@tensorflow-models/mobilenet';
import type { Prediction } from '../types';
import { loadImageAsHTMLImage } from '../utils/imageUtils';
import { initializeTensorFlow, downloadModelWithRetry } from '../utils/tensorflowSetup';
import { OfflineModelManager, createSimpleOfflineModel } from '../utils/offlineModel';

export const useImageClassifier = () => {
  const [model, setModel] = useState<mobilenet.MobileNet | any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<string>('');

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('🚀 Setting up TensorFlow.js for React Native Windows...');
        
        // Initialize TensorFlow.js with proper backend configuration
        await initializeTensorFlow();
        
        // Test model download capability using comprehensive diagnostics
        console.log('🧪 Running comprehensive network diagnostics...');
        const diagnostics = await runNetworkDiagnostics();
        console.log('📊 Network diagnostics result:', diagnostics);
        
        if (diagnostics.overall === 'fail') {
          const failedTests = diagnostics.diagnostics.filter(d => d.status === 'fail');
          const errorDetails = failedTests.map(t => `• ${t.message}`).join('\n');
          const recommendations = diagnostics.recommendations.map(r => `• ${r}`).join('\n');
          throw new Error(`Network issues detected:\n${errorDetails}\n\nTroubleshooting:\n${recommendations}`);
        }
        
        // Test different download strategies
        console.log('🔄 Testing model download strategies...');
        const strategies = await testModelDownloadStrategies();
        console.log('📈 Strategy results:', strategies);
        
        const successfulStrategy = strategies.find(s => s.success);
        if (!successfulStrategy && diagnostics.overall !== 'pass') {
          const strategyErrors = strategies.map(s => `${s.strategy}: ${s.error || 'Failed'}`).join('\n');
          throw new Error(`All download strategies failed:\n${strategyErrors}\n\nRecommendations:\n${diagnostics.recommendations.join('\n')}`);
        }
        
        console.log('📥 Loading MobileNet model...');
        
        // Download model with retry logic for better reliability
        const loadedModel = await downloadModelWithRetry(async () => {
          console.log('🔄 Attempting to load MobileNet v2...');
          const model = await mobilenet.load({
            version: 2,
            alpha: 1.0,
          });
          console.log('📦 MobileNet model loaded successfully');
          return model;
        });
        
        console.log('✅ MobileNet model ready for classification');
        setModel(loadedModel);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading model';
        console.error('❌ Error loading model:', errorMessage);
        console.error('🔍 Full error details:', err);
        
        console.log('🔄 Attempting to initialize offline mode as fallback...');
        try {
          const fallbackClassifier = createOfflineClassifier();
          await fallbackClassifier.initialize();
          setOfflineClassifier(fallbackClassifier);
          setIsOfflineMode(true);
          setIsLoading(false);
          console.log('✅ Offline mode activated - basic color-based classification available');
          setError('Online model unavailable - using offline mode with basic classification');
          return;
        } catch (offlineError) {
          console.error('❌ Failed to initialize offline mode:', offlineError);
        }
        
        // Provide more specific error messages
        let userFriendlyMessage = errorMessage;
        if (errorMessage.includes('fetch')) {
          userFriendlyMessage = 'Network error: Unable to download model. The fetch API is not available or not working properly.';
        } else if (errorMessage.includes('network')) {
          userFriendlyMessage = 'No internet connection detected. Please connect to the internet and try again.';
        } else if (errorMessage.includes('CORS')) {
          userFriendlyMessage = 'Network security error. The model download was blocked by CORS policy.';
        } else if (errorMessage.includes('download test failed')) {
          userFriendlyMessage = 'Model download test failed. Please check your internet connection and firewall settings.';
        }
        
        // Log diagnostic information
        console.error('🔍 Diagnostic information:', {
          fetchAvailable: typeof fetch !== 'undefined',
          globalFetch: !!global.fetch,
          navigator: typeof navigator !== 'undefined' ? navigator.userAgent : 'Not available',
          tfVersion: tf.version?.tfjs || 'Unknown',
          backend: tf.getBackend(),
        });
        
        setError(userFriendlyMessage);
        setIsLoading(false);
      }
    };

    loadModel();

    // Cleanup - TensorFlow.js will handle cleanup automatically
    return () => {
      // TensorFlow.js will handle cleanup automatically
    };
  }, []);

  const classifyImage = async (imageUri: string): Promise<Prediction[]> => {
    try {
      console.log('🖼️ Loading image:', imageUri);
      const img = await loadImageAsHTMLImage(imageUri);
      
      if (model && !isOfflineMode) {
        // Use online MobileNet model
        console.log('🤖 Using online MobileNet model for classification...');
        const startTime = performance.now();
        
        const predictions = await model.classify(img);
        
        const inferenceTime = performance.now() - startTime;
        console.log(`✅ Online classification completed in ${inferenceTime.toFixed(2)}ms`);

        const results: Prediction[] = predictions.map(pred => ({
          className: pred.className,
          probability: pred.probability,
        }));

        return results;
        
      } else if (offlineClassifier && isOfflineMode) {
        // Use offline fallback classifier
        console.log('🔧 Using offline color-based classifier...');
        const startTime = performance.now();
        
        const predictions = await offlineClassifier.classifyImage(img);
        
        const inferenceTime = performance.now() - startTime;
        console.log(`✅ Offline classification completed in ${inferenceTime.toFixed(2)}ms`);

        const results: Prediction[] = predictions.map(pred => ({
          className: `[Offline] ${pred.className}`,
          probability: pred.probability,
        }));

        return results;
      } else {
        throw new Error('No classification model available (neither online nor offline)');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during classification';
      console.error('❌ Classification error:', errorMessage);
      throw new Error(`Failed to classify image: ${errorMessage}`);
    }
  };

  return {
    model,
    isLoading,
    error,
    classifyImage,
    isOfflineMode,
    offlineClassifier,
  };
};
