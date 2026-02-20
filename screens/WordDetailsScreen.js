import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function WordDetailsScreen({ route, navigation }) {
  const { word } = route.params;

  if (!word) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{word.text}</Text>
      </View>

      {/* Word Info */}
      <View style={styles.content}>
        {word.phonetic ? <Text style={styles.phonetic}>/{word.phonetic}/</Text> : null}
        {word.partOfSpeech ? <Text style={styles.partOfSpeech}>{word.partOfSpeech}</Text> : null}

        {word.definitions.map((def) => (
          <View key={def.number} style={styles.definitionBlock}>
            <Text style={styles.definition}>
              {def.number}. {def.definition}
            </Text>
            {def.example && (
              <Text style={styles.example}>Example: "{def.example}"</Text>
            )}
            {def.synonyms.length > 0 && (
              <Text style={styles.synonyms}>
                Synonyms: {def.synonyms.slice(0, 5).join(', ')}
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold', marginLeft: 15 },
  content: { flex: 1 },
  phonetic: { color: '#aaa', fontSize: 18, marginBottom: 5 },
  partOfSpeech: { color: '#6ab7ff', fontSize: 16, fontStyle: 'italic', marginBottom: 15 },
  definitionBlock: { marginBottom: 15 },
  definition: { color: 'white', fontSize: 16 },
  example: { color: '#bbb', fontSize: 14, fontStyle: 'italic', marginTop: 5 },
  synonyms: { color: '#4caf50', fontSize: 14, marginTop: 5 },
});
