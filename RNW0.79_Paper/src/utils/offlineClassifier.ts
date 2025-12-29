/**
 * Offline model fallback for React Native Windows
 * Provides basic image classification when online models fail
 */

import * as tf from '@tensorflow/tfjs';

export interface FallbackPrediction {
  className: string;
  probability: number;
}

/**
 * Simple color-based image classifier as fallback
 * Analyzes dominant colors and makes basic predictions
 */
export class OfflineImageClassifier {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('🔄 Initializing offline image classifier...');
    this.initialized = true;
    console.log('✅ Offline classifier ready');
  }

  async classifyImage(imageElement: HTMLImageElement): Promise<FallbackPrediction[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve([
          { className: 'unknown object', probability: 0.5 },
          { className: 'image', probability: 0.3 },
          { className: 'picture', probability: 0.2 },
        ]);
        return;
      }

      // Set canvas size
      canvas.width = 224;
      canvas.height = 224;
      
      // Draw image
      ctx.drawImage(imageElement, 0, 0, 224, 224);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, 224, 224);
      const data = imageData.data;
      
      // Analyze colors
      const colorAnalysis = this.analyzeColors(data);
      
      // Generate predictions based on color analysis
      const predictions = this.generatePredictions(colorAnalysis);
      
      resolve(predictions);
    });
  }

  private analyzeColors(data: Uint8ClampedArray): {
    dominantColor: string;
    brightness: number;
    colorfulness: number;
    greenness: number;
    blueness: number;
    redness: number;
  } {
    let totalR = 0, totalG = 0, totalB = 0;
    let brightness = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      totalR += r;
      totalG += g;
      totalB += b;
      brightness += (r + g + b) / 3;
    }

    const avgR = totalR / pixelCount;
    const avgG = totalG / pixelCount;
    const avgB = totalB / pixelCount;
    const avgBrightness = brightness / pixelCount;

    const max = Math.max(avgR, avgG, avgB);
    const min = Math.min(avgR, avgG, avgB);
    const colorfulness = (max - min) / 255;

    let dominantColor = 'gray';
    if (avgR > avgG && avgR > avgB) dominantColor = 'red';
    else if (avgG > avgR && avgG > avgB) dominantColor = 'green';
    else if (avgB > avgR && avgB > avgG) dominantColor = 'blue';

    return {
      dominantColor,
      brightness: avgBrightness / 255,
      colorfulness,
      greenness: avgG / 255,
      blueness: avgB / 255,
      redness: avgR / 255,
    };
  }

  private generatePredictions(analysis: {
    dominantColor: string;
    brightness: number;
    colorfulness: number;
    greenness: number;
    blueness: number;
    redness: number;
  }): FallbackPrediction[] {
    const predictions: FallbackPrediction[] = [];

    // Nature/outdoor predictions
    if (analysis.greenness > 0.4 && analysis.colorfulness > 0.3) {
      predictions.push({ className: 'tree, plant life', probability: 0.7 });
      predictions.push({ className: 'forest, vegetation', probability: 0.6 });
      predictions.push({ className: 'garden, nature', probability: 0.5 });
    }

    // Sky/water predictions
    if (analysis.blueness > 0.4) {
      predictions.push({ className: 'sky, blue sky', probability: 0.6 });
      predictions.push({ className: 'water, ocean', probability: 0.5 });
      predictions.push({ className: 'lake, blue water', probability: 0.4 });
    }

    // Bright/light objects
    if (analysis.brightness > 0.7) {
      predictions.push({ className: 'white object, bright surface', probability: 0.5 });
      predictions.push({ className: 'light, illumination', probability: 0.4 });
      predictions.push({ className: 'snow, white material', probability: 0.3 });
    }

    // Dark objects
    if (analysis.brightness < 0.3) {
      predictions.push({ className: 'dark object, shadow', probability: 0.5 });
      predictions.push({ className: 'night scene, darkness', probability: 0.4 });
      predictions.push({ className: 'black object, dark surface', probability: 0.3 });
    }

    // Colorful objects
    if (analysis.colorfulness > 0.5) {
      predictions.push({ className: 'colorful object, vibrant', probability: 0.6 });
      predictions.push({ className: 'artwork, decoration', probability: 0.4 });
      predictions.push({ className: 'flower, colorful item', probability: 0.3 });
    }

    // Red objects
    if (analysis.redness > 0.4) {
      predictions.push({ className: 'red object, food item', probability: 0.5 });
      predictions.push({ className: 'fruit, tomato', probability: 0.4 });
      predictions.push({ className: 'fire, red material', probability: 0.3 });
    }

    // Default predictions if nothing specific
    if (predictions.length === 0) {
      predictions.push({ className: 'object, item', probability: 0.4 });
      predictions.push({ className: 'image, picture', probability: 0.3 });
      predictions.push({ className: 'unknown object', probability: 0.3 });
    }

    // Sort by probability and take top 5
    return predictions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5)
      .map((p, index) => ({
        ...p,
        probability: Math.max(0.1, p.probability - index * 0.05), // Decrease slightly for ranking
      }));
  }
}

/**
 * Create offline classifier instance
 */
export const createOfflineClassifier = (): OfflineImageClassifier => {
  return new OfflineImageClassifier();
};