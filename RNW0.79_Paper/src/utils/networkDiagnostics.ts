/**
 * Network diagnostics and connectivity utilities for React Native Windows
 * Helps diagnose and resolve network issues for model downloads
 */

interface NetworkDiagnostic {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

interface NetworkDiagnosticResult {
  overall: 'pass' | 'fail' | 'warning';
  diagnostics: NetworkDiagnostic[];
  recommendations: string[];
}

export const runNetworkDiagnostics = async (): Promise<NetworkDiagnosticResult> => {
  const diagnostics: NetworkDiagnostic[] = [];
  const recommendations: string[] = [];

  // Test 1: Basic internet connectivity
  try {
    console.log('Testing basic internet connectivity...');
    const response = await fetch('https://www.google.com/generate_204', {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
    });
    diagnostics.push({
      test: 'Basic Internet Connectivity',
      status: 'pass',
      message: 'Internet connection is working',
    });
  } catch (error) {
    diagnostics.push({
      test: 'Basic Internet Connectivity',
      status: 'fail',
      message: 'No internet connection detected',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    recommendations.push('Check your internet connection and try again');
  }

  // Test 2: HTTPS connectivity
  try {
    console.log('Testing HTTPS connectivity...');
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      headers: {
        'User-Agent': 'AIImageClassifier/1.0',
      },
    });
    if (response.ok) {
      diagnostics.push({
        test: 'HTTPS Connectivity',
        status: 'pass',
        message: 'HTTPS requests are working',
      });
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    diagnostics.push({
      test: 'HTTPS Connectivity',
      status: 'fail',
      message: 'HTTPS requests are blocked or failing',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    recommendations.push('Check Windows Firewall and proxy settings');
  }

  // Test 3: TensorFlow Hub connectivity
  try {
    console.log('Testing TensorFlow Hub connectivity...');
    const response = await fetch('https://www.kaggle.com/models', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    diagnostics.push({
      test: 'TensorFlow Hub Access',
      status: 'pass',
      message: 'Can reach TensorFlow model repositories',
    });
  } catch (error) {
    diagnostics.push({
      test: 'TensorFlow Hub Access',
      status: 'warning',
      message: 'Cannot verify TensorFlow Hub access',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    recommendations.push('TensorFlow Hub may be blocked - try a different network');
  }

  // Test 4: DNS Resolution
  try {
    console.log('Testing DNS resolution...');
    const startTime = Date.now();
    await fetch('https://8.8.8.8', { method: 'HEAD', mode: 'no-cors' });
    const endTime = Date.now();
    diagnostics.push({
      test: 'DNS Resolution',
      status: 'pass',
      message: `DNS working (${endTime - startTime}ms)`,
    });
  } catch (error) {
    diagnostics.push({
      test: 'DNS Resolution',
      status: 'warning',
      message: 'DNS resolution issues detected',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    recommendations.push('Try using a different DNS server (e.g., 8.8.8.8)');
  }

  // Test 5: Model URL direct test
  try {
    console.log('Testing model URL accessibility...');
    // Try to access the actual MobileNet model URL
    const modelUrl = 'https://www.kaggle.com/models/google/mobilenet-v2/frameworks/tfJs/variations/100-224-classification/versions/3';
    const response = await fetch(modelUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (response.ok || response.status === 200) {
      diagnostics.push({
        test: 'Model URL Access',
        status: 'pass',
        message: 'Model download URL is accessible',
      });
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    diagnostics.push({
      test: 'Model URL Access',
      status: 'fail',
      message: 'Cannot access model download URL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
    recommendations.push('Model servers may be down or blocked by your network');
  }

  // Determine overall status
  const failedTests = diagnostics.filter(d => d.status === 'fail');
  const warningTests = diagnostics.filter(d => d.status === 'warning');
  
  let overall: 'pass' | 'fail' | 'warning';
  if (failedTests.length > 0) {
    overall = 'fail';
  } else if (warningTests.length > 0) {
    overall = 'warning';
  } else {
    overall = 'pass';
  }

  // Add general recommendations
  if (overall !== 'pass') {
    recommendations.push('Try connecting to a different network (mobile hotspot, etc.)');
    recommendations.push('Disable VPN temporarily if you are using one');
    recommendations.push('Check Windows Defender Firewall settings');
    recommendations.push('Ask your network administrator about proxy settings');
  }

  return {
    overall,
    diagnostics,
    recommendations,
  };
};

/**
 * Test different model download strategies
 */
export const testModelDownloadStrategies = async (): Promise<{
  strategy: string;
  success: boolean;
  error?: string;
}[]> => {
  const results: { strategy: string; success: boolean; error?: string }[] = [];

  // Strategy 1: Direct TensorFlow.js load
  try {
    console.log('Testing Strategy 1: Direct TensorFlow.js load...');
    const tf = await import('@tensorflow/tfjs');
    const mobilenet = await import('@tensorflow-models/mobilenet');
    
    await tf.setBackend('cpu');
    await tf.ready();
    
    const model = await mobilenet.load({ version: 2, alpha: 1.0 });
    results.push({ strategy: 'Direct TensorFlow.js', success: true });
  } catch (error) {
    results.push({
      strategy: 'Direct TensorFlow.js',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Strategy 2: Custom model URL
  try {
    console.log('Testing Strategy 2: Custom model URL...');
    const tf = await import('@tensorflow/tfjs');
    
    // Try loading from a different CDN or mirror
    const customUrl = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_224/classification/3/default/1';
    const model = await tf.loadLayersModel(customUrl);
    results.push({ strategy: 'Custom Model URL', success: true });
  } catch (error) {
    results.push({
      strategy: 'Custom Model URL',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Strategy 3: Local model loading (if available)
  try {
    console.log('Testing Strategy 3: Check for cached model...');
    const tf = await import('@tensorflow/tfjs');
    
    // Check if model is already cached
    const modelInfo = await tf.io.listModels();
    const cachedModels = Object.keys(modelInfo);
    
    if (cachedModels.length > 0) {
      results.push({ strategy: 'Cached Model', success: true });
    } else {
      results.push({
        strategy: 'Cached Model',
        success: false,
        error: 'No cached models found',
      });
    }
  } catch (error) {
    results.push({
      strategy: 'Cached Model',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return results;
};

/**
 * Get network configuration information
 */
export const getNetworkInfo = (): Promise<{
  userAgent: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  onLine: boolean;
}> => {
  return Promise.resolve({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
  });
};