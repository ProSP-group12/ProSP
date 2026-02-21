import React, { useRef, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Image,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import WordCard from '../components/WordCard';
import { GOOGLE_API_KEY } from '@env';

export default function MainScreen() {
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState(false);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState(null);
  const [word, setWord] = useState(null);

  useEffect(() => {
    (async () => {
      if (!permission || !permission.granted) {
        const result = await requestPermission();
        setHasPermission(result.granted);
      } else {
        setHasPermission(true);
      }
    })();
  }, []);

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required
        </Text>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(prev => (prev === 'back' ? 'front' : 'back'));
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync();
    setCapturedPhotoUri(photo.uri);

    const base64Image = await FileSystem.readAsStringAsync(photo.uri, {
      encoding: 'base64',
    });

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: 'OBJECT_LOCALIZATION', maxResults: 1 }],
            },
          ],
        }),
      }
    );

    const result = await response.json();
    const mainObject =
      result.responses?.[0]?.localizedObjectAnnotations?.[0]?.name || 'Unknown';

    fetchDefinition(mainObject);
  };

  const fetchDefinition = async (detectedWord) => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${detectedWord}`
      );

      const json = await response.json();
      const entry = json[0];

      const phonetic =
        entry?.phonetic ||
        entry?.phonetics?.find(p => p.text)?.text ||
        '';

      const meaning = entry?.meanings?.[0];
      const definitions = meaning?.definitions || [];

      const formattedDefinitions = definitions.map((def, index) => ({
        number: index + 1,
        definition: def.definition,
        example: def.example || null,
        synonyms: def.synonyms || [],
      }));

      setWord({
        text: detectedWord,
        phonetic,
        partOfSpeech: meaning?.partOfSpeech || '',
        definitions: formattedDefinitions,
      });
    } catch (error) {
      setWord({
        text: detectedWord,
        phonetic: '',
        partOfSpeech: '',
        definitions: [
          {
            number: 1,
            definition: 'Definition not found.',
            example: null,
            synonyms: [],
          },
        ],
      });
    }
  };

  const saveWord = async () => {
    if (!word) return;
    const existing = await AsyncStorage.getItem('savedWords');
    const words = existing ? JSON.parse(existing) : [];
    const updated = [...words, word];
    await AsyncStorage.setItem('savedWords', JSON.stringify(updated));
  };

  const reset = () => {
    setCapturedPhotoUri(null);
    setWord(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera or Captured Image */}
      {capturedPhotoUri ? (
        <Image source={{ uri: capturedPhotoUri }} style={styles.camera} />
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
      )}

      {/* Gradient Overlay for cinematic look */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.85)']}
        style={StyleSheet.absoluteFill}
      />

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
          >
            <View style={styles.innerCircle} />
          </TouchableOpacity>
        </View>
      )}

      {/* WordCard */}
      <WordCard word={word} onClose={reset} onSave={saveWord} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionText: { color: 'white', fontSize: 18 },
  camera: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 15,
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: { color: 'white', fontSize: 26, fontWeight: '700', letterSpacing: 1 },
  captureContainer: {
    position: 'absolute',
    bottom: 50, // lowered the button a bit
    width: '100%',
    alignItems: 'center',
  },
  captureButton: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
});
