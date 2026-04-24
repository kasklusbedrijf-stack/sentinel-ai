// Centralized translation keys and strings for the entire app
import { en } from './translations/en';
import { de } from './translations/de';
import { fr, es, it, pt, pl, nl } from './translations/other';

export const translations = { en, de, fr, es, it, pt, pl, nl };

// Helper function to get translation safely
export const t = (language, key, defaultValue = key) => {
  return translations[language]?.[key] || translations.en[key] || defaultValue;
};