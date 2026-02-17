import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { sendToImageRecognitionAPI } from './src/services/imageRecognitionAPI';

export default function App() {
  const cameraRef = useRef(null);
  const realTimeIntervalRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [realtimeObject, setRealtimeObject] = useState(null); // Real-time recognition
  const [capturedPhoto, setCapturedPhoto] = useState(null); // Store captured photo

  // Request camera permissions on mount
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }

    // Cleanup real-time recognition on unmount
    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
      }
    };
  }, [permission]);

  // Start real-time object recognition when camera is ready
  useEffect(() => {
    if (cameraReady && !showResults && !realTimeIntervalRef.current) {
      startRealtimeRecognition();
    }

    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
        realTimeIntervalRef.current = null;
      }
    };
  }, [cameraReady, showResults]);

  // Start real-time recognition (every 2 seconds)
  const startRealtimeRecognition = async () => {
    realTimeIntervalRef.current = setInterval(async () => {
      try {
        if (cameraRef.current && cameraReady && !loading) {
          const preview = await cameraRef.current.takePictureAsync({
            quality: 0.5, // Lower quality for faster processing
            skipProcessing: false,
          });

          // Recognize preview image
          const results = await sendToImageRecognitionAPI({
            uri: preview.uri,
          });

          if (results && results.length > 0) {
            // Show only the top result for real-time display
            setRealtimeObject(results[0]);
          }
        }
      } catch (err) {
        // Silently fail for real-time recognition - don't disrupt camera
        console.log('Real-time recognition skipped:', err.message);
      }
    }, 2000); // 2 second interval
  };

  // Take photo from camera
  const handleTakePhoto = async () => {
    if (!cameraRef.current || !cameraReady) {
      setError('Camera is not ready. Please try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Stop real-time recognition
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
        realTimeIntervalRef.current = null;
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      // Save the captured photo for display
      setCapturedPhoto(photo);

      // Send to recognition service
      const results = await sendToImageRecognitionAPI({
        uri: photo.uri,
      });

      setDetectedObjects(results || []);
      setShowResults(true);
    } catch (err) {
      setError(err.message || 'Failed to process image');
      console.error('Photo capture error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pick image from gallery
  const handlePickImage = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const results = await sendToImageRecognitionAPI({
          uri: result.assets[0].uri,
        });

        setDetectedObjects(results || []);
        setShowResults(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to pick image');
      console.error('Image picker error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Go back to camera
  const handleBackToCamera = () => {
    setShowResults(false);
    setDetectedObjects([]);
    setCapturedPhoto(null);
    setRealtimeObject(null);
    setError(null);
    // Real-time recognition will restart automatically via useEffect
  };

  // No camera permission
  if (permission && !permission.granted) {
    return (
      <SafeAreaView style={styles.noPermissionContainer}>
        <View style={styles.noPermissionContent}>
          <Text style={styles.noPermissionTitle}>Camera Permission Required</Text>
          <Text style={styles.noPermissionText}>
            This app needs camera access to recognize objects. You can still select images from your gallery.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handlePickImage}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Loading...' : 'Pick from Gallery'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!showResults ? (
        // Camera Screen
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onCameraReady={() => setCameraReady(true)}
          />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Image Recognition</Text>
          </View>

          {/* Real-time Recognition Display */}
          {realtimeObject && (
            <View style={styles.realtimeContainer}>
              <View style={styles.realtimeContent}>
                <Text style={styles.realtimeLabel}>识别到的物体</Text>
                <Text style={styles.realtimeEnglish}>{realtimeObject.name}</Text>
                {realtimeObject.finnish && (
                  <Text style={styles.realtimeFinnish}>{realtimeObject.finnish}</Text>
                )}
                {realtimeObject.chinese && (
                  <Text style={styles.realtimeChinese}>{realtimeObject.chinese}</Text>
                )}
                <Text style={styles.realtimeConfidence}>
                  信心度: {realtimeObject.confidence}%
                </Text>
              </View>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Bottom Controls */}
          <View style={styles.controlsContainer}>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.sideButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handlePickImage}
                disabled={loading}
              >
                <Text style={styles.sideButtonText}>📷 Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.captureButton,
                  (!cameraReady || loading) && styles.disabledButton,
                ]}
                onPress={handleTakePhoto}
                disabled={!cameraReady || loading}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              <View style={styles.sideButtonPlaceholder} />
            </View>
          </View>
        </View>
      ) : (
        // Results Screen
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <TouchableOpacity onPress={handleBackToCamera}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.resultsHeaderTitle}>Results</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView style={styles.resultsList}>
            {detectedObjects && detectedObjects.length > 0 ? (
              detectedObjects.map((obj, index) => (
                <View key={index} style={styles.objectCard}>
                  <View style={styles.objectNameContainer}>
                    <Text style={styles.objectLabel}>{obj.name || 'Unknown'}</Text>
                    {obj.finnish && (
                      <Text style={styles.objectFinnish}>{obj.finnish}</Text>
                    )}
                    {obj.chinese && (
                      <Text style={styles.objectChinese}>{obj.chinese}</Text>
                    )}
                  </View>
                  <View style={styles.confidenceContainer}>
                    <View style={styles.confidenceBarBg}>
                      <View
                        style={[
                          styles.confidenceBarFill,
                          {
                            width: `${Math.min(
                              parseFloat(obj.confidence || 0),
                              100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.confidenceValue}>
                      {obj.confidence}%
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No objects detected</Text>
                <Text style={styles.noResultsSubtext}>
                  Try taking a photo of an object or selecting a different image
                </Text>
              </View>
            )}
          </ScrollView>

          {detectedObjects && detectedObjects.length > 0 && (
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={handleBackToCamera}
            >
              <Text style={styles.tryAgainButtonText}>Try Another Image</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  realtimeContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  realtimeContent: {
    backgroundColor: 'rgba(100, 200, 255, 0.85)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  realtimeLabel: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 6,
    opacity: 0.8,
  },
  realtimeEnglish: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  realtimeFinnish: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
    opacity: 0.9,
  },
  realtimeChinese: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 6,
    opacity: 0.9,
  },
  realtimeConfidence: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  errorBanner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 10,
  },
  errorText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sideButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sideButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sideButtonPlaceholder: {
    width: 60,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  noPermissionContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noPermissionContent: {
    alignItems: 'center',
  },
  noPermissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  noPermissionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  resultsHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsList: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  objectCard: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  objectLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  objectNameContainer: {
    marginBottom: 8,
  },
  objectFinnish: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontStyle: 'italic',
  },
  objectChinese: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  confidenceValue: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    minWidth: 40,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
  },
  noResultsSubtext: {
    fontSize: 13,
    color: '#ccc',
    textAlign: 'center',
  },
  tryAgainButton: {
    margin: 12,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  tryAgainButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
