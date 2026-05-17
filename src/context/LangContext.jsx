import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from './translations';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  // 1. Check if we have a saved language, otherwise default to English
  const savedLang = localStorage.getItem('appLanguage') || 'English';
  
  const [language, setLanguage] = useState(savedLang);

  // 2. Whenever language changes, save it to LocalStorage
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  // Helper function to get text
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LangContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);