//VocabularyScreen.js
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
// Import useTheme to access global color variables
import { useTheme } from '@react-navigation/native';

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

// Added onToggleFavorite prop
export function VocabularyScreen({ vocabulary, onClear, onDelete, onToggleFavorite }) {
  const { i18n, t } = useTranslation();
  // Extract global theme color variables
  const { colors } = useTheme();

  const data = useMemo(() => vocabulary ?? [], [vocabulary]);
  
  // State for filter: 'all' or 'favorites'
  const [filter, setFilter] = useState('all');

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

  // Filter data based on selected tab
  const filteredData = useMemo(() => {
    if (filter === 'favorites') {
      return data.filter(item => item.isFavorite);
    }
    return data;
  }, [data, filter]);

  return (
    <View style={styles.container}>
      {/* Replaced Title and Clear with Filter Bar */}
      <View style={styles.filterRow}>
        <Pressable 
          onPress={() => setFilter('all')}
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </Pressable>
        <Pressable 
          onPress={() => setFilter('favorites')}
          style={[styles.filterTab, filter === 'favorites' && styles.filterTabActive]}
        >
          <Text style={[styles.filterText, filter === 'favorites' && styles.filterTextActive]}>
            Favourites
          </Text>
        </Pressable>
      </View>

      {!filteredData.length ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            {filter === 'favorites' ? 'No favourites yet.' : (t('vocabulary.empty') || 'No words added yet.')}
          </Text>
        </Card>
      ) : (
        <FlatList
          data={filteredData} // Use filtered data
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 18, paddingTop: 8 }}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <Card style={styles.itemCard}>
                
                <Pressable
                  onPress={() => onDelete?.(item.id)}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed
                  ]}
                  accessibilityLabel={t('vocabulary.delete') || 'Delete'}
                >
                  <Ionicons name="close" size={14} color="#888888" />
                </Pressable>

                <View style={styles.itemTop}>
                  <View style={styles.wordRow}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={styles.sticker}
                        resizeMode="cover"
                      />
                    ) : null}
                    
                    <View style={styles.textContainer}>
                      
                      <View style={styles.wordAndSoundRow}>
                        <Text style={styles.word}>{item.word}</Text>
                        
                        <Pressable
                          onPress={() => playExampleSound(item.word)}
                          style={({ pressed }) => [{
                            padding: 6,
                            borderRadius: 16,
                            backgroundColor: pressed ? `${colors.primary}33` : `${colors.primary}1A`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                          }]}
                          accessibilityLabel={t('vocabulary.sound') || 'Play sound'}
                        >
                          <Ionicons name="volume-medium" size={18} color={colors.primary} />
                        </Pressable>
                      </View>

                      {phonetics[item.word] ? (
                        <Text style={styles.phonetic}>{phonetics[item.word]}</Text>
                      ) : null}
                    </View>
                    
                    <Pressable
                      onPress={() => onToggleFavorite?.(item.id)}
                      style={({ pressed }) => [{
                        padding: 6,
                        borderRadius: 16,
                        // Provide simple gray feedback background
                        backgroundColor: pressed ? '#F0F0F0' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        // Removed marginLeft as it's no longer next to the sound button
                      }]}
                      accessibilityLabel="Toggle Favorite"
                    >
                      <Ionicons 
                        name={item.isFavorite ? "star" : "star-outline"} 
                        size={20} 
                        // Use theme variable for the active star color only
                        color={item.isFavorite ? colors.primary : "#CCCCCC"} 
                      />
                    </Pressable>

                  </View>
                </View>
                <Text style={styles.meta}>
                  {t('vocabulary.addedAt') || 'Added'}: {formatDate(item.createdAt)}
                </Text>
                {!!item.source ? (
                  <Text style={styles.meta}>Source: {item.source}</Text>
                ) : null}
              </Card>
            </View>
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
    backgroundColor: '#F5F5F5',
    padding: 16
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#EAEAEA',
    borderRadius: 8,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
  },
  filterTextActive: {
    color: '#333333',
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

  cardWrapper: {
    marginBottom: 16,
    marginTop: 6,
    paddingLeft: 4, 
    marginHorizontal: 7,
  },
  itemCard: {
    position: 'relative',
    backgroundColor: '#FFFFFF', 
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonPressed: {
    backgroundColor: '#DDDDDD',
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  textContainer: {
    flex: 1,
  },

  wordAndSoundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  word: {
    color: '#333333',
    fontSize: 18,
    fontWeight: '700'
  },
  sticker: {
    width: 50,
    height: 50,
    borderRadius: 8,
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
    marginTop: 12,
    color: '#999999',
    fontSize: 12,
    fontWeight: '500'
  }
});