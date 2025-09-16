import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation } from '../translations';
import { updateUserLanguage } from '../utils/language';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    return localStorage.getItem('preferredLanguage') || 'en';
  });

  const [translations, setTranslations] = useState(() => {
    return getTranslation(language);
  });

  useEffect(() => {
    // Update translations when language changes
    setTranslations(getTranslation(language));
    // Save to localStorage
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const changeLanguage = async (newLanguage) => {
    console.log(`🌐 Language change requested: ${language} → ${newLanguage}`);
    if (['en', 'hi', 'pa'].includes(newLanguage)) {
      setLanguage(newLanguage);
      console.log(`✅ Language changed to: ${newLanguage}`);
      
      // Update server if user is logged in
      try {
        await updateUserLanguage(newLanguage);
        console.log(`🔄 Server language updated to: ${newLanguage}`);
      } catch (error) {
        console.error('Failed to update language on server:', error);
        // Continue with local language change even if server update fails
      }
    } else {
      console.error(`❌ Invalid language code: ${newLanguage}`);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let result = translations;
    
    console.log(`Translation request: key="${key}", language="${language}", translations available:`, Object.keys(translations || {}));
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return key;
      }
    }
    
    console.log(`Translation result for "${key}":`, result);
    return result;
  };

  const value = {
    language,
    changeLanguage,
    translations,
    t // Translation function
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};