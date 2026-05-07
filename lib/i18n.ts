import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en.json';
import hi from './locales/hi.json';

const LANGUAGE_KEY = 'agrow_language';

export const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY) || 'en';

  await i18n
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en }, hi: { translation: hi } },
      lng: savedLanguage,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });

  return i18n;
};

export const changeLanguage = async (lang: 'en' | 'hi') => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export default i18n;