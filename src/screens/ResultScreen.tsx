import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import WordCard from '../components/WordCard';
import { DetectedObject, translateLabel } from '../services/objectDetection';

interface Props {
  objects: DetectedObject[];
  onBack: () => void;
}

interface Translation {
  english: string;
  finnish: string;
  chinese: string;
}

const emptyTranslation: Translation = {
  english: '',
  finnish: '',
  chinese: '',
};

const ResultScreen: React.FC<Props> = ({ objects, onBack }) => {
  const top = objects && objects.length > 0 ? objects[0] : null;

  const translation: Translation = top ? translateLabel(top.label) : emptyTranslation;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {top && (
        <WordCard
          english={translation.english}
          finnish={translation.finnish}
          chinese={translation.chinese}
          confidence={top.confidence}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default ResultScreen;
