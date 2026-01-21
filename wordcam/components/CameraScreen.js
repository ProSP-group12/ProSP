import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Card, SubTitle, Title } from './ui';
import { generateVocabularyForObject, simulateDetection } from './vocab';
import { detectGood } from './api';

export function CameraScreen({ onAddVocabulary }) {
  const { t } = useTranslation();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [detected, setDetected] = useState(null);
  const [notGood, setNotGood] = useState(false);
  const [detectError, setDetectError] = useState(null);

  const canUseCamera = permission?.granted;

  const header = useMemo(() => {
    if (!detected) return null;
    return `${detected.label}${detected.zh ? ` / ${detected.zh}` : ''}`;
  }, [detected]);

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
    setDetected(null);
    setNotGood(false);

    try {
      // Capture an image and keep its uri so we can create a sticker.
      const photo = await cameraRef.current?.takePictureAsync?.({ quality: 0.6 });

      setDetectError(null);

      // Optional remote/local check to determine if the photo is "good".
      try {
        const isGood = await detectGood(photo?.uri);
        if (!isGood) {
          setNotGood(true);
          return;
        }
      } catch (e) {
        // Capture any error message for UI debugging.
        console.error('detectGood threw:', e?.message || e);
        setDetectError(e?.message || String(e));
        setNotGood(true);
        return;
      }

      // Simulate AI detection + vocab generation and attach the photo uri.
      const det = simulateDetection();
      setDetected({ ...det, uri: photo?.uri ?? null });
    } finally {
      setBusy(false);
    }
  }

  function handleAdd() {
    if (!detected) return;
    const items = generateVocabularyForObject(detected.label, detected.uri);
    onAddVocabulary?.(items);
    setDetected(null);
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
        ) : detected ? (
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>{t('camera.resultTitle')}</Text>
            <Text style={styles.resultTitle}>{header}</Text>
            <View style={{ height: 12 }} />
            <Button title={t('camera.addToVocabulary')} onPress={handleAdd} />
          </Card>
        ) : notGood ? (
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>{t('camera.badPhotoTitle') || 'Photo quality'}</Text>
            <Text style={styles.resultTitle}>{t('camera.badPhotoBody') || 'That photo looks blurry or unsuitable — try again.'}</Text>
            {detectError ? (
              <Text style={{ color: '#F6C8C8', marginTop: 8 }}>{`Error: ${detectError}`}</Text>
            ) : null}
            <View style={{ height: 12 }} />
            <Button title={t('camera.retake') || 'Retake'} onPress={() => { setNotGood(false); setDetectError(null); }} />
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
    backgroundColor: '#0B0F17',
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
    borderColor: '#1E2A44',
    backgroundColor: '#05070C'
  },
  camera: {
    flex: 1
  },
  bottom: {
    paddingTop: 14
  },
  resultCard: {
    marginTop: 2
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  resultText: {
    color: '#E8EEF8',
    fontSize: 16,
    fontWeight: '700'
  },
  resultLabel: {
    color: '#9FB2D1',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  resultTitle: {
    color: '#E8EEF8',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6
  }
});

