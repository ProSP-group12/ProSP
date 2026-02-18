import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SavedWordsScreen() {
  const [savedWords, setSavedWords] = useState([]);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    const data = await AsyncStorage.getItem('savedWords');
    if (data) setSavedWords(JSON.parse(data));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Words</Text>

      <FlatList
        data={savedWords}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.word}>{item.text}</Text>
            <Text style={styles.definition}>
              {item.definitions[0]?.definition}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  word: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  definition: {
    color: '#aaa',
    marginTop: 5,
  },
});
