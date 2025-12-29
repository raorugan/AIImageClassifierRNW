# AI Image Classifier - React Native Windows 0.79

A Windows-only AI Image Classification app built with React Native Windows 0.79 (Paper Architecture) for ARM64 devices.

## 🎯 Features

- **Windows-Only Application**: Optimized specifically for Windows ARM64 devices
- **Paper Architecture**: Uses React Native's traditional Paper rendering system
- **TensorFlow.js Integration**: Runs MobileNet v2 model for image classification
- **Zero Native Modules**: 100% web-based APIs - no native code required!
- **No Community Modules**: Built without @react-native-community dependencies
- **Web File Picker**: Uses HTML5 FileReader API (works in RNW WebView)
- **Multiple Image Sources**: Sample images, local files, or URLs
- **Offline Capable**: Model downloads once, then runs locally
- **1,000 Categories**: Recognizes objects from ImageNet dataset

## 🏗️ Architecture

- **React Native**: 0.79.0
- **React Native Windows**: 0.79.0 (Paper Architecture)
- **Target Platform**: Windows ARM64
- **AI Framework**: TensorFlow.js 4.20.0
- **Model**: MobileNet v2 (pre-trained on ImageNet)
- **JavaScript Engine**: Hermes/Chakra with DOM API support

## 📋 Prerequisites

- **Windows 11 ARM64** device
- **Node.js** 18+ 
- **Visual Studio 2022** with:
  - Desktop development with C++
  - Windows 10/11 SDK (10.0.18362.0 or later)
  - C++ ARM64 build tools
- **React Native CLI**: `npm install -g react-native-cli`

## 🚀 Getting Started

### 1. Install Dependencies

```powershell
npm install
```

### 2. Initialize Windows Platform

Since react-native-windows-init doesn't support 0.79, use the React Native CLI:

```powershell
npx @react-native-community/cli init-windows --overwrite --logging
```

Or manually configure Windows platform files for Paper architecture.

### 3. Run on Windows ARM64

```powershell
npm run windows
```

For release build with optimized performance:

```powershell
npm run windows-release
```

## 🎮 Usage

### Three Ways to Load Images (No Native Modules!)

1. **Sample Image** - Click to load random demo images from Wikipedia
2. **Local File** - Click to open web-based file picker (HTML5 FileReader API)
3. **Load from URL** - Paste any image URL from the internet

### Classification Workflow

1. Select an image using any of the three methods
2. Click **"Classify Image"** to run AI inference
3. View **Top 5 Predictions** with confidence scores and visual bars

### Web-Based File Selection (Zero Native Code)

The app uses pure web APIs that work in React Native Windows:

```typescript
// Web file picker - no native module needed!
const selectLocalImage = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result; // Base64 image
      setSelectedImageUri(dataUrl);
    };
    reader.readAsDataURL(file);
  };
  
  input.click(); // Opens native file picker through web API
};
```

**Benefits:**
- ✅ No native module compilation
- ✅ No platform-specific code
- ✅ Works in RNW WebView/Chakra context
- ✅ Faster development and builds

## 📦 Project Structure

```
AIImageClassifierRNW/
├── App.tsx                          # Main application UI
├── index.js                         # Entry point
├── package.json                     # Dependencies (ARM64 script)
├── tsconfig.json                    # TypeScript config (DOM lib)
├── src/
│   ├── hooks/
│   │   └── useImageClassifier.ts   # TensorFlow.js model hook
│   ├── utils/
│   │   └── imageUtils.ts           # Image loading utilities
│   └── types/
│       └── index.ts                # TypeScript definitions
└── windows/                         # Windows platform files (Paper)
```

## ⚙️ Configuration

### ARM64 Build Configuration

The project is configured for ARM64 in `package.json`:

```json
"scripts": {
  "windows": "react-native run-windows --arch ARM64"
}
```

### TypeScript Configuration

DOM library is enabled for web Image API support:

```json
{
  "compilerOptions": {
    "lib": ["esnext", "dom"]
  }
}
```

## 🔧 Troubleshooting

### Model Loading Issues

If the model fails to load:
1. Check internet connection (first download)
2. Verify TensorFlow.js backend: `console.log(tf.getBackend())`
3. Try forcing CPU backend: `await tf.setBackend('cpu')`

### Build Errors

**SDK Version Mismatch**: Create `windows/ExperimentalFeatures.props`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Project xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <WindowsTargetPlatformVersion>10.0.26100.0</WindowsTargetPlatformVersion>
  </PropertyGroup>
</Project>
```

**ARM64 Platform Not Available**: Ensure Visual Studio has ARM64 build tools installed.

## 🚀 Performance Optimization

### Release Build

Always use release builds for production:

```powershell
npm run windows-release
```

### Model Optimization

- MobileNet v2 alpha 1.0 (best accuracy)
- For faster inference, use alpha 0.5: `mobilenet.load({ version: 2, alpha: 0.5 })`
- Consider TensorFlow.js WASM backend for better performance

## 📝 Architecture Notes

### Web-Only Design (No Native Modules)

This app demonstrates a **fully web-based architecture** for React Native Windows:

- **Image Loading**: HTML5 `Image()` API
- **File Selection**: Web `FileReader` API  
- **AI Inference**: TensorFlow.js (JavaScript)
- **UI**: React Native Paper components

**Why Web APIs Work in RNW:**
React Native Windows runs JavaScript through Chakra (or Hermes) which provides web-compatible APIs including `document`, `Image`, `FileReader`, and `fetch`. This means you can use standard web APIs without writing any native C++ or C# code!

### Known Limitations

- **File Picker UI**: Uses web file dialog (not native Windows.Storage.Pickers)
- **Internet Required**: Initial model download requires internet connection
- **CORS**: Remote images must allow cross-origin requests

## 🔮 Future Enhancements

1. **Drag & Drop**: Add web-based drag-and-drop support
2. **Camera Support**: Direct camera capture via `getUserMedia()` API
3. **Custom Models**: Support for custom TensorFlow.js models
4. **Batch Processing**: Classify multiple images at once
5. **Result History**: Save classification history to `localStorage`
6. **Clipboard Support**: Paste images from clipboard
7. **Native File Picker** (Optional): Native module for Windows.Storage.Pickers (if needed)

## 📄 License

This is a demo project for React Native Windows 0.79 with TensorFlow.js integration.

## 🤝 Contributing

This project demonstrates Paper architecture on Windows ARM64. For Fabric architecture or other platforms, see React Native Windows documentation.

---

**Built with ❤️ for Windows ARM64 devices**
# AIImageClassifierRNW
A Windows-only AI Image Classification app built with React Native Windows
