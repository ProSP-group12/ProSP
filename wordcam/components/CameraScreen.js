import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Card, SubTitle, Title } from './ui';
import { detectGood } from './api';

export function CameraScreen({ onAddVocabulary }) {
  const { t } = useTranslation();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [vocab, setVocab] = useState(null);
  const [notGood, setNotGood] = useState(false);
  const [detectError, setDetectError] = useState(null);

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

    try {
      const photo = await cameraRef.current?.takePictureAsync?.({ quality: 0.6 });

      setDetectError(null);

      const result = await detectGood(photo?.uri);

      if (!result?.good || !result?.vocab?.length) {
        setNotGood(true);
        return;
      }

      const now = Date.now();
      setVocab(result.vocab.map((item, i) => ({
        id: `${now}-${i}`,
        word: item.word,
        zh: item.zh,
        image: photo?.uri,
        createdAt: now
      })));

    } catch (e) {
      console.error('detectGood failed:', e);
      setDetectError(e?.message || String(e));
      setNotGood(true);
    } finally {
      setBusy(false);
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
      </View>

      <View style={styles.cameraWrap}>
        <CameraView
          ref={cameraRef}
          facing="back"
          style={styles.camera}
          responsiveOrientationWhenOrientationLocked
        />
      </View>

      <View style={styles.bottom}>
        {busy ? (
          <Card style={styles.resultCard}>
            <View style={styles.row}>
              <ActivityIndicator />
              <Text style={styles.resultText}>{t('camera.analyzing')}</Text>
            </View>
          </Card>
        ) : vocab ? (
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>Detected Vocabulary</Text>

            <FlatList
              data={vocab}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Text style={styles.word}>
                  {item.word} — {item.zh}
                </Text>
              )}
            />

            <View style={{ height: 12 }} />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Button title="Add to Vocabulary" onPress={handleAdd} />
              <Button title="Cancel" variant="secondary" onPress={() => setVocab(null)} />
            </View>
          </Card>
        ) : notGood ? (
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>Photo issue</Text>
            <Text style={styles.resultTitle}>Try another clearer photo</Text>

            {detectError ? (
              <Text style={{ color: '#C62828', marginTop: 8 }}>
                Error: {detectError}
              </Text>
            ) : null}

            <View style={{ height: 12 }} />
            <Button title="Retake" onPress={() => {
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
