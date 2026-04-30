import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arTranslation from './locales/ar.json';
import frTranslation from './locales/fr.json';
import enTranslation from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: arTranslation,
      fr: frTranslation,
      en: enTranslation,
    },
    fallbackLng: 'ar',
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

// Update document direction based on language
i18n.on('languageChanged', (lng) => {
  document.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction and language
const currentLng = i18n.language || 'ar';
document.dir = currentLng === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = currentLng;

export default i18n;
