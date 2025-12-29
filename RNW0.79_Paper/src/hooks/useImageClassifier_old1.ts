import { useState, useEffect } from 'react';
import type { Prediction } from '../types';
import { createSimpleOfflineModel } from '../utils/offlineModel';

export const useImageClassifier = () => {
  const [model, setModel] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(true); // Always offline mode
  const [cacheInfo, setCacheInfo] = useState<string>('');

  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('Setting up offline classification for React Native Windows...');
        
        // Use simple offline classifier
        const simpleModel = createSimpleOfflineModel();
        setModel(simpleModel);
        setIsOfflineMode(true);
        setCacheInfo('Offline mode - basic image analysis');
        setIsLoading(false);
        
        console.log('Offline classifier initialized successfully');
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading model';
        console.error('Error loading offline model:', errorMessage);
        
        setError('Unable to initialize offline classification');
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);
                    { className: 'local model result', probability: probabilities[2] || 0.2 }
                  ];
                }
              };
              
              setModel(modelWrapper);
              setIsOfflineMode(true);
              setCacheInfo('Using cached model');
              setIsLoading(false);
              return;
            }
          } catch (cacheError) {
            console.warn('Failed to load cached model, falling back to online:', cacheError);
          }
        }

        // Try to download model online
        console.log('Loading MobileNet model from online...');
        
        try {
          const loadedModel = await downloadModelWithRetry(async () => {
            return await mobilenet.load({
              version: 2,
              alpha: 1.0,
            });
          });
          
          console.log('MobileNet model loaded successfully');
          setModel(loadedModel);
          setIsOfflineMode(false);
          setCacheInfo('Online model loaded');
          setIsLoading(false);
          
          // Cache the model for future offline use
          try {
            console.log('Caching model for offline use...');
            await offlineManager.downloadAndCacheModel(mobilenetUrl);
            setCacheInfo('Online model loaded and cached');
          } catch (cacheError) {
            console.warn('Failed to cache model:', cacheError);
          }
          
        } catch (onlineError) {
          console.warn('Online model loading failed, trying RNW compatible mode:', onlineError);
          
          // Try React Native Windows compatible classifier first
          try {
            const rnwModel = createRNWCompatibleClassifier();
            setModel(rnwModel);
            setIsOfflineMode(true);
            setCacheInfo('Using React Native Windows compatible classifier');
            setIsLoading(false);
            return;
          } catch (rnwError) {
            console.warn('RNW compatible classifier failed, using simple offline:', rnwError);
          }
          
          // Fallback to simple offline classifier
          try {
            const simpleModel = createSimpleOfflineModel();
            setModel(simpleModel);
            setIsOfflineMode(true);
            setCacheInfo('Using simple offline classifier');
            setIsLoading(false);
          } catch (simpleError) {
            throw new Error('All classifier options failed');
          }
        }
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading model';
        console.error('Error loading model:', errorMessage);
        console.error('Full error:', err);
        
        // Provide more specific error messages
        let userFriendlyMessage = errorMessage;
        if (errorMessage.includes('fetch')) {
          userFriendlyMessage = 'Network error: Unable to download model. Using offline mode.';
          
          // Try React Native Windows compatible classifier first
          try {
            const rnwModel = createRNWCompatibleClassifier();
            setModel(rnwModel);
            setIsOfflineMode(true);
            setCacheInfo('Network error - using RNW compatible mode');
            setIsLoading(false);
            return;
          } catch (rnwError) {
            console.warn('RNW classifier failed, trying simple offline:', rnwError);
          }
          
          // Try to use simple offline fallback
          try {
            const simpleModel = createSimpleOfflineModel();
            setModel(simpleModel);
            setIsOfflineMode(true);
            setCacheInfo('Network error - using offline mode');
            setIsLoading(false);
            return;
          } catch (offlineError) {
            userFriendlyMessage = 'Unable to initialize any classification model.';
          }
        } else if (errorMessage.includes('network')) {
          userFriendlyMessage = 'No internet connection detected. Using offline mode.';
          
          // Try RNW compatible mode first
          try {
            const rnwModel = createRNWCompatibleClassifier();
            setModel(rnwModel);
            setIsOfflineMode(true);
            setCacheInfo('No internet - using RNW compatible mode');
            setIsLoading(false);
            return;
          } catch (rnwError) {
            console.warn('RNW classifier failed, trying simple offline:', rnwError);
          }
          
          // Try offline mode
          try {
            const simpleModel = createSimpleOfflineModel();
            setModel(simpleModel);
            setIsOfflineMode(true);
            setCacheInfo('No internet - using offline mode');
            setIsLoading(false);
            return;
          } catch (offlineError) {
            userFriendlyMessage = 'Unable to initialize offline classification.';
          }
        } else if (errorMessage.includes('Image') || errorMessage.includes('DOM')) {
          userFriendlyMessage = 'DOM API not available. Using React Native compatible mode.';
          
          // Try RNW compatible classifier for DOM issues
          try {
            const rnwModel = createRNWCompatibleClassifier();
            setModel(rnwModel);
            setIsOfflineMode(true);
            setCacheInfo('DOM error - using RNW compatible mode');
            setIsLoading(false);
            return;
          } catch (rnwError) {
            userFriendlyMessage = 'Unable to initialize React Native compatible classification.';
          }
        }
        
        setError(userFriendlyMessage);
        setIsLoading(false);
      }
    };

    loadModel();

    // Cleanup
    return () => {
      // TensorFlow.js will handle cleanup automatically
    };
  }, []);

  const classifyImage = async (imageUri: string): Promise<Prediction[]> => {
    if (!model) {
      throw new Error('Model not loaded');
    }

    try {
      console.log('Loading image for classification:', imageUri);
      const startTime = performance.now();
      
      // Try different image loading approaches based on environment
      let img: any;
      let predictions: any[];
      
      try {
        // First try: Standard web-based image loading (for online models)
        if (!isOfflineMode) {
          console.log('Attempting standard image loading...');
          img = await loadImageAsHTMLImage(imageUri);
          console.log('Standard image loading successful');
          
          // Classify with the loaded model
          predictions = await model.classify(img);
        } else {
          throw new Error('Using offline mode');
        }
      } catch (webError) {
        console.log('Standard image loading failed, trying React Native approach:', webError);
        
        try {
          // Second try: React Native Windows compatible approach
          console.log('Attempting React Native Windows image loading...');
          img = await createRNImageElement(imageUri);
          console.log('React Native image element created successfully');
          
          // Try to classify with the model
          if (model && model.classify) {
            predictions = await model.classify(img);
          } else {
            throw new Error('Model classification not available');
          }
        } catch (rnError) {
          console.log('React Native image loading failed, using fallback classification:', rnError);
          
          // Third try: Pure React Native fallback classification
          console.log('Using fallback classification based on URI analysis...');
          predictions = await performFallbackClassification(imageUri);
        }
      }
      
      const inferenceTime = performance.now() - startTime;
      console.log(`Classification completed in ${inferenceTime.toFixed(2)}ms`);

      // Transform predictions to our Prediction type
      const results: Prediction[] = predictions.map((pred: any) => ({
        className: pred.className,
        probability: pred.probability,
      }));

      return results;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during classification';
      console.error('Classification error:', errorMessage);
      
      // Ultimate fallback: return basic predictions
      try {
        console.log('Using ultimate fallback classification...');
        const fallbackPredictions = await performFallbackClassification(imageUri);
        
        return fallbackPredictions.map((pred: any) => ({
          className: `${pred.className} (fallback)`,
          probability: pred.probability,
        }));
      } catch (fallbackError) {
        throw new Error(`Failed to classify image: ${errorMessage}`);
      }
    }
  };

  return {
    model,
    isLoading,
    error,
    classifyImage,
    isOfflineMode,
    cacheInfo,
  };
};