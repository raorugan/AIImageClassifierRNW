/**
 * React Native Windows Polyfills
 * Ensures DOM APIs are available in the React Native Windows environment
 */

/**
 * Mock ImageData for React Native Windows
 */
class MockImageData {
  public data: Uint8ClampedArray;
  public width: number;
  public height: number;
  
  constructor(data: Uint8ClampedArray | number, width?: number, height?: number) {
    if (data instanceof Uint8ClampedArray) {
      this.data = data;
      this.width = width || 0;
      this.height = height || 0;
    } else {
      // data is width, width is height
      this.width = data;
      this.height = width || 0;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    }
  }
}
class MockEvent {
  public type: string;
  public target: any = null;
  public currentTarget: any = null;
  public timeStamp: number;
  
  constructor(type: string, eventInitDict?: any) {
    this.type = type;
    this.timeStamp = Date.now();
    
    if (eventInitDict) {
      Object.assign(this, eventInitDict);
    }
  }
  
  preventDefault() {}
  stopPropagation() {}
  stopImmediatePropagation() {}
}

/**
 * Mock Image constructor for React Native Windows
 */
class MockImage {
  private _src: string = '';
  private _width: number = 0;
  private _height: number = 0;
  private _onload: ((event: any) => void) | null = null;
  private _onerror: ((event: any) => void) | null = null;
  
  constructor() {
    console.log('MockImage constructor called');
  }
  
  get src(): string {
    return this._src;
  }
  
  set src(value: string) {
    this._src = value;
    console.log('MockImage src set to:', value);
    
    // Generate varied dimensions based on image source
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const hashAbs = Math.abs(hash);
    
    // Simulate different image sizes based on content type
    const lowerSrc = value.toLowerCase();
    
    if (lowerSrc.includes('portrait') || lowerSrc.includes('selfie')) {
      this._width = 180 + (hashAbs % 120);  // 180-300
      this._height = 240 + (hashAbs % 160); // 240-400
    } else if (lowerSrc.includes('landscape') || lowerSrc.includes('wide')) {
      this._width = 320 + (hashAbs % 200);  // 320-520
      this._height = 180 + (hashAbs % 120); // 180-300
    } else if (lowerSrc.includes('square') || lowerSrc.includes('instagram')) {
      const size = 200 + (hashAbs % 100);   // 200-300
      this._width = size;
      this._height = size;
    } else {
      // Default varied sizes
      this._width = 200 + (hashAbs % 150);      // 200-350
      this._height = 150 + ((hashAbs * 7) % 200); // 150-350
    }
    
    console.log(`Generated image dimensions: ${this._width}x${this._height} for ${value}`);
    
    // Simulate image loading with slight delay variation
    const loadDelay = 10 + (hashAbs % 50); // 10-60ms
    setTimeout(() => {
      if (this._onload) {
        console.log('MockImage onload triggered for:', value);
        const loadEvent = new MockEvent('load');
        loadEvent.target = this;
        this._onload(loadEvent);
      }
    }, loadDelay);
  }
  
  get width(): number {
    return this._width;
  }
  
  get height(): number {
    return this._height;
  }
  
  get onload(): ((event: any) => void) | null {
    return this._onload;
  }
  
  set onload(handler: ((event: any) => void) | null) {
    this._onload = handler;
  }
  
  get onerror(): ((event: any) => void) | null {
    return this._onerror;
  }
  
  set onerror(handler: ((event: any) => void) | null) {
    this._onerror = handler;
  }
}

/**
 * Mock Canvas Element for React Native Windows
 */
class MockCanvasElement {
  private _width: number = 300;
  private _height: number = 150;
  private _context: MockCanvasRenderingContext2D | null = null;
  
  constructor() {
    console.log('MockCanvasElement constructor called');
  }
  
  get width(): number {
    return this._width;
  }
  
  set width(value: number) {
    this._width = value;
  }
  
  get height(): number {
    return this._height;
  }
  
  set height(value: number) {
    this._height = value;
  }
  
  getContext(type: string): MockCanvasRenderingContext2D | null {
    if (type === '2d') {
      if (!this._context) {
        this._context = new MockCanvasRenderingContext2D(this._width, this._height);
      }
      return this._context;
    }
    return null;
  }
}

/**
 * Mock Canvas Rendering Context 2D
 */
class MockCanvasRenderingContext2D {
  private _width: number;
  private _height: number;
  private _imageData: MockImageData | null = null;
  
  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
    console.log('MockCanvasRenderingContext2D created:', width, 'x', height);
  }
  
  drawImage(image: any, sx: number, sy: number, sw?: number, sh?: number): void {
    console.log('MockCanvasRenderingContext2D.drawImage called with src:', image.src);
    
    // Generate mock image data for analysis
    const width = sw || this._width;
    const height = sh || this._height;
    const data = new Uint8ClampedArray(width * height * 4);
    
    // Generate realistic mock data based on image source
    const src = image.src || '';
    console.log('Generating mock data for image source:', src);
    
    // Create a hash from the image source for consistent but varied results
    let hash = 0;
    for (let i = 0; i < src.length; i++) {
      const char = src.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use hash to determine base colors and patterns
    const hashAbs = Math.abs(hash);
    let baseR = 128, baseG = 128, baseB = 128;
    let dominantPattern = 'neutral';
    
    // Analyze URL patterns for more realistic simulation
    const lowerSrc = src.toLowerCase();
    
    if (lowerSrc.includes('nature') || lowerSrc.includes('forest') || lowerSrc.includes('tree') || lowerSrc.includes('plant')) {
      baseR = 40 + (hashAbs % 40); baseG = 100 + (hashAbs % 80); baseB = 30 + (hashAbs % 50);
      dominantPattern = 'nature';
      console.log('Detected nature pattern');
    } else if (lowerSrc.includes('sky') || lowerSrc.includes('cloud') || lowerSrc.includes('blue')) {
      baseR = 100 + (hashAbs % 80); baseG = 150 + (hashAbs % 70); baseB = 200 + (hashAbs % 55);
      dominantPattern = 'sky';
      console.log('Detected sky pattern');
    } else if (lowerSrc.includes('sunset') || lowerSrc.includes('orange') || lowerSrc.includes('sun')) {
      baseR = 200 + (hashAbs % 55); baseG = 120 + (hashAbs % 80); baseB = 20 + (hashAbs % 60);
      dominantPattern = 'sunset';
      console.log('Detected sunset pattern');
    } else if (lowerSrc.includes('water') || lowerSrc.includes('ocean') || lowerSrc.includes('lake')) {
      baseR = 50 + (hashAbs % 60); baseG = 100 + (hashAbs % 80); baseB = 150 + (hashAbs % 80);
      dominantPattern = 'water';
      console.log('Detected water pattern');
    } else if (lowerSrc.includes('flower') || lowerSrc.includes('rose') || lowerSrc.includes('bloom')) {
      baseR = 180 + (hashAbs % 60); baseG = 80 + (hashAbs % 100); baseB = 120 + (hashAbs % 80);
      dominantPattern = 'flower';
      console.log('Detected flower pattern');
    } else if (lowerSrc.includes('food') || lowerSrc.includes('fruit') || lowerSrc.includes('apple')) {
      baseR = 150 + (hashAbs % 80); baseG = 100 + (hashAbs % 100); baseB = 60 + (hashAbs % 80);
      dominantPattern = 'food';
      console.log('Detected food pattern');
    } else if (lowerSrc.includes('building') || lowerSrc.includes('city') || lowerSrc.includes('house')) {
      baseR = 120 + (hashAbs % 60); baseG = 120 + (hashAbs % 60); baseB = 110 + (hashAbs % 70);
      dominantPattern = 'building';
      console.log('Detected building pattern');
    } else if (lowerSrc.includes('animal') || lowerSrc.includes('cat') || lowerSrc.includes('dog')) {
      baseR = 140 + (hashAbs % 70); baseG = 110 + (hashAbs % 80); baseB = 90 + (hashAbs % 90);
      dominantPattern = 'animal';
      console.log('Detected animal pattern');
    } else {
      // Use hash to create varied but consistent colors for unknown images
      baseR = 80 + (hashAbs % 100);
      baseG = 80 + ((hashAbs * 7) % 100);
      baseB = 80 + ((hashAbs * 13) % 100);
      dominantPattern = 'general';
      console.log('Using general pattern with hash-based colors');
    }
    
    console.log(`Base colors: R=${baseR}, G=${baseG}, B=${baseB}, Pattern=${dominantPattern}`);
    
    // Create more complex patterns based on the detected type
    const pixelCount = width * height;
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      
      // Create spatial variation based on position and hash
      const spatialHash = (x * 31 + y * 17 + hashAbs) % 255;
      const positionVariance = (spatialHash - 127) * 0.3;
      
      // Add pattern-specific variations
      let patternVariance = 0;
      switch (dominantPattern) {
        case 'nature':
          // Add some texture variation for nature scenes
          patternVariance = (Math.sin(x * 0.1) * Math.cos(y * 0.1)) * 30;
          break;
        case 'sky':
          // Smoother gradients for sky
          patternVariance = (y / height) * 20 - 10;
          break;
        case 'water':
          // Slight wave-like patterns
          patternVariance = Math.sin(x * 0.05 + y * 0.03) * 15;
          break;
        case 'flower':
          // More color variation for flowers
          patternVariance = (spatialHash % 50) - 25;
          break;
        default:
          patternVariance = (spatialHash % 40) - 20;
      }
      
      const totalVariance = positionVariance + patternVariance;
      
      data[i] = Math.max(0, Math.min(255, baseR + totalVariance));     // R
      data[i + 1] = Math.max(0, Math.min(255, baseG + totalVariance)); // G
      data[i + 2] = Math.max(0, Math.min(255, baseB + totalVariance)); // B
      data[i + 3] = 255; // A
    }
    
    this._imageData = new MockImageData(data, width, height);
    console.log('Generated mock image data with', pixelCount, 'pixels for pattern:', dominantPattern);
  }
  
  getImageData(sx: number, sy: number, sw: number, sh: number): MockImageData {
    console.log('MockCanvasRenderingContext2D.getImageData called');
    
    if (!this._imageData) {
      // Create default image data if none exists
      const data = new Uint8ClampedArray(sw * sh * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 128;     // R
        data[i + 1] = 128; // G
        data[i + 2] = 128; // B
        data[i + 3] = 255; // A
      }
      this._imageData = new MockImageData(data, sw, sh);
    }
    
    return this._imageData;
  }
}

/**
 * Mock Document for React Native Windows
 */
const mockDocument = {
  createElement: (tagName: string) => {
    console.log('mockDocument.createElement called with:', tagName);
    
    if (tagName === 'canvas') {
      return new MockCanvasElement();
    } else if (tagName === 'img') {
      return new MockImage();
    }
    
    return {
      tagName: tagName.toUpperCase(),
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      removeChild: () => {}
    };
  }
};

/**
 * Initialize DOM polyfills for React Native Windows
 */
export const initializeDOMPolyfills = (): void => {
  try {
    console.log('Initializing DOM polyfills for React Native Windows...');

    // Ensure global object exists
    if (typeof global !== 'undefined') {
      // Add Event polyfill
      if (typeof (global as any).Event === 'undefined') {
        console.log('Adding Event polyfill');
        (global as any).Event = MockEvent;
      }

      // Add document polyfill
      if (typeof (global as any).document === 'undefined') {
        console.log('Adding document polyfill');
        (global as any).document = mockDocument;
      }

      // Add Image constructor polyfill
      if (typeof (global as any).Image === 'undefined') {
        console.log('Adding Image constructor polyfill');
        (global as any).Image = MockImage;
      }

      // Add HTMLCanvasElement polyfill
      if (typeof (global as any).HTMLCanvasElement === 'undefined') {
        console.log('Adding HTMLCanvasElement polyfill');
        (global as any).HTMLCanvasElement = MockCanvasElement;
      }

      // Add ImageData polyfill
      if (typeof (global as any).ImageData === 'undefined') {
        console.log('Adding ImageData polyfill');
        (global as any).ImageData = MockImageData;
      }

      // Ensure Canvas APIs are available
      if (typeof HTMLCanvasElement === 'undefined') {
        console.log('Canvas API not available - classification will use fallback methods');
      }

      // Ensure document is available
      if (typeof document === 'undefined') {
        console.warn('Document API not available - some features may be limited');
      }

      console.log('DOM polyfills initialized successfully');

    } else if (typeof window !== 'undefined') {
      // Fallback to window if global not available
      if (typeof (window as any).Event === 'undefined') {
        (window as any).Event = MockEvent;
      }
      if (typeof (window as any).document === 'undefined') {
        (window as any).document = mockDocument;
      }
      if (typeof (window as any).Image === 'undefined') {
        (window as any).Image = MockImage;
      }
      if (typeof (window as any).ImageData === 'undefined') {
        (window as any).ImageData = MockImageData;
      }
    } else {
      console.log('Neither global nor window available, skipping DOM polyfills');
    }

  } catch (error) {
    console.error('Error initializing DOM polyfills:', error);
  }
};

/**
 * Check DOM API availability
 */
export const checkDOMAPISupport = (): { [key: string]: boolean } => {
  const support = {
    Image: typeof Image !== 'undefined' || (typeof window !== 'undefined' && typeof window.Image !== 'undefined'),
    Canvas: typeof HTMLCanvasElement !== 'undefined',
    Document: typeof document !== 'undefined',
    Fetch: typeof fetch !== 'undefined',
    URL: typeof URL !== 'undefined'
  };

  console.log('DOM API Support:', support);
  return support;
};

/**
 * Safe image creation with fallbacks
 */
export const createImageElement = (): any => {
  try {
    // Try global Image constructor first
    if (typeof global !== 'undefined' && typeof (global as any).Image !== 'undefined') {
      console.log('Creating image with global.Image');
      return new (global as any).Image();
    }
    
    // Try standard Image constructor
    if (typeof Image !== 'undefined') {
      console.log('Creating image with standard Image constructor');
      return new Image();
    }
    
    // Try window Image constructor
    if (typeof window !== 'undefined' && typeof (window as any).Image !== 'undefined') {
      console.log('Creating image with window.Image');
      return new (window as any).Image();
    }
    
    // Fallback to mock
    console.log('Creating mock image as fallback');
    return new MockImage();
    
  } catch (error) {
    console.error('Error creating image element:', error);
    return new MockImage();
  }
};

/**
 * Safe canvas creation with fallbacks
 */
export const createCanvasElement = (): any => {
  try {
    // Try document.createElement if available
    if (typeof global !== 'undefined' && (global as any).document && (global as any).document.createElement) {
      console.log('Creating canvas with global.document.createElement');
      return (global as any).document.createElement('canvas');
    }
    
    if (typeof document !== 'undefined' && document.createElement) {
      console.log('Creating canvas with document.createElement');
      return document.createElement('canvas');
    }
    
    // Fallback to mock
    console.log('Creating mock canvas as fallback');
    return new MockCanvasElement();
    
  } catch (error) {
    console.error('Error creating canvas element:', error);
    return new MockCanvasElement();
  }
};

// Auto-initialize polyfills
initializeDOMPolyfills();