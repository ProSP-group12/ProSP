// API configuration and constants
export const API_CONFIG = {
  API_KEY: 'YOUR_API_KEY_HERE',
  ENDPOINT: 'https://vision.googleapis.com/v1/images:annotate',
};

// Camera configuration
export const CAMERA_CONFIG = {
  mediaType: 'photo',
  cameraType: 'back',
  quality: 0.8,
};

// Image recognition features configuration
export const RECOGNITION_FEATURES = [
  { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
  { type: 'LABEL_DETECTION', maxResults: 10 },
];
