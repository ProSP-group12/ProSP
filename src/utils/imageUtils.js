// Image processing utility functions

/**
 * Convert image URI to Base64 string
 * @param {string} uri - Image URI
 * @returns {Promise<string>} Base64 encoded image data
 */
export const imageToBase64 = async (uri) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = () => reject(new Error('Image conversion failed'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
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
