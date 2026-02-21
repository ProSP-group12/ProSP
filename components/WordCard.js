import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ACCENT = '#6D5DD3';

export default function WordCard({ word, onClose, onSave }) {
  if (!word) return null;

  return (
    <View style={styles.container}>
      <View style={styles.handle} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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
                “{def.example}”
              </Text>
            )}

            {def.synonyms.length > 0 && (
              <Text style={styles.synonyms}>
                {def.synonyms.slice(0, 5).join(', ')}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <MaterialIcons name="bookmark" size={20} color="white" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#aaa" />
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
    height: '65%',
    backgroundColor: '#16161D',
    paddingHorizontal: 24,
    paddingTop: 15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: '#2A2A33',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  word: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  phonetic: {
    fontSize: 18,
    color: '#A1A1AA',
    marginTop: 6,
  },
  partOfSpeech: {
    fontSize: 15,
    fontStyle: 'italic',
    color: ACCENT,
    marginTop: 8,
  },
  definitionBlock: {
    marginTop: 20,
  },
  definition: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
  },
  example: {
    fontSize: 14,
    color: '#A1A1AA',
    fontStyle: 'italic',
    marginTop: 8,
  },
  synonyms: {
    fontSize: 14,
    color: ACCENT,
    marginTop: 8,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: ACCENT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '600',
  },
});
