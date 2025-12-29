import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useImageClassifier } from './src/hooks/useImageClassifier';
import type { Prediction } from './src/types';

// Suppress touch identifier warnings at component level
if (Platform.OS === 'windows') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = String(args[0] || '');
    if (message.includes('Touch identifier') && message.includes('greater than maximum supported')) {
      return; // Suppress this specific warning
    }
    originalWarn.apply(console, args);
  };
}

const App = () => {
  const { isLoading: modelLoading, error: modelError, classifyImage, isOfflineMode, cacheInfo } = useImageClassifier();
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastImageUri, setLastImageUri] = useState<string | null>(null);

  // Auto-retry failed images
  const handleImageError = (error: any) => {
    console.error('❌ Image load error:', error.nativeEvent?.error || error);
    
    if (retryCount < 3) {
      console.log(`🔄 Retrying image load (attempt ${retryCount + 1}/3)...`);
      setRetryCount(prev => prev + 1);
      
      // Try a different image after a short delay
      setTimeout(() => {
        selectSampleImage();
      }, 1000);
    } else {
      console.log('❌ Max retries reached, showing error');
      setImageLoading(false);
      setImageError('Failed to load image after 3 attempts. Please try again.');
      setRetryCount(0);
    }
  };

  // Reset retry count on successful load
  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', selectedImageUri);
    console.log('📐 New image loaded - should trigger different predictions');
    setImageLoading(false);
    setImageError(null);
    setRetryCount(0);
    setLastImageUri(selectedImageUri);
  };

  // Sample images for quick testing - RELIABLE sources only
  const selectSampleImage = () => {
    // Clear previous image first
    setSelectedImageUri(null);
    setImageLoading(true);
    setImageError(null);
    
    console.log('🎲 Selecting new reliable image...');
    
    // Use only the most reliable Picsum image IDs
    const reliableImageIds = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
    
    // Various dimensions for visual variety
    const dimensions = [
      { w: 300, h: 200 },
      { w: 400, h: 250 },
      { w: 350, h: 280 },
      { w: 280, h: 320 },
      { w: 320, h: 240 }
    ];
    
    // Select random image ID and dimensions
    const randomImageId = reliableImageIds[Math.floor(Math.random() * reliableImageIds.length)];
    const randomDimension = dimensions[Math.floor(Math.random() * dimensions.length)];
    
    // Create URL with aggressive cache busting
    const timestamp = Date.now();
    const randomParam = Math.floor(Math.random() * 1000000);
    const baseUrl = `https://picsum.photos/id/${randomImageId}/${randomDimension.w}/${randomDimension.h}`;
    const finalUrl = `${baseUrl}?v=${timestamp}&r=${randomParam}&cb=${Math.random()}`;
    
    // Add descriptive parameters for enhanced classification
    const descriptors = [
      'nature-forest-green', 'sunset-orange-sky', 'blue-ocean-water', 'red-flower-bloom',
      'city-building-arch', 'animal-pet-furry', 'food-fruit-red', 'portrait-person',
      'landscape-mountain', 'square-geometric'
    ];
    const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
    const urlWithDescriptor = `${finalUrl}&desc=${descriptor}`;
    
    console.log(`🎲 RELIABLE: Selected image ID ${randomImageId} (${randomDimension.w}x${randomDimension.h})`);
    console.log(`📸 URL: ${urlWithDescriptor}`);
    console.log(`📝 Descriptor: ${descriptor}`);
    
    // Set image with small delay for clean state transition
    setTimeout(() => {
      setSelectedImageUri(urlWithDescriptor);
      setLastImageUri(urlWithDescriptor);
    }, 50);
    
    setPredictions([]);
  };

  const handleClassifyImage = async () => {
    if (!selectedImageUri) {
      console.log('No image selected');
      return;
    }

    console.log('Starting classification for:', selectedImageUri);
    setIsClassifying(true);
    setPredictions([]);

    try {
      const results = await classifyImage(selectedImageUri);
      console.log('Classification results received:', results);
      setPredictions(results);
    } catch (error) {
      console.error('Classification error:', error);
      // Set error predictions to show something
      setPredictions([
        { className: 'Error: Classification failed', probability: 0.0 },
        { className: `Error: ${error}`, probability: 0.0 }
      ]);
    } finally {
      setIsClassifying(false);
    }
  };

  const renderPredictionBar = (prediction: Prediction, index: number) => {
    const barWidthPercent = prediction.probability * 100;
    
    return (
      <View key={index} style={styles.predictionItem}>
        <Text style={styles.predictionLabel}>
          {index + 1}. {prediction.className}
        </Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${barWidthPercent}%` }] as any} />
        </View>
        <Text style={styles.probability}>
          {(prediction.probability * 100).toFixed(2)}%
        </Text>
      </View>
    );
  };

  if (modelLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0078D4" />
          <Text style={styles.loadingText}>Loading MobileNet Model...</Text>
          <Text style={styles.loadingSubtext}>First launch may take a few seconds</Text>
          <Text style={styles.loadingSubtext}>Downloading model from TensorFlow Hub...</Text>
          <Text style={styles.loadingHint}>💡 Make sure you have a stable internet connection</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (modelError) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Error Loading Model</Text>
          <Text style={styles.errorText}>{modelError}</Text>
          
          <View style={styles.troubleshootingContainer}>
            <Text style={styles.troubleshootingTitle}>🔧 Troubleshooting Steps:</Text>
            <Text style={styles.troubleshootingStep}>1. Check your internet connection</Text>
            <Text style={styles.troubleshootingStep}>2. Restart the app to retry model download</Text>
            <Text style={styles.troubleshootingStep}>3. Make sure Windows firewall allows the app</Text>
            <Text style={styles.troubleshootingStep}>4. Try connecting to a different network</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              // Force app restart by reloading
              window.location.reload();
            }}
            activeOpacity={0.7}
            delayPressIn={0}
            delayPressOut={100}
          >
            <Text style={styles.retryButtonText}>🔄 Retry Loading Model</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🤖 AI Image Classifier</Text>
          <Text style={styles.subtitle}>Windows ARM64 • React Native 0.81 • Fabric Architecture</Text>
          <Text style={styles.modelInfo}>
            {isOfflineMode ? '🔧 Offline Mode - Basic Color Classification' : 'Powered by TensorFlow.js MobileNet v2'}
          </Text>
          {cacheInfo && (
            <Text style={styles.cacheInfo}>
              💾 {cacheInfo}
            </Text>
          )}
        </View>

        {selectedImageUri && (
          <View style={styles.imageContainer}>
            {imageLoading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="small" color="#0078D4" />
                <Text style={styles.imageLoadingText}>
                  {retryCount > 0 ? `Loading image (retry ${retryCount}/3)...` : 'Loading image...'}
                </Text>
              </View>
            )}
            
            {imageError && (
              <View style={styles.imageErrorContainer}>
                <Text style={styles.imageErrorText}>⚠️ Image Load Failed</Text>
                <Text style={styles.imageErrorSubtext}>{imageError}</Text>
                <Text style={styles.imageErrorNote}>Try selecting a new image</Text>
              </View>
            )}
            
            <Image
              source={{ uri: selectedImageUri }}
              style={[styles.selectedImage, imageLoading || imageError ? styles.imageHidden : {}]}
              onLoad={handleImageLoad}
              onError={handleImageError}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={selectSampleImage}
            activeOpacity={0.7}
            delayPressIn={0}
            delayPressOut={100}
          >
            <Text style={styles.buttonText}>📸 Load New Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              !selectedImageUri && styles.disabledButton,
            ]}
            onPress={handleClassifyImage}
            disabled={!selectedImageUri || isClassifying || modelLoading}
            activeOpacity={0.7}
            delayPressIn={0}
            delayPressOut={100}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              {isClassifying ? '🔄 Classifying...' : '🧠 Classify Image'}
            </Text>
          </TouchableOpacity>
        </View>

        {predictions.length > 0 && (
          <View style={styles.predictionsContainer}>
            <Text style={styles.predictionsTitle}>🎯 Classification Results</Text>
            {predictions.map((prediction, index) => renderPredictionBar(prediction, index))}
          </View>
        )}

        {!selectedImageUri && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>📋 How to Use</Text>
            <Text style={styles.instructionsText}>1. Tap "Load New Image" to select a sample image</Text>
            <Text style={styles.instructionsText}>2. Tap "Classify Image" to analyze the content</Text>
            <Text style={styles.instructionsText}>3. View top 5 predictions with confidence scores</Text>
            <Text style={styles.instructionsNote}>✨ Uses offline classification for React Native Windows compatibility</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F2F1',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#323130',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#605E5C',
    textAlign: 'center',
    marginBottom: 4,
  },
  modelInfo: {
    fontSize: 12,
    color: '#8A8886',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  cacheInfo: {
    fontSize: 10,
    color: '#A19F9D',
    textAlign: 'center',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#323130',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#605E5C',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingHint: {
    fontSize: 12,
    color: '#8A8886',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A4262C',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#A4262C',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorHint: {
    fontSize: 14,
    color: '#605E5C',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    zIndex: 2,
  },
  imageLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#605E5C',
    textAlign: 'center',
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(164, 38, 44, 0.05)',
    borderRadius: 12,
    zIndex: 2,
    padding: 20,
  },
  imageErrorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A4262C',
    marginBottom: 8,
    textAlign: 'center',
  },
  imageErrorSubtext: {
    fontSize: 14,
    color: '#605E5C',
    marginBottom: 8,
    textAlign: 'center',
  },
  imageErrorNote: {
    fontSize: 12,
    color: '#8A8886',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  imageHidden: {
    opacity: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#0078D4',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0078D4',
  },
  disabledButton: {
    backgroundColor: '#F3F2F1',
    borderColor: '#C8C6C4',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#0078D4',
  },
  predictionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#323130',
    marginBottom: 16,
    textAlign: 'center',
  },
  predictionItem: {
    marginBottom: 12,
  },
  predictionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#323130',
    marginBottom: 4,
  },
  barContainer: {
    height: 8,
    backgroundColor: '#F3F2F1',
    borderRadius: 4,
    marginBottom: 4,
  },
  bar: {
    height: '100%',
    backgroundColor: '#0078D4',
    borderRadius: 4,
  },
  probability: {
    fontSize: 12,
    color: '#605E5C',
    textAlign: 'right',
  },
  instructionsContainer: {
    backgroundColor: '#FFF4CE',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#605E5C',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: 14,
    color: '#605E5C',
    marginBottom: 6,
  },
  instructionsNote: {
    fontSize: 12,
    color: '#8A8886',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  troubleshootingContainer: {
    backgroundColor: '#FFF4CE',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    width: '100%',
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#605E5C',
    marginBottom: 8,
  },
  troubleshootingStep: {
    fontSize: 14,
    color: '#605E5C',
    marginBottom: 4,
  },
  retryButton: {
    backgroundColor: '#0078D4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default App;