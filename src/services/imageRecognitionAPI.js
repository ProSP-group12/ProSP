// Image Recognition API Service
import { imageToBase64, parseRecognitionResults } from '../utils/imageUtils';
import { API_CONFIG, RECOGNITION_FEATURES } from '../constants/config';

/**
 * Send image to Google Cloud Vision API for recognition
 * @param {Object} imageAsset - Image asset object
 * @returns {Promise<Array>} Array of recognition results
 * @throws {Error} Error thrown when API call fails
 */
export const sendToImageRecognitionAPI = async (imageAsset) => {
  try {
    const base64Image = await imageToBase64(imageAsset.uri);

    const response = await fetch(
      `${API_CONFIG.ENDPOINT}?key=${API_CONFIG.API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: RECOGNITION_FEATURES,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.responses && data.responses[0]) {
      return parseRecognitionResults(data.responses[0]);
    } else {
      throw new Error('API returned invalid data');
    }
  } catch (err) {
    throw new Error('API call failed: ' + err.message);
  }
};
