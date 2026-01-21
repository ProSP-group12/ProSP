import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Card, SubTitle, Title } from './ui';

export function SettingsScreen() {
  const { i18n, t } = useTranslation();

  const isZh = i18n.language === 'zh';

  const current = useMemo(
    () => (isZh ? t('settings.chinese') : t('settings.english')),
    [isZh, t]
  );

  async function setLanguage(next) {
    try {
      await i18n.changeLanguage(next);
    } catch {
      // ignore for prototype
    }
  }

  return (
    <View style={styles.container}>
      <Card>
        <Title>{t('settings.title')}</Title>
        <SubTitle>{t('settings.note')}</SubTitle>

        <View style={{ height: 18 }} />

        <Text style={styles.label}>{t('settings.language')}</Text>
        <Text style={styles.value}>{current}</Text>

        <View style={{ height: 12 }} />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Button
              title={t('settings.english')}
              onPress={() => setLanguage('en')}
              disabled={!isZh}
              variant="secondary"
            />
          </View>
          <View style={{ width: 10 }} />
          <View style={{ flex: 1 }}>
            <Button
              title={t('settings.chinese')}
              onPress={() => setLanguage('zh')}
              disabled={isZh}
              variant="secondary"
            />
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
    padding: 16
  },
  label: {
    color: '#9FB2D1',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  value: {
    color: '#E8EEF8',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});

