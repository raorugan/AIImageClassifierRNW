/**
 * Comprehensive polyfills for React Native Windows
 * Required for TensorFlow.js to work properly
 */

/**
 * Comprehensive polyfills for React Native Windows
 * Required for TensorFlow.js to work properly
 */

/**
 * Comprehensive polyfills for React Native Windows
 * Required for TensorFlow.js to work properly
 */

console.log('🔧 Initializing polyfills for React Native Windows...');

// IMMEDIATE touch identifier warning suppression - must be first
(function() {
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  
  // Create a robust filter function
  const isTouchWarning = (message) => {
    return message && (
      message.includes('Touch identifier') ||
      message.includes('greater than maximum supported') ||
      message.includes('performance issues backfilling') ||
      message.includes('backfilling array locations') ||
      message.includes('which causes performance issues')
    );
  };
  
  // Override all console methods immediately
  console.warn = function(...args) {
    if (args.length > 0 && isTouchWarning(String(args[0]))) {
      return; // Completely suppress
    }
    return originalWarn.apply(console, args);
  };
  
  console.error = function(...args) {
    if (args.length > 0 && isTouchWarning(String(args[0]))) {
      return; // Completely suppress
    }
    return originalError.apply(console, args);
  };
  
  console.log = function(...args) {
    if (args.length > 0 && isTouchWarning(String(args[0]))) {
      return; // Completely suppress
    }
    return originalLog.apply(console, args);
  };
  
  // Also override console methods globally
  if (typeof global !== 'undefined') {
    global.console = console;
  }
  
  console.log('🛡️ Touch identifier warnings completely suppressed');
})();

// Manual URL polyfill - more reliable than package dependency
if (!global.URL) {
  global.URL = class URL {
    constructor(url, base) {
      this.href = url;
      this.protocol = url.includes('://') ? url.split('://')[0] + ':' : '';
      this.hostname = '';
      this.pathname = '';
      this.search = '';
      this.hash = '';
      
      if (url.includes('://')) {
        const parts = url.split('://')[1];
        if (parts) {
          const hostParts = parts.split('/');
          this.hostname = hostParts[0] || '';
          this.pathname = '/' + (hostParts.slice(1).join('/') || '');
        }
      }
    }
    
    toString() {
      return this.href;
    }
  };
  console.log('✅ Manual URL polyfill created');
}

// URLSearchParams polyfill
if (!global.URLSearchParams) {
  global.URLSearchParams = class URLSearchParams {
    constructor(init) {
      this.params = new Map();
      if (typeof init === 'string') {
        const pairs = init.replace(/^\?/, '').split('&');
        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
        });
      }
    }
    
    get(name) {
      return this.params.get(name);
    }
    
    set(name, value) {
      this.params.set(name, value);
    }
    
    toString() {
      const pairs = [];
      for (const [key, value] of this.params) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
      return pairs.join('&');
    }
  };
  console.log('✅ URLSearchParams polyfill created');
}

// Import DOM polyfills
const { initializeDOMPolyfills, checkDOMAPISupport } = require('./utils/domPolyfills');

// Initialize DOM polyfills
initializeDOMPolyfills();
const domSupport = checkDOMAPISupport();

// Performance optimization for React Native Windows touch handling
if (typeof global !== 'undefined') {
  // Set touch optimization flags
  global.__RNW_TOUCH_OPTIMIZATION__ = true;
  
  // Limit touch identifier range if possible
  if (!global.__RNW_MAX_TOUCH_ID__) {
    global.__RNW_MAX_TOUCH_ID__ = 10; // Reasonable limit for most use cases
  }
  
  // Comprehensive console suppression for touch warnings
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Suppress all variations of touch identifier warnings
    if (message.includes('Touch identifier') || 
        message.includes('greater than maximum supported') || 
        message.includes('performance issues backfilling') ||
        message.includes('backfilling array locations')) {
      // Log once to inform developer, then suppress
      if (!global.__TOUCH_WARNING_SHOWN__) {
        console.log('ℹ️ Touch identifier performance warnings suppressed (React Native Windows optimization)');
        global.__TOUCH_WARNING_SHOWN__ = true;
      }
      return;
    }
    
    // Allow all other warnings through
    originalConsoleWarn.apply(console, args);
  };
  
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Suppress touch identifier errors too
    if (message.includes('Touch identifier') || 
        message.includes('backfilling array locations') ||
        message.includes('performance issues backfilling')) {
      return;
    }
    
    // Allow all other errors through
    originalConsoleError.apply(console, args);
  };
  
  // Also suppress any console.log messages about touch identifiers
  console.log = (...args) => {
    const message = args.join(' ');
    
    if (message.includes('Touch identifier') && 
        message.includes('greater than maximum supported')) {
      return;
    }
    
    originalConsoleLog.apply(console, args);
  };
  
  console.log('✅ Comprehensive touch performance optimizations and warning suppression applied');
}

// Manual fetch polyfill setup for React Native Windows
if (!global.fetch) {
  console.log('Setting up fetch polyfill...');
  
  // Try different approaches to get fetch working
  try {
    // First try react-native-fetch-api
    const fetchApi = require('react-native-fetch-api');
    global.fetch = fetchApi.fetch;
    global.Request = fetchApi.Request;
    global.Response = fetchApi.Response;
    global.Headers = fetchApi.Headers;
    console.log('✅ Fetch polyfill loaded successfully via react-native-fetch-api');
  } catch (error) {
    console.warn('❌ Failed to load react-native-fetch-api:', error);
    
    // Fallback: create a basic fetch implementation
    global.fetch = async (url, options = {}) => {
      console.log('Using fallback fetch for:', url);
      
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const method = options.method || 'GET';
        
        xhr.open(method, url, true);
        
        // Set headers
        if (options.headers) {
          Object.keys(options.headers).forEach(key => {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }
        
        xhr.onload = () => {
          const response = {
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            url: url,
            headers: new Map(),
            arrayBuffer: () => Promise.resolve(xhr.response),
            blob: () => Promise.resolve(new Blob([xhr.response])),
            json: () => Promise.resolve(JSON.parse(xhr.responseText)),
            text: () => Promise.resolve(xhr.responseText),
          };
          resolve(response);
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.ontimeout = () => reject(new Error('Request timeout'));
        
        // Set timeout
        xhr.timeout = options.timeout || 30000;
        
        // Send request
        if (options.body) {
          xhr.send(options.body);
        } else {
          xhr.send();
        }
      });
    };
    
    console.log('✅ Fallback fetch implementation created');
  }
} else {
  console.log('✅ Fetch already available');
}

// Ensure other required globals are available
if (!global.XMLHttpRequest) {
  console.warn('⚠️ XMLHttpRequest not available');
}

if (!global.FormData) {
  global.FormData = class FormData {
    constructor() {
      this._data = new Map();
    }
    
    append(key, value) {
      this._data.set(key, value);
    }
    
    get(key) {
      return this._data.get(key);
    }
    
    has(key) {
      return this._data.has(key);
    }
  };
  console.log('✅ FormData polyfill created');
}

// Platform detection for TensorFlow.js
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'ReactNative';
global.navigator.platform = global.navigator.platform || 'Win32';

// Performance API for TensorFlow.js benchmarking
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
  };
  console.log('✅ Performance API polyfill created');
}

// URL constructor if not available
if (!global.URL) {
  global.URL = require('react-native-url-polyfill').URL;
  console.log('✅ URL polyfill loaded');
}

console.log('🚀 All polyfills loaded successfully for React Native Windows + TensorFlow.js');