import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import zh from './locales/zh.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

function pickInitialLanguage() {
  const locales = Localization.getLocales?.() ?? [];
  const first = locales[0]?.languageCode;
  if (first === 'zh') return 'zh';
  return 'en';
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: pickInitialLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export default i18n;
