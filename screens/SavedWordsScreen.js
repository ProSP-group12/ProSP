import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SavedWordsScreen({ navigation }) {
  const [savedWords, setSavedWords] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadWords);
    return unsubscribe;
  }, [navigation]);

  const loadWords = async () => {
    const data = await AsyncStorage.getItem('savedWords');
    setSavedWords(data ? JSON.parse(data) : []);
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

      {savedWords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="menu-book" size={60} color="#2A2A33" />
          <Text style={styles.emptyText}>
            No saved words yet
          </Text>
          <Text style={styles.emptySub}>
            Capture something to start building your vocabulary.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedWords}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.textContainer}
                onPress={() =>
                  navigation.navigate('WordDetails', { word: item })
                }
              >
                <Text style={styles.word}>{item.text}</Text>
                <Text style={styles.definition} numberOfLines={2}>
                  {item.definitions[0]?.definition}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteWord(index)}
              >
                <MaterialIcons name="delete-outline" size={22} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
    marginBottom: 25,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#16161D',
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  word: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  definition: {
    color: '#A1A1AA',
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    paddingLeft: 10,
  },
  emptyContainer: {
    marginTop: 120,
    alignItems: 'center',
  },
  emptyText: {
    color: '#444',
    marginTop: 20,
    fontSize: 16,
  },
  emptySub: {
    color: '#333',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
