// Image processing utility functions
import * as FileSystem from 'expo-file-system';

/**
 * Convert image URI to Base64 string
 * @param {string} uri - Image URI
 * @returns {Promise<string>} Base64 encoded image data
 */
export const imageToBase64 = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    return base64;
  } catch (error) {
    throw new Error('Image conversion failed: ' + error.message);
  }
};

/**
 * Parse recognition results from API response
 * @param {Object} responseData - API response data
 * @returns {Array} Array of processed objects
 */
export const parseRecognitionResults = (responseData) => {
  const objects = [];

  // Extract detected objects
  if (responseData.localizedObjectAnnotations) {
    responseData.localizedObjectAnnotations.forEach((obj) => {
      objects.push({
        name: obj.name,
        confidence: (obj.score * 100).toFixed(2),
        type: 'object',
      });
    });
  }

  // Extract labels
  if (responseData.labelAnnotations) {
    responseData.labelAnnotations.forEach((label) => {
      objects.push({
        name: label.description,
        confidence: (label.score * 100).toFixed(2),
        type: 'label',
      });
    });
  }

  return objects;
};
