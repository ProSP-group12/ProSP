import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

const resources = {
  en: { translation: en },
};

function pickInitialLanguage() {
  const locales = Localization.getLocales?.() ?? [];
  const first = locales[0]?.languageCode;
  // Removed Chinese language support
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
