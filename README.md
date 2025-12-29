# AI Image Classifier for React Native Windows

A cross-platform AI-powered image classification application built with React Native Windows and TensorFlow.js. This repository contains two implementations demonstrating different React Native Windows architectures.

## 📁 Project Structure

```
AIImageClassifierRNW/
├── RNW0.79_Paper/     # React Native Windows 0.79 (Paper Architecture - UWP)
├── RNW0.81_Fabric/    # React Native Windows 0.81 (Fabric Architecture - WinAppSDK)
└── README.md
```

## 🚀 Features

- **AI Image Classification** using TensorFlow.js and MobileNet
- **Cross-platform** support for Windows (ARM64/x64) — instructions use ARM64 by default; replace with `--arch x64` for x64 builds
- **Offline Classification** capability
- **Two Architecture Examples**: Paper (legacy) and Fabric (new)

---

## 📋 Prerequisites

- **Node.js** 18 or higher
- **Visual Studio 2022** with:
  - Desktop development with C++
  - Universal Windows Platform development
  - Windows 10/11 SDK (10.0.19041.0 or higher)
- **Windows 10/11** (ARM64 or x64)

### Install Dependencies (Run as Administrator)

```powershell
# For RNW0.79_Paper
cd RNW0.79_Paper
& ".\node_modules\react-native-windows\scripts\rnw-dependencies.ps1"

# For RNW0.81_Fabric
cd RNW0.81_Fabric
& ".\node_modules\react-native-windows\scripts\rnw-dependencies.ps1"
```

---

## 🛠️ Getting Started

### Clone the Repository

```bash
git clone https://github.com/raorugan/AIImageClassifierRNW.git
cd AIImageClassifierRNW
```

### Run Paper Architecture (RNW 0.79)

```bash
cd RNW0.79_Paper
npm install
npx react-native run-windows --arch ARM64
```

### Run Fabric Architecture (RNW 0.81)

```bash
cd RNW0.81_Fabric
npm install
npx react-native run-windows --arch ARM64
```

---

## 📖 Architecture Comparison

| Feature | Paper (RNW 0.79) | Fabric (RNW 0.81) |
|---------|------------------|-------------------|
| **Architecture** | Legacy Bridge | New Fabric Renderer |
| **App Type** | UWP (Universal Windows Platform) | WinAppSDK (Win32) |
| **Performance** | Good | Better (synchronous) |
| **Threading** | Async bridge | Synchronous calls |
| **Future Support** | Maintenance mode | Active development |
| **Template** | `old/uwp-cpp-app` | `cpp-app` |

---

## 🔄 Upgrade Guide: RNW 0.79 to 0.81

### Step 1: Update `package.json` Dependencies

```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-windows": "0.81.0"
  },
  "devDependencies": {
    "@react-native/babel-preset": "0.81.0",
    "@react-native/eslint-config": "0.81.0",
    "@react-native/metro-config": "0.81.0",
    "@react-native/typescript-config": "0.81.0"
  }
}
```

### Step 2: Clean and Reinstall

```bash
# Delete existing dependencies
rmdir /s /q node_modules
del package-lock.json

# Install new dependencies
npm install
```

### Step 3: Regenerate Windows Project

```bash
# Re-initialize Windows files (this will use Paper architecture by default for upgrade)
npx @react-native-community/cli init-windows --overwrite
```

### Step 4: Rebuild the App

```bash
# Clean Windows build artifacts
cd windows
msbuild AIImageClassifierRNW.sln /t:Clean
cd ..

# Run the app
npx react-native run-windows --arch ARM64
```

### Troubleshooting Version Conflicts

If you encounter `ERESOLVE` errors:

```bash
# Check peer dependency requirements
npm view react-native-windows@0.81.0 peerDependencies

# Force install (use cautiously)
npm install --legacy-peer-deps
```

---

## 🔄 Migration Guide: Paper to Fabric Architecture

### Overview

Migrating from Paper to Fabric involves:
1. Updating the Windows project template
2. Changing from UWP to WinAppSDK
3. Updating native module configurations

### Step 1: Backup Your Project

```bash
# Copy your current project
xcopy /E /I RNW0.79_Paper RNW0.79_Paper_backup
```

### Step 2: Update `package.json`

Change the `react-native-windows` configuration:

**Before (Paper/UWP):**
```json
{
  "react-native-windows": {
    "init-windows": {
      "name": "AIImageClassifierRNW",
      "namespace": "AIImageClassifierRNW",
      "template": "old/uwp-cpp-app"
    }
  }
}
```

**After (Fabric/WinAppSDK):**
```json
{
  "react-native-windows": {
    "init-windows": {
      "name": "AIImageClassifierRNW",
      "namespace": "AIImageClassifierRNW",
      "template": "cpp-app"
    }
  }
}
```

### Step 3: Delete Old Windows Folder

```bash
rmdir /s /q windows
```

### Step 4: Regenerate Windows Project with Fabric

```bash
npx @react-native-community/cli init-windows --template cpp-app --overwrite
```

### Step 5: Enable Fabric in `ExperimentalFeatures.props`

Edit `windows/ExperimentalFeatures.props`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Project xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup Label="Microsoft.ReactNative Experimental Features">
    <UseFabric>true</UseFabric>
    <UseHermes>true</UseHermes>
  </PropertyGroup>
</Project>
```

### Step 6: Update Metro Configuration

Ensure `metro.config.js` has proper configuration:

```javascript
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  resolver: {
    blockList: [/node_modules\/.*\/node_modules\/react-native\/.*/],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

### Step 7: Build and Run

```bash
# Install dependencies
npm install

# Run the app
npx react-native run-windows --arch ARM64
```

---

## 🏗️ Key Differences After Migration

### Project Structure Changes

| Paper (UWP) | Fabric (WinAppSDK) |
|-------------|-------------------|
| Single `.vcxproj` | `.vcxproj` + `.wapproj` (packaging) |
| `MainPage.xaml` | No XAML (Win32 window) |
| `Package.appxmanifest` in project | `Package.appxmanifest` in Package folder |
| `App.xaml` + `App.cpp` | `AIImageClassifierRNW.cpp` (Win32 entry) |

### Native Code Changes

**Paper (UWP) - App.cpp:**
```cpp
#include "App.xaml.h"
using namespace winrt::AIImageClassifierRNW::implementation;

App::App() {
    // UWP initialization
}
```

**Fabric (WinAppSDK) - AIImageClassifierRNW.cpp:**
```cpp
#include "pch.h"
#include "resource.h"
// Win32 window creation and React Native host initialization
```

### Native Module Registration

Both architectures use the same registration pattern in `AutolinkedNativeModules.g.cpp`, but Fabric supports TurboModules for better performance.

---

## 📝 Common Commands

```bash
# Start Metro bundler
npm start

# Run on Windows (ARM64)
npx react-native run-windows --arch ARM64

# Run on Windows (x64)
npx react-native run-windows --arch x64

# Run release build
npx react-native run-windows --arch ARM64 --release

# Clean build
cd windows && msbuild /t:Clean && cd ..

# Check dependencies
npx @react-native-community/cli doctor
```

---

## 🐛 Troubleshooting

### "Couldn't determine Windows app config"

```powershell
# Run as Administrator
Set-ExecutionPolicy Unrestricted -Scope Process -Force
& ".\node_modules\react-native-windows\scripts\rnw-dependencies.ps1"
```

### Build Errors After Upgrade

```bash
# Clean everything
rmdir /s /q node_modules
rmdir /s /q windows\x64
rmdir /s /q windows\ARM64
del package-lock.json

# Reinstall
npm install
npx @react-native-community/cli init-windows --overwrite
```

### Metro Bundler Issues

```bash
# Clear Metro cache
npx react-native start --reset-cache
```

### TensorFlow.js Issues

See [TENSORFLOW_TROUBLESHOOTING.md](./RNW0.81_Fabric/TENSORFLOW_TROUBLESHOOTING.md) for detailed troubleshooting.

---

## 📚 Resources

- [React Native Windows Documentation](https://microsoft.github.io/react-native-windows/)
- [React Native Windows GitHub](https://github.com/microsoft/react-native-windows)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Fabric Architecture Overview](https://reactnative.dev/architecture/fabric-renderer)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
