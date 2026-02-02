import { useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Card, Title } from './ui';
import { Image } from 'react-native';

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return '';
  }
}

export function VocabularyScreen({ vocabulary, onClear, onDelete }) {
  const { i18n, t } = useTranslation();

  const showChinese = i18n.language === 'zh';

  const data = useMemo(() => vocabulary ?? [], [vocabulary]);

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
                  <Text style={styles.word}>{item.word}</Text>
                </View>
                {showChinese && !!item.zh ? (
                  <Text style={styles.zh}>{item.zh}</Text>
                ) : null}
                <Button
                  title={t('vocabulary.delete') || 'Delete'}
                  variant="secondary"
                  onPress={() => onDelete?.(item.id)}
                />
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
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  word: {
    color: '#000000',
    fontSize: 20,
    fontWeight: '800'
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
  zh: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '700'
  },
  meta: {
    marginTop: 6,
    color: '#666666',
    fontSize: 12,
    fontWeight: '600'
  }
});

