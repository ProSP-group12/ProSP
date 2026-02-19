// App.js
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import * as ScreenOrientation from 'expo-screen-orientation';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import './i18n/config';
import { useTranslation } from 'react-i18next';

import { CameraScreen } from './components/CameraScreen';
import { VocabularyScreen } from './components/VocabularyScreen';
import { SettingsScreen } from './components/SettingsScreen';

// Corrected path to point into the components folder
import { THEME_COLORS } from './components/ui';

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
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    ).catch(() => {});

    return () => {
      ScreenOrientation.unlockAsync?.().catch?.(() => {});
    };
  }, []);

  const theme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: THEME_COLORS.background,
        card: THEME_COLORS.card,
        text: THEME_COLORS.text,
        border: THEME_COLORS.border,
        primary: THEME_COLORS.primary,
      },
    }),
    []
  );

  return (
    <View style={styles.root}>
      <NavigationContainer theme={theme}>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: THEME_COLORS.card },
            headerTintColor: THEME_COLORS.text,
            headerTitleAlign: 'center',
            tabBarStyle: {
              backgroundColor: THEME_COLORS.card,
              borderTopColor: THEME_COLORS.border,
              height: Platform.select({ ios: 84, android: 76, default: 68 }),
              justifyContent: 'center',
            },
            tabBarItemStyle: {
              justifyContent: 'center',
              paddingVertical: 6,
            },
            tabBarActiveTintColor: THEME_COLORS.primary,
            tabBarInactiveTintColor: THEME_COLORS.tabInactive,
          }}
        >
          <Tab.Screen
            name="Camera"
            options={{
              title: t('tabs.camera'),
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="camera" size={size} color={color} />
              ),
            }}
          >
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
            options={{
              title: t('tabs.vocabulary'),
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="book" size={size} color={color} />
              ),
            }}
          >
            {() => (
              <VocabularyScreen
                vocabulary={vocabulary}
                onClear={() => setVocabulary([])}
                onDelete={(id) => setVocabulary((prev) => prev.filter((v) => v.id !== id))}
                onToggleFavorite={(id) => setVocabulary((prev) => 
                  prev.map((v) => v.id === id ? { ...v, isFavorite: !v.isFavorite } : v)
                )}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="Settings"
            options={{
              title: t('tabs.settings'),
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" size={size} color={color} />
              ),
            }}
          >
            {() => <SettingsScreen />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
});