import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  english: string;
  finnish?: string;
  chinese?: string;
  confidence?: number; // 0..1
  onClose?: () => void;
}

const WordCard: React.FC<Props> = ({ english, finnish, chinese, confidence }) => {
  const pct =
    typeof confidence === 'number' ? (confidence * 100).toFixed(1) : null; // ✅ 1 位小数

  return (
    <View style={styles.container}>
      <Text style={styles.english}>{english}</Text>

      {/* ✅ 即使是空字符串也不渲染，防止占位 */}
      {finnish && finnish.trim().length > 0 ? (
        <Text style={styles.secondary}>{finnish}</Text>
      ) : null}

      {chinese && chinese.trim().length > 0 ? (
        <Text style={styles.secondary}>{chinese}</Text>
      ) : null}

      {pct !== null ? (
        <Text style={styles.confidence}>Relevance {pct}%</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF', // blue background
    padding: 20,
    borderRadius: 12,
  },
  english: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  secondary: {
    fontSize: 24,
    color: '#e0e0e0',
    marginBottom: 8,
  },
  confidence: {
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
  },
});

export default WordCard;
