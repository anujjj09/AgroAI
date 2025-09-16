import { en } from './en';
import { hi } from './hi'; 
import { pa } from './pa';

export const translations = {
  en,
  hi,
  pa
};

export const getTranslation = (language = 'en') => {
  return translations[language] || translations.en;
};

export const translate = (key, language = 'en') => {
  const trans = getTranslation(language);
  const keys = key.split('.');
  
  let result = trans;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      console.warn(`Translation key not found: ${key} for language: ${language}`);
      return key; // Return the key itself if translation not found
    }
  }
  
  return result;
};