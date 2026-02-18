import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import WordCard from '../components/WordCard';
import { DetectedObject } from '../services/objectDetection';

interface Props {
  photoPath: string;
  objects: DetectedObject[];
  onBack: () => void;
  recognizing?: boolean;
}

interface Translation {
  english: string;
  finnish: string;
  chinese: string;
}

const emptyTranslation: Translation = { english: '', finnish: '', chinese: '' };

const ResultScreen: React.FC<Props> = ({ photoPath, objects, onBack, recognizing }) => {
  // pick highest-confidence object (sorted by confidence desc)
  const sorted = objects && objects.length > 0 ? [...objects].sort((a, b) => b.confidence - a.confidence) : [];
  const top = sorted.length > 0 ? sorted[0] : null;

  const hasPhoto = !!photoPath && photoPath.length > 0;
  const uri = hasPhoto
    ? (photoPath.startsWith('file://') ? photoPath : `file://${photoPath}`)
    : '';

  return (
    <View style={styles.container}>
      {hasPhoto ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.emptyBg]}>
          <Text style={styles.noPhotoText}>No photo to preview.</Text>
        </View>
      )}

      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.bottomPanel}>
        {recognizing ? (
          <Text style={styles.recognizingText}>Recognizing...</Text>
        ) : top ? (
          <WordCard
            english={top.label || ''}
            finnish={top.finnish || ''}
            chinese={top.chinese || ''}
            confidence={top.confidence}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  emptyBg: { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  noPhotoText: { color: '#fff', fontSize: 16 },

  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  backText: { color: '#fff', fontSize: 18 },

  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  noResultText: { color: '#fff', fontSize: 16 },
  recognizingText: { color: '#fff', fontSize: 18, textAlign: 'center', fontWeight: 'bold' },
});

export default ResultScreen;
