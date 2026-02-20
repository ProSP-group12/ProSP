import React, { useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { MaterialIcons } from '@expo/vector-icons';
import WordCard from '../components/WordCard';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; 

export default function MainScreen() {
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();

  const [capturedPhotoUri, setCapturedPhotoUri] = useState(null);
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) return requestPermission();

  const toggleCameraFacing = () =>
    setFacing(prev => (prev === 'back' ? 'front' : 'back'));

  const handleCapture = async () => {
    if (!cameraRef.current || loading) return;

    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedPhotoUri(photo.uri);

      const base64Image = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: 'base64',
      });

      // Google Vision API call
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64Image },
                features: [{ type: 'LABEL_DETECTION', maxResults: 1 }],
              },
            ],
          }),
        }
      );

      const result = await response.json();

      // Correct field for LABEL_DETECTION
      const detectedWord =
        result.responses?.[0]?.labelAnnotations?.[0]?.description || 'Unknown';

      // If no object detected, show fallback
      if (detectedWord === 'Unknown') {
        setWord({
          text: 'Unknown',
          definitions: [
            { number: 1, definition: 'Object not detected.', example: null, synonyms: [] },
          ],
        });
      } else {
        fetchDefinition(detectedWord);
      }
    } catch (err) {
      console.log(err);
      setWord({
        text: 'Error',
        definitions: [
          { number: 1, definition: 'Failed to detect object.', example: null, synonyms: [] },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDefinition = async detectedWord => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${detectedWord}`
      );
      const json = await response.json();
      const entry = json[0];

      const phonetic =
        entry?.phonetic || entry?.phonetics?.find(p => p.text)?.text || '';
      const meaning = entry?.meanings?.[0];
      const partOfSpeech = meaning?.partOfSpeech || '';
      const definitions = meaning?.definitions || [];

      setWord({
        text: detectedWord,
        phonetic,
        partOfSpeech,
        definitions: definitions.map((def, i) => ({
          number: i + 1,
          definition: def.definition,
          example: def.example || null,
          synonyms: def.synonyms || [],
        })),
      });
    } catch (err) {
      setWord({
        text: detectedWord,
        phonetic: '',
        partOfSpeech: '',
        definitions: [
          { number: 1, definition: 'Definition not found.', example: null, synonyms: [] },
        ],
      });
    }
  };

  const saveWord = async () => {
    if (!word) return;
    try {
      const existing = await AsyncStorage.getItem('savedWords');
      const words = existing ? JSON.parse(existing) : [];
      const updated = [...words, word];
      await AsyncStorage.setItem('savedWords', JSON.stringify(updated));
      alert('Word saved!');
    } catch (err) {
      console.log(err);
    }
  };

  const reset = () => {
    setCapturedPhotoUri(null);
    setWord(null);
  };

  return (
    <View style={styles.container}>
      {capturedPhotoUri ? (
        <Image source={{ uri: capturedPhotoUri }} style={styles.camera} />
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      )}

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>WordCap</Text>
        <TouchableOpacity onPress={toggleCameraFacing}>
          <MaterialIcons name="flip-camera-ios" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Capture Button */}
      {!capturedPhotoUri && (
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="large" color="white" /> : <View style={styles.innerCircle} />}
          </TouchableOpacity>
        </View>
      )}

      {/* Word Card */}
      {word && <WordCard word={word} onClose={reset} onSave={saveWord} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 60,
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  captureContainer: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white' },
});
