// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Languages
import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';
import te from './te.json';
import bn from './bn.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  te: { translation: te },
  bn: { translation: bn }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Function to change language
export const changeLanguage = async (lang) => {
  await AsyncStorage.setItem('app_language', lang);
  await i18n.changeLanguage(lang);
};

// Load saved language
AsyncStorage.getItem('app_language').then(lang => {
  if (lang && resources[lang]) {
    i18n.changeLanguage(lang);
  }
});

export default i18n;