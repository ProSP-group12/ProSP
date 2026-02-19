//CameraScreen.js
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { ActivityIndicator, StyleSheet, Text, View, FlatList, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [flashOn, setFlashOn] = useState(false);

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
    <View style={styles.root}>
      <View style={styles.cameraWrap}>
        {busy && capturedPhoto ? (
          <Image source={{ uri: capturedPhoto }} style={styles.camera} resizeMode="cover" />
        ) : (
          <CameraView
            ref={cameraRef}
            facing={facing}
            flash={flashOn ? 'on' : 'off'}
            style={styles.camera}
            responsiveOrientationWhenOrientationLocked
          />
        )}
        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(0,0,0,0.55)',
            'rgba(0,0,0,0.22)',
            'rgba(0,0,0,0.0)',
          ]}
          locations={[0, 0.55, 1]}
          style={styles.scrimTop}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(0,0,0,0.0)',
            'rgba(0,0,0,0.22)',
            'rgba(0,0,0,0.65)',
          ]}
          locations={[0, 0.45, 1]}
          style={styles.scrimBottom}
        />
      </View>

      {/* Top row: flash + hint text */}
      <View style={styles.topRow}>
        <Pressable
          onPress={() => setFlashOn((v) => !v)}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
          accessibilityLabel={flashOn ? 'Turn flash off' : 'Turn flash on'}
        >
          <Ionicons
            name={flashOn ? 'flash' : 'flash-off'}
            size={18}
            color="#FFFFFF"
          />
        </Pressable>
        <View style={styles.topHintPill}>
          <Text
            style={styles.topHintText}
            numberOfLines={1}
          >
            {t('camera.subtitle')}
          </Text>
        </View>
      </View>

      {/* Center overlay */}
      <View style={styles.centerOverlay} pointerEvents="none">
        <View style={styles.focusFrame}>
          <View style={styles.focusDot} />
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <Pressable
          onPress={handleCapture}
          disabled={busy}
          style={({ pressed }) => [
            styles.shutter,
            pressed && !busy ? styles.shutterPressed : null,
            busy ? styles.shutterDisabled : null,
          ]}
          accessibilityLabel={t('camera.takePhoto')}
        >
          <View style={styles.shutterInner} />
        </Pressable>

        <Pressable
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          style={({ pressed }) => [
            styles.switchCam,
            pressed && styles.iconButtonPressed,
          ]}
          accessibilityLabel={facing === 'back' ? (t('camera.switchToFront') || 'Switch to Front Camera') : (t('camera.switchToBack') || 'Switch to Back Camera')}
        >
          <Ionicons name="camera-reverse" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Bottom sheet / toast for states */}
      {busy ? (
        <View style={styles.sheet}>
          <View style={styles.sheetRow}>
            <ActivityIndicator color="#000" />
            <Text style={styles.sheetTitle}>{t('camera.analyzing')}</Text>
          </View>
          <View style={{ height: 10 }} />
          <Button
            title={t('camera.cancelCapture')}
            variant="secondary"
            onPress={() => {
              setBusy(false);
              setCapturedPhoto(null);
            }}
          />
        </View>
      ) : vocab ? (
        <View style={styles.sheet}>
          <Text style={styles.sheetLabel}>{t('camera.resultTitle')}</Text>
          <FlatList
            data={vocab}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Text style={styles.detectedWord}>{item.word}</Text>
            )}
          />
          <View style={{ height: 12 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button title={t('camera.addToVocabulary')} onPress={handleAdd} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title={t('camera.cancel')} variant="secondary" onPress={() => setVocab(null)} />
            </View>
          </View>
        </View>
      ) : notGood ? (
        <View style={styles.sheet}>
          <Text style={styles.sheetLabel}>{t('camera.photoIssue')}</Text>
          <Text style={styles.sheetTitle}>{t('camera.tryAnother')}</Text>
          {detectError ? (
            <Text style={styles.errorText} numberOfLines={3}>
              {detectError}
            </Text>
          ) : null}
          <View style={{ height: 12 }} />
          <Button
            title={t('camera.retake')}
            onPress={() => {
              setNotGood(false);
              setDetectError(null);
            }}
          />
        </View>
      ) : null}
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
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  camera: { flex: 1 },
  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  scrimBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },

  topRow: {
    position: 'absolute',
    top: 34,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topHintPill: {
    marginLeft: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  topHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  centerOverlay: {
    position: 'absolute',
    top: 175,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  focusFrame: {
    width: 240,
    height: 240,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    position: 'relative',
  },
  focusDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -3 }, { translateY: -3 }],
  },

  bottomControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  shutterPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  shutterDisabled: {
    opacity: 0.55,
  },
  switchCam: {
    position: 'absolute',
    right: 22,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },

  sheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.55)',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sheetLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#444',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  },
  detectedWord: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  errorText: {
    marginTop: 8,
    color: '#C62828',
    fontSize: 12,
    fontWeight: '700',
  },
});
