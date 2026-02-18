import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMemo, useRef, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { ActivityIndicator, StyleSheet, Text, View, FlatList, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Button, Card, SubTitle, Title } from './ui';
import { detectGood } from './api';

export function CameraScreen({ onAddVocabulary }) {
  const { t } = useTranslation();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [vocab, setVocab] = useState(null);
  const [notGood, setNotGood] = useState(false);
  const [detectError, setDetectError] = useState(null);
  const [facing, setFacing] = useState('back');

  // Play example sound for the first vocab word when vocab appears
  useEffect(() => {
    if (vocab && Array.isArray(vocab) && vocab.length > 0) {
      const playExampleSound = async (word) => {
        try {
          const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en&client=tw-ob`;
          const { sound } = await Audio.Sound.createAsync({ uri: url });
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              sound.unloadAsync();
            }
          });
        } catch (e) {
          // Ignore errors
        }
      };
      playExampleSound(vocab[0].word);
    }
  }, [vocab]);

  const canUseCamera = permission?.granted;

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!canUseCamera) {
    return (
      <View style={styles.container}>
        <Card>
          <Title>{t('camera.permissionTitle')}</Title>
          <SubTitle>{t('camera.permissionBody')}</SubTitle>
          <View style={{ height: 14 }} />
          <Button title={t('camera.grant')} onPress={requestPermission} />
        </Card>
      </View>
    );
  }

  async function handleCapture() {
    if (busy) return;
    setBusy(true);
    setVocab(null);
    setNotGood(false);
    setCapturedPhoto(null);

    try {
      const photo = await cameraRef.current?.takePictureAsync?.({ quality: 0.6 });
      setCapturedPhoto(photo?.uri);
      setDetectError(null);

      const result = await detectGood(photo?.uri);

      if (!result?.good || !result?.vocab?.length) {
        setNotGood(true);
        return;
      }

      const now = Date.now();
      // Only keep the first detected vocab
      const first = result.vocab[0];
      setVocab([
        {
          id: `${now}-0`,
          word: first.word,
          image: photo?.uri,
          createdAt: now
        }
      ]);

    } catch (e) {
      console.error('detectGood failed:', e);
      setDetectError(e?.message || String(e));
      setNotGood(true);
    } finally {
      setBusy(false);
      // keep capturedPhoto until next capture
    }
  }

  function handleAdd() {
    if (!vocab) return;
    onAddVocabulary?.(vocab);
    setVocab(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Title>{t('camera.title')}</Title>
        <SubTitle>{t('camera.subtitle')}</SubTitle>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
          <Pressable
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            style={({ pressed }) => [{
              padding: 6,
              borderRadius: 18,
              backgroundColor: pressed ? '#eee' : '#fff',
              borderWidth: 1,
              borderColor: '#FFD700',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              marginRight: 2
            }]}
            accessibilityLabel={facing === 'back' ? (t('camera.switchToFront') || 'Switch to Front Camera') : (t('camera.switchToBack') || 'Switch to Back Camera')}
          >
            <Ionicons
              name={facing === 'back' ? 'camera-reverse' : 'camera'}
              size={20}
              color="#FFD700"
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.cameraWrap}>
        {busy && capturedPhoto ? (
          <Image source={{ uri: capturedPhoto }} style={styles.camera} resizeMode="cover" />
        ) : (
          <CameraView
            ref={cameraRef}
            facing={facing}
            style={styles.camera}
            responsiveOrientationWhenOrientationLocked
          />
        )}
      </View>

      <View style={styles.bottom}>
        {busy ? (
          <Card style={styles.resultCard}>
            <View style={styles.row}>
              <ActivityIndicator />
              <Text style={styles.resultText}>{t('camera.analyzing')}</Text>
            </View>
            <View style={{ height: 12 }} />
            <Button title={t('camera.cancelCapture')} variant="secondary" onPress={() => { setBusy(false); setCapturedPhoto(null); }} />
          </Card>
        ) : vocab ? (
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>Detected Vocabulary</Text>

            <FlatList
              data={vocab}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Text style={styles.word}>
                  {item.word}
                </Text>
              )}
            />

            <View style={{ height: 12 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button title={t('camera.addToVocabulary')} onPress={handleAdd} />
              <Button title={t('camera.cancel')} variant="secondary" onPress={() => setVocab(null)} />
            </View>
          </Card>
        ) : notGood ? (
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>{t('camera.photoIssue')}</Text>
            <Text style={styles.resultTitle}>{t('camera.tryAnother')}</Text>

            {detectError ? (
              <Text style={{ color: '#C62828', marginTop: 8 }}>
                Error: {detectError}
              </Text>
            ) : null}

            <View style={{ height: 12 }} />
            <Button title={t('camera.retake')} onPress={() => {
              setNotGood(false);
              setDetectError(null);
            }} />
          </Card>
        ) : (
          <Button title={t('camera.takePhoto')} onPress={handleCapture} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16
  },
  top: {
    paddingTop: 4,
    paddingBottom: 10
  },
  cameraWrap: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: '#FFFFFF'
  },
  camera: { flex: 1 },
  bottom: { paddingTop: 14 },
  resultCard: { marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  resultText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700'
  },

  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444'
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6
  },

  word: {
    fontSize: 16,
    marginTop: 6
  }
});
