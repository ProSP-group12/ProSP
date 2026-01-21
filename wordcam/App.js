import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import * as ScreenOrientation from 'expo-screen-orientation';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import './i18n/config';
import { useTranslation } from 'react-i18next';

import { CameraScreen } from './components/CameraScreen';
import { VocabularyScreen } from './components/VocabularyScreen';
import { SettingsScreen } from './components/SettingsScreen';

const STORAGE_KEY = '@wordcam:vocabulary';
const Tab = createBottomTabNavigator();

async function loadVocabulary() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveVocabulary(items) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage failures in prototype
  }
}

export default function App() {
  const { t } = useTranslation();
  const [vocabulary, setVocabulary] = useState([]);

  useEffect(() => {
    loadVocabulary().then(setVocabulary);
  }, []);

  useEffect(() => {
    saveVocabulary(vocabulary);
  }, [vocabulary]);

  useEffect(() => {
    // Lock the app to portrait mode at runtime.
    // We keep this soft (won't crash if unsupported).
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    ).catch(() => {});

    return () => {
      // Best-effort unlock when leaving the app.
      ScreenOrientation.unlockAsync?.().catch?.(() => {});
    };
  }, []);

  const theme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: '#0B0F17',
        card: '#0F1629',
        text: '#E8EEF8',
        border: '#1E2A44',
        primary: '#6EA8FF',
      },
    }),
    []
  );

  return (
    <View style={styles.root}>
      <NavigationContainer theme={theme}>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.card },
            headerTintColor: theme.colors.text,
            tabBarStyle: {
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
              height: Platform.select({ ios: 84, android: 68, default: 68 }),
              paddingBottom: Platform.select({ ios: 24, default: 10 }),
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: '#9FB2D1',
          }}
        >
          <Tab.Screen name="Camera" options={{ title: t('tabs.camera') }}>
            {() => (
              <CameraScreen
                onAddVocabulary={(newItems) =>
                  setVocabulary((prev) => [...newItems, ...prev])
                }
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Vocabulary"
            options={{ title: t('tabs.vocabulary') }}
          >
            {() => (
              <VocabularyScreen
                vocabulary={vocabulary}
                onClear={() => setVocabulary([])}
              />
            )}
          </Tab.Screen>
          <Tab.Screen name="Settings" options={{ title: t('tabs.settings') }}>
            {() => <SettingsScreen />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
});
