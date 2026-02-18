import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import WordCard from '../components/WordCard';
import { DetectedObject, translateLabel } from '../services/objectDetection';

interface Props {
  photoPath: string;
  objects: DetectedObject[];
  onBack: () => void;
}

interface Translation {
  english: string;
  finnish: string;
  chinese: string;
}

const emptyTranslation: Translation = { english: '', finnish: '', chinese: '' };

const ResultScreen: React.FC<Props> = ({ photoPath, objects, onBack }) => {
  const top = objects && objects.length > 0 ? objects[0] : null;
  const translation: Translation = top ? translateLabel(top.label) : emptyTranslation;

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
        {top ? (
          <WordCard
            english={translation.english}
            finnish={translation.finnish}
            chinese={translation.chinese}
            confidence={top.confidence}
          />
        ) : (
          <Text style={styles.noResultText}>No objects detected.</Text>
        )}
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
});

export default ResultScreen;
