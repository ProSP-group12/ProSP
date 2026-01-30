import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { sendToImageRecognitionAPI } from '../services/imageRecognitionAPI';
import { styles } from '../styles/imageRecognitionStyles';

const ImageRecognitionComponent = () => {
  const [photo, setPhoto] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle taking a photo
  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      setError('Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageAsset = {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        fileName: 'photo.jpg',
      };
      setPhoto(imageAsset);
      handleImageRecognition(imageAsset);
    } else {
      console.log('User cancelled photo');
    }
  };

  // Handle image recognition
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
        <Text style={styles.title}>Image Recognition Vocabulary Learning</Text>
      </View>

      {/* Take photo button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleTakePhoto}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Processing...' : 'Take Photo'}
        </Text>
      </TouchableOpacity>

      {/* Display captured photo */}
      {photo && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photo.uri }} style={styles.photo} />
        </View>
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Recognizing image...</Text>
        </View>
      )}

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Display detected objects */}
      {detectedObjects.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Detected Objects</Text>
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
                Confidence: {obj.confidence}%
              </Text>
            </View>
          ))}
        </View>
      )}

      {detectedObjects.length === 0 && !loading && photo && (
        <Text style={styles.noResults}>No objects detected</Text>
      )}
    </ScrollView>
  );
};

export default ImageRecognitionComponent;
