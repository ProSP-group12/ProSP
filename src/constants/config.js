// API配置和常量
export const API_CONFIG = {
  API_KEY: 'YOUR_API_KEY_HERE',
  ENDPOINT: 'https://vision.googleapis.com/v1/images:annotate',
};

// 摄像头配置
export const CAMERA_CONFIG = {
  mediaType: 'photo',
  cameraType: 'back',
  quality: 0.8,
};

// 图像识别特性配置
export const RECOGNITION_FEATURES = [
  { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
  { type: 'LABEL_DETECTION', maxResults: 10 },
];
