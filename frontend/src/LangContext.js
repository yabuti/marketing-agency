import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './i18n';
import { useSiteSettings } from './SiteSettingsContext';

export const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const { content } = useSiteSettings();

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const switchLang = (code) => setLang(code);

  const overrides = (content && content[lang]) || {};
  // English is merged in first so a key that hasn't been translated yet renders
  // readable English instead of `undefined` — several locales are still
  // missing chunks, and a missing function key would throw when called.
  const t = {
    ...translations['en'],
    ...(translations[lang] || {}),
    ...Object.fromEntries(Object.entries(overrides).filter(([, v]) => v !== '' && v != null)),
  };

  return (
    <LangContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);

// BCP-47 locale per supported language, so dates and name sorting render in the
// active language instead of always falling back to an English locale.
const LOCALES = { en: 'en-GB', am: 'am-ET', or: 'om-ET' };

export const localeFor = (lang) => LOCALES[lang] || LOCALES.en;