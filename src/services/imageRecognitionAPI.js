// 图像识别API服务
import { imageToBase64, parseRecognitionResults } from '../utils/imageUtils';
import { API_CONFIG, RECOGNITION_FEATURES } from '../constants/config';

/**
 * 发送图像到Google Cloud Vision API进行识别
 * @param {Object} imageAsset - 图像资源对象
 * @returns {Promise<Array>} 识别结果数组
 * @throws {Error} API调用失败时抛出错误
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
      throw new Error('API返回异常数据');
    }
  } catch (err) {
    throw new Error('API调用失败: ' + err.message);
  }
};
