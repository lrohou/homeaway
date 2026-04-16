import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from './i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('homeaway-lang') || 'fr';
  });

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    localStorage.setItem('homeaway-lang', newLang);
  }, []);

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations['fr']?.[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
