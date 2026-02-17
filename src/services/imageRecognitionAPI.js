// Image Recognition API Service
import * as FileSystem from 'expo-file-system';
import { API_CONFIG } from '../constants/config';

/**
 * Recognize image from local URI using HTTP FormData POST
 * @param {Object} imageData - Image data object with uri property
 * @returns {Promise<Object>} Recognition result with { objects: [{label, confidence}, ...] }
 */
export const sendToImageRecognitionAPI = async (imageData) => {
  if (!imageData || !imageData.uri) {
    throw new Error('Invalid image URI');
  }

  try {
    // Get file info and convert to blob
    const fileInfo = await FileSystem.getInfoAsync(imageData.uri);
    if (!fileInfo.exists) {
      throw new Error('Image file not found');
    }

    // Read file as base64
    const base64Data = await FileSystem.readAsStringAsync(imageData.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create FormData
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

    // Expected result format: { objects: [{label, confidence}, ...] }
    // or convert from your backend format
    if (result.objects && Array.isArray(result.objects)) {
      return result.objects.map(obj => ({
        name: obj.label || obj.name || 'Unknown',
        confidence: ((obj.confidence || 0) * 100).toFixed(2),
      }));
    }

    return [];
  } catch (err) {
    console.error('Image recognition error:', err);
    throw new Error(err.message || 'Failed to recognize image');
  }
};
