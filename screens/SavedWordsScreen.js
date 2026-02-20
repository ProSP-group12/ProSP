import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SavedWordsScreen({ navigation }) {
  const [savedWords, setSavedWords] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWords();
    });
    return unsubscribe;
  }, [navigation]);

  const loadWords = async () => {
    const data = await AsyncStorage.getItem('savedWords');
    if (data) setSavedWords(JSON.parse(data));
    else setSavedWords([]);
  };

  const deleteWord = (index) => {
    Alert.alert(
      'Delete Word',
      'Are you sure you want to delete this word?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = [...savedWords];
            updated.splice(index, 1);
            setSavedWords(updated);
            await AsyncStorage.setItem('savedWords', JSON.stringify(updated));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Words</Text>

      <FlatList
        data={savedWords}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('WordDetails', { word: item })}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={styles.word}>{item.text}</Text>
                <Text style={styles.definition}>
                  {item.definitions[0]?.definition}
                </Text>
              </View>

              <TouchableOpacity onPress={() => deleteWord(index)}>
                <Text style={styles.deleteButton}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
  deleteButton: {
    fontSize: 20,
    color: 'red',
  },
});
