# TensorFlow.js Model Download Troubleshooting Guide

## Overview
This guide helps troubleshoot issues with first-time TensorFlow.js MobileNet model downloads in React Native Windows applications.

## Common Error: "Cannot read property of fetch"

### Root Cause
The error occurs because TensorFlow.js requires the `fetch` API to download models, but React Native Windows doesn't provide this API by default.

### Solution Applied
We've implemented the following fixes:

1. **Added Polyfills** (`index.js`):
   ```javascript
   import 'react-native-fetch-api';
   import 'react-native-url-polyfill/auto';
   import 'text-encoding';
   ```

2. **Enhanced TensorFlow Setup** (`src/utils/tensorflowSetup.ts`):
   - Proper backend initialization
   - Network connectivity checks
   - Retry logic for model downloads
   - Better error handling

3. **Improved Error Messages** (`App.tsx`):
   - User-friendly error descriptions
   - Troubleshooting steps
   - Retry functionality

## Dependencies Added
```json
{
  "react-native-fetch-api": "^3.0.0",
  "react-native-url-polyfill": "^3.0.0",
  "text-encoding": "^0.7.0",
  "@tensorflow/tfjs-converter": "^4.22.0",
  "@tensorflow/tfjs-core": "^4.22.0",
  "seedrandom": "^3.0.5"
}
```

## How It Works Now

### First Launch
1. App initializes TensorFlow.js with CPU backend
2. Checks network connectivity
3. Downloads MobileNet v2 model (~9MB) from TensorFlow Hub
4. Caches model locally for future use
5. Ready for image classification

### Error Handling
- Network timeouts (30 seconds)
- Retry logic (3 attempts with exponential backoff)
- Specific error messages for different failure types
- User-friendly troubleshooting interface

## Testing the Fix

### To Test First-Time Download:
1. Clear app data/cache
2. Ensure internet connection
3. Launch the app
4. Watch for "Loading MobileNet Model..." screen
5. Model should download successfully

### Expected Behavior:
- Loading screen with progress indicators
- Console logs showing download progress
- Successful transition to main interface
- Sample image classification works

## Troubleshooting Steps for Users

### If Model Download Fails:
1. **Check Internet Connection**
   - Ensure stable internet access
   - Try opening a web browser to verify connectivity

2. **Firewall/Security Settings**
   - Allow the app through Windows Firewall
   - Check corporate firewall settings
   - Verify proxy settings if applicable

3. **Network Issues**
   - Try a different network (mobile hotspot, etc.)
   - Check if HTTPS requests are blocked
   - Verify DNS resolution works

4. **App Restart**
   - Close and restart the application
   - The retry logic will attempt download again

5. **Clear Cache** (if needed)
   - Reinstall the app to clear any corrupted cache

## Technical Details

### Model Download Process:
- **URL**: TensorFlow Hub (https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_140_224/classification/3/default/1)
- **Size**: ~9MB
- **Format**: TensorFlow.js format
- **Storage**: Browser cache (IndexedDB)

### Backend Configuration:
- **Primary**: CPU backend (most compatible)
- **Fallback**: WebGL if available
- **Platform**: React Native Windows (Hermes/Chakra)

### Network Requirements:
- HTTPS access to tfhub.dev
- CORS support for cross-origin requests
- Minimum 10MB download capability

## Monitoring and Logs

### Console Output (Normal Flow):
```
Initializing TensorFlow.js...
TensorFlow.js initialized successfully
Active backend: cpu
Loading MobileNet model...
Model download attempt 1/3
Model downloaded successfully on attempt 1
MobileNet model loaded successfully
```

### Console Output (With Errors):
```
Error loading model: NetworkError: fetch failed
Download attempt 1 failed: NetworkError: fetch failed
Retrying in 2000ms...
Model download attempt 2/3
```

## Performance Notes
- First download: 10-30 seconds (depending on connection)
- Subsequent launches: 2-5 seconds (cached)
- Classification time: 50-200ms per image
- Memory usage: ~50MB for model

## Future Improvements
- Offline model bundling option
- Progress indicators for download
- Model versioning and updates
- Compressed model variants
- WebAssembly backend support