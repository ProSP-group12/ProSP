// Image Recognition API Service
import * as FileSystem from 'expo-file-system';
import { API_CONFIG } from '../constants/config';

/**
 * Mock recognition response for testing (without real backend)
 * Returns objects with multilingual labels: English, Finnish, Chinese
 */
const getMockRecognitionResult = () => {
  const objects = [
    { 
      label: 'Dog',
      finnish: 'Koira',
      chinese: '狗',
      confidence: 0.95 
    },
    { 
      label: 'Animal',
      finnish: 'Eläin',
      chinese: '动物',
      confidence: 0.87 
    },
    { 
      label: 'Pet',
      finnish: 'Lemmikki',
      chinese: '宠物',
      confidence: 0.82 
    },
  ];
  return { objects };
};

/**
 * Recognize image from local URI using HTTP FormData POST
 * @param {Object} imageData - Image data object with uri property
 * @returns {Promise<Object>} Recognition result with { objects: [{label, confidence}, ...] }
 */
export const sendToImageRecognitionAPI = async (imageData) => {
  if (!imageData || !imageData.uri) {
    throw new Error('Invalid image URI');
  }

  // ===== MOCK MODE: USE FOR TESTING WITHOUT BACKEND =====
  // Set USE_MOCK_MODE = true to get dummy recognition results
  const USE_MOCK_MODE = true; // Change to false when you have a real backend
  
  if (USE_MOCK_MODE) {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResult = getMockRecognitionResult();
      return mockResult.objects.map(obj => ({
        name: obj.label,
        finnish: obj.finnish,
        chinese: obj.chinese,
        confidence: ((obj.confidence || 0) * 100).toFixed(2),
      }));
    } catch (err) {
      console.error('Mock recognition error:', err);
      throw new Error(err.message || 'Mock recognition failed');
    }
  }
  // ===== END MOCK MODE =====

  // Real API mode - only executed when USE_MOCK_MODE is false
  try {
    // Read file as base64 using new Expo 19.x API
    const base64Data = await FileSystem.readAsStringAsync(imageData.uri, {
      encoding: 'base64',  // Changed from FileSystem.EncodingType.Base64 (deprecated in v19)
    });

    // Create FormData for real API
    const formData = new FormData();
    formData.append('image', {
      uri: imageData.uri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });
    formData.append('base64', base64Data);

    // POST to your backend endpoint
    const response = await fetch(API_CONFIG.ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    // Expected result format: { objects: [{label, finnish, chinese, confidence}, ...] }
    if (result.objects && Array.isArray(result.objects)) {
      return result.objects.map(obj => ({
        name: obj.label || obj.name || 'Unknown',
        finnish: obj.finnish || '',
        chinese: obj.chinese || '',
        confidence: ((obj.confidence || 0) * 100).toFixed(2),
      }));
    }

    return [];
  } catch (err) {
    console.error('Image recognition error:', err);
    throw new Error(err.message || 'Failed to recognize image');
  }
};
