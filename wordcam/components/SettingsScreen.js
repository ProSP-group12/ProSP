//SettingsScreen.js
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

// Removed Title from the import list
import { Button, Card } from './ui';

export function SettingsScreen() {
  const { i18n, t } = useTranslation();

  // Support for language translations
  const current = useMemo(() => {
    const code = i18n.language;
    if (code === 'zh') return t('settings.chinese') || 'Chinese';
    if (code === 'fi') return t('settings.finnish') || 'Finnish';
    return t('settings.english') || 'English';
  }, [i18n.language, t]);

  async function setLanguage(next) {
    try {
      await i18n.changeLanguage(next);
    } catch {
      // Ignore for prototype
    }
  }

  return (
    <View style={styles.container}>
      <Card style={styles.cardLayout}>
        
        <Text style={styles.label}>{t('settings.language') || 'CURRENT LANGUAGE'}</Text>
        <Text style={styles.value}>{current}</Text>

        <View style={{ height: 24 }} />

        <View style={styles.buttonGroup}>
          <Button
            title={t('settings.english') || 'English'}
            onPress={() => setLanguage('en')}
            variant={i18n.language === 'en' ? 'primary' : 'secondary'}
          />
          <Button
            title={t('settings.chinese') || '中文'}
            onPress={() => setLanguage('zh')}
            variant={i18n.language === 'zh' ? 'primary' : 'secondary'}
          />
          <Button
            title={t('settings.finnish') || 'Suomi'}
            onPress={() => setLanguage('fi')}
            variant={i18n.language === 'fi' ? 'primary' : 'secondary'}
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  cardLayout: {
    paddingVertical: 24,
    paddingHorizontal: 20
  },
  label: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  value: {
    color: '#333333',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: 14
  }
});