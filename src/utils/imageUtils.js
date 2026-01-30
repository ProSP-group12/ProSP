// 图像处理工具函数

/**
 * 将图像URI转换为Base64字符串
 * @param {string} uri - 图像URI
 * @returns {Promise<string>} Base64编码的图像数据
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
    xhr.onerror = () => reject(new Error('图像转换失败'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
};

/**
 * 处理API返回的识别结果
 * @param {Object} responseData - API响应数据
 * @returns {Array} 处理后的对象数组
 */
export const parseRecognitionResults = (responseData) => {
  const objects = [];

  // 提取检测到的对象
  if (responseData.localizedObjectAnnotations) {
    responseData.localizedObjectAnnotations.forEach((obj) => {
      objects.push({
        name: obj.name,
        confidence: (obj.score * 100).toFixed(2),
        type: 'object',
      });
    });
  }

  // 提取标签
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
