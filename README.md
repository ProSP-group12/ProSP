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


### Installation & Usage Steps

1. **Set up GEMINI_API_KEY**
   - In the `wordcam/server` directory, create a `.env` file and add:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```
   - Replace `your_api_key_here` with your actual Gemini API key.

2. **Start the server**
   - Open a terminal and navigate to the server folder:
     ```bash
     cd wordcam/server
     npm start
     ```

3. **Start the Expo app**
   - Open a new terminal and navigate to the app folder:
     ```bash
     cd wordcam
     npm start
     ```
   - This will launch the Expo development server.

4. **Open the app in Expo Go**
   - Install the Expo Go app on your phone (iOS/Android).
   - Scan the QR code shown in your terminal to open the app.
   - Make sure your phone and computer are on the same WiFi network.

5. **Other options**
   - iOS Simulator: `npm run ios` (requires Xcode)
   - Android Emulator: `npm run android` (requires Android Studio)
   - Web browser: `npm run web` (camera features may be limited)

---

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

Users can switch languages in the Settings screen. The app automatically detects the device language on first launch.

---

## 📌 Project Status

This project is currently a **prototype**, exploring the use of multimodal AI for educational applications.

---

## 📝 Notes

- Camera permissions are required for the app to function
- The vocabulary analysis is currently simulated - integrate with your AI API for production use
- Optimized for mobile devices with a focus on landscape orientation
