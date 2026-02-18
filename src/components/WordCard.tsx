import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  english: string;
  finnish?: string;
  chinese?: string;
  confidence?: number;
  onClose?: () => void;
}

const WordCard: React.FC<Props> = ({ english, finnish, chinese, confidence }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.english}>{english}</Text>
      {finnish ? <Text style={styles.secondary}>{finnish}</Text> : null}
      {chinese ? <Text style={styles.secondary}>{chinese}</Text> : null}
      {confidence !== undefined && (
        <Text style={styles.confidence}>{(confidence * 100).toFixed(0)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  english: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  secondary: {
    fontSize: 24,
    color: '#ccc',
    marginBottom: 8,
  },
  confidence: {
    fontSize: 18,
    color: '#0f0',
    marginTop: 16,
  },
});

export default WordCard;