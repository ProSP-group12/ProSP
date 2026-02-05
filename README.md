# 📷 WordCam

WordCam is a **mobile-first vocabulary learning app** built with **React Native** and **Expo**.  
It helps users learn English vocabulary by using their phone camera to recognize real-world objects.

By combining **multimodal AI**, image recognition, and language generation, WordCam turns everyday scenes into interactive vocabulary lessons.

---

## ✨ Features

- 📸 Camera-based object recognition  
- 🧠 AI-powered vocabulary generation  
- 📱 Optimized for mobile devices  
- 🌍 Learn words from real-life environments  
-- 🌐 English language support
---

## 🎯 Motivation

Traditional vocabulary learning apps focus on memorization.  
WordCam connects language learning with daily life, making vocabulary acquisition more natural, visual, and engaging.

---

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling
- **expo-camera** - Camera functionality
- **react-i18next** - Internationalization (i18n)
- **Mobile-first UI design**  

---

## 🚀 Getting Started (Expo Go / SDK 54)

### Prerequisites

1. **Node.js** (v14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Expo CLI** (optional, but recommended)
   ```bash
   npm install -g expo-cli
   ```
   Or use `npx expo` directly (no installation needed)

4. **Expo Go app** on your phone
   - **iOS**: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - **Android**: Download from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Installation Steps

1. **Navigate to project directory:**
   ```bash
   cd /Users/xuanyuliu/Documents/ProSP
   ```

2. **Go into the Expo app folder:**
   ```bash
   cd wordcam
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```
   This will install all required packages (Expo SDK 54, React Native, etc.)

4. **Start the development server:**
   ```bash
   npm start
   ```
   Or use:
   ```bash
   npx expo start
   ```

5. **Run the app:**
   
   **Option A: On your phone (Recommended)**
   - A QR code will appear in your terminal
   - **iOS**: Open Camera app → Scan QR code → Tap notification → Opens in Expo Go
   - **Android**: Open Expo Go app → Tap "Scan QR code" → Scan the QR code
   - Make sure your phone and computer are on the same WiFi network

   **Option B: iOS Simulator (macOS only)**
   ```bash
   npm run ios
   ```
   Requires: Xcode installed from App Store

   **Option C: Android Emulator**
   ```bash
   npm run android
   ```
   Requires: Android Studio with Android SDK and emulator set up

   **Option D: Web browser**
   ```bash
   npm run web
   ```
   Note: Camera functionality may be limited in web browsers

### Troubleshooting

- **Port already in use**: Press `r` in the terminal to restart, or change port with `--port 8082`
- **Can't connect to phone**: Ensure both devices are on the same WiFi network
- **Camera not working**: Grant camera permissions when prompted, or check device settings
- **Module not found errors**: Delete `node_modules` folder and run `npm install` again
- **Expo Go connection issues**: Try pressing `r` to reload, or `shift+r` to clear cache and reload
- **PlatformConstants error**: Clear all caches:
  ```bash
  npm cache clean --force
  rm -rf node_modules .expo package-lock.json
  npm install
  npx expo start --clear
  ```
- **TurboModuleRegistry errors**: Make sure Expo Go app is updated to SDK 54.0.0, or use `expo start --clear`

---

## 📱 App Structure

All app code lives under `wordcam/`:

- `wordcam/App.js` - Main app component with tab navigation
- `wordcam/components/` - Screens and UI helpers
  - `CameraScreen.js` - Camera interface for capturing objects
  - `VocabularyScreen.js` - Display learned vocabulary (stored locally)
  - `SettingsScreen.js` - App settings and language selection
- `wordcam/i18n/` - Internationalization configuration
  - `config.js` - i18n setup
  - `locales/` - Translation files
    - `en.json` - English translations
   // Removed Chinese translations

---

## 🌐 Language Support

The app supports two languages:
- **English** (en)
// Removed Chinese language support

Users can switch languages in the Settings screen. The app automatically detects the device language on first launch.

---

## 📌 Project Status

This project is currently a **prototype**, exploring the use of multimodal AI for educational applications.

---

## 📝 Notes

- Camera permissions are required for the app to function
- The vocabulary analysis is currently simulated - integrate with your AI API for production use
- Optimized for mobile devices with a focus on landscape orientation
