import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { sendToImageRecognitionAPI } from '../services/imageRecognitionAPI';
import { styles } from '../styles/imageRecognitionStyles';
import { CAMERA_CONFIG } from '../constants/config';

const ImageRecognitionComponent = () => {
  const [photo, setPhoto] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 拍照处理
  const handleTakePhoto = () => {
    launchCamera(CAMERA_CONFIG, (response) => {
      if (response.didCancel) {
        console.log('用户取消拍照');
      } else if (response.errorCode) {
        setError('拍照失败: ' + response.errorMessage);
      } else {
        setPhoto(response.assets[0]);
        handleImageRecognition(response.assets[0]);
      }
    });
  };

  // 处理图像识别
  const handleImageRecognition = async (imageAsset) => {
    setLoading(true);
    setError(null);
    try {
      const results = await sendToImageRecognitionAPI(imageAsset);
      setDetectedObjects(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>图像识别词汇学习</Text>
      </View>

      {/* 拍照按钮 */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleTakePhoto}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '处理中...' : '拍照'}
        </Text>
      </TouchableOpacity>

      {/* 显示拍摄的照片 */}
      {photo && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photo.uri }} style={styles.photo} />
        </View>
      )}

      {/* 加载指示器 */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>正在识别图像...</Text>
        </View>
      )}

      {/* 错误提示 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 显示检测到的对象 */}
      {detectedObjects.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>检测到的对象</Text>
          {detectedObjects.map((obj, index) => (
            <View key={index} style={styles.objectCard}>
              <Text style={styles.objectName}>{obj.name}</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    { width: `${obj.confidence}%` },
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>
                置信度: {obj.confidence}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {detectedObjects.length === 0 && !loading && photo && (
        <Text style={styles.noResults}>未检测到对象</Text>
      )}
    </ScrollView>
  );
};

export default ImageRecognitionComponent;
