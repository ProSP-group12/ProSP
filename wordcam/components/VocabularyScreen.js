import { useMemo, useRef, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Import UI components from the separate ui.js file
import { Button, Card, Title } from './ui';

// Format timestamp to local string
function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
}

// Fetch phonetic pronunciation for a word
async function fetchPhonetic(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0];
      if (entry.phonetic) return entry.phonetic;
      if (entry.phonetics && Array.isArray(entry.phonetics) && entry.phonetics.length > 0) {
        const phonetic = entry.phonetics.find(p => p.text) || entry.phonetics[0];
        return phonetic?.text || null;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function VocabularyScreen({ vocabulary, onClear, onDelete }) {
  const { i18n, t } = useTranslation();

  const data = useMemo(() => vocabulary ?? [], [vocabulary]);
  
  // Cache phonetics for words
  const [phonetics, setPhonetics] = useState({});
  
  // Fetch phonetics for all words when vocabulary changes
  useEffect(() => {
    const fetchAllPhonetics = async () => {
      const newPhonetics = {};
      for (const item of data) {
        if (item.word && !phonetics[item.word]) {
          const phonetic = await fetchPhonetic(item.word);
          if (phonetic) {
            newPhonetics[item.word] = phonetic;
          }
        }
      }
      if (Object.keys(newPhonetics).length > 0) {
        setPhonetics(prev => ({ ...prev, ...newPhonetics }));
      }
    };
    fetchAllPhonetics();
  }, [data]);

  // Play example sound for a word
  const playExampleSound = async (word) => {
    try {
      const lang = i18n.language === 'zh' ? 'zh-CN' : 'en';
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=${lang}&client=tw-ob`;
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      // Ignore audio errors silently
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Title>{t('vocabulary.title')}</Title>
        <Button
          title={t('vocabulary.clear')}
          onPress={onClear}
          disabled={!data.length}
          variant="secondary"
        />
      </View>

      {!data.length ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('vocabulary.empty')}</Text>
        </Card>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 18 }}
          renderItem={({ item }) => (
            <Card style={styles.itemCard}>
              <View style={styles.itemTop}>
                <View style={styles.wordRow}>
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.sticker}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.word}>{item.word}</Text>
                    {phonetics[item.word] ? (
                      <Text style={styles.phonetic}>{phonetics[item.word]}</Text>
                    ) : null}
                  </View>
                  
                  {/* Play Sound Button */}
                  <Pressable
                    onPress={() => playExampleSound(item.word)}
                    style={({ pressed }) => [{
                      marginLeft: 8,
                      padding: 4,
                      borderRadius: 12,
                      backgroundColor: pressed ? '#cce5ff' : '#e6f2ff',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                    }]}
                    accessibilityLabel={t('vocabulary.sound') || 'Play sound'}
                  >
                    <Ionicons name="volume-medium" size={18} color="#007AFF" />
                  </Pressable>
                </View>
                
                {/* Delete Button */}
                <Pressable
                  onPress={() => onDelete?.(item.id)}
                  style={({ pressed }) => [{
                    marginLeft: 8,
                    padding: 4,
                    borderRadius: 12,
                    backgroundColor: pressed ? '#eee' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                  }]}
                  accessibilityLabel={t('vocabulary.delete') || 'Delete'}
                >
                  <Ionicons name="close-circle-outline" size={24} color="#FF3B30" />
                </Pressable>
              </View>
              <Text style={styles.meta}>
                {t('vocabulary.addedAt')}: {formatDate(item.createdAt)}
              </Text>
              {!!item.source ? (
                <Text style={styles.meta}>Source: {item.source}</Text>
              ) : null}
            </Card>
          )}
        />
      )}
    </View>
  );
}

// Styles specifically for VocabularyScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14
  },
  emptyCard: {
    marginTop: 10
  },
  emptyText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600'
  },
  itemCard: {
    marginBottom: 12
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center', // Changed from baseline to center
    justifyContent: 'space-between',
    gap: 12
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1 // Allow word row to take available space pushing delete button to the right
  },
  word: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700'
  },
  sticker: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  phonetic: {
    color: '#666666',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 2
  },
  meta: {
    marginTop: 6,
    color: '#666666',
    fontSize: 12,
    fontWeight: '600'
  }
});