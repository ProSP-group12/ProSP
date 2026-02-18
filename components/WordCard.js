import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function WordCard({ word, onClose, onSave }) {
  if (!word) return null;

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.word}>{word.text}</Text>

        {word.phonetic ? (
          <Text style={styles.phonetic}>{word.phonetic}</Text>
        ) : null}

        {word.partOfSpeech ? (
          <Text style={styles.partOfSpeech}>{word.partOfSpeech}</Text>
        ) : null}

        {word.definitions.map((def) => (
          <View key={def.number} style={styles.definitionBlock}>
            <Text style={styles.definition}>
              {def.number}. {def.definition}
            </Text>

            {def.example && (
              <Text style={styles.example}>
                Example: "{def.example}"
              </Text>
            )}

            {def.synonyms.length > 0 && (
              <Text style={styles.synonyms}>
                Synonyms: {def.synonyms.slice(0, 5).join(', ')}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <MaterialIcons name="bookmark" size={20} color="white" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '60%',
    backgroundColor: '#121212',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: '#444',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 15,
  },
  word: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  phonetic: {
    fontSize: 18,
    color: '#aaa',
    marginTop: 4,
  },
  partOfSpeech: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#6ab7ff',
    marginTop: 8,
  },
  definitionBlock: {
    marginTop: 15,
  },
  definition: {
    fontSize: 16,
    color: 'white',
  },
  example: {
    fontSize: 14,
    color: '#bbb',
    fontStyle: 'italic',
    marginTop: 6,
  },
  synonyms: {
    fontSize: 14,
    color: '#4caf50',
    marginTop: 6,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    marginLeft: 5,
  },
});
