import React, { createContext, useState, useContext, useEffect } from 'react';

const AppPreferencesContext = createContext();

const LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  pl: { name: 'Polish', nativeName: 'Polski' },
  de: { name: 'German', nativeName: 'Deutsch' },
  fr: { name: 'French', nativeName: 'Français' },
  es: { name: 'Spanish', nativeName: 'Español' },
  it: { name: 'Italian', nativeName: 'Italiano' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
  nl: { name: 'Dutch', nativeName: 'Nederlands' },
};

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
];

export const AppPreferencesProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [savedLanguage, setSavedLanguage] = useState('en');
  const [savedCurrency, setSavedCurrency] = useState('USD');

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') || 'en';
    const savedCurr = localStorage.getItem('app_currency') || 'USD';
    setLanguage(savedLang);
    setCurrency(savedCurr);
    setSavedLanguage(savedLang);
    setSavedCurrency(savedCurr);
  }, []);

  // Commit preferences to localStorage (called explicitly by Settings page)
  const applyPreferences = () => {
    localStorage.setItem('app_language', language);
    localStorage.setItem('app_currency', currency);
    setSavedLanguage(language);
    setSavedCurrency(currency);
  };

  const hasUnsavedChanges = language !== savedLanguage || currency !== savedCurrency;

  const getCurrencySymbol = () => {
    const curr = CURRENCIES.find(c => c.code === currency);
    return curr?.symbol || '$';
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '';
    const symbol = getCurrencySymbol();
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <AppPreferencesContext.Provider value={{
      language,
      setLanguage,
      currency,
      setCurrency,
      languages: LANGUAGES,
      currencies: CURRENCIES,
      getCurrencySymbol,
      formatCurrency,
      applyPreferences,
      hasUnsavedChanges,
    }}>
      {children}
    </AppPreferencesContext.Provider>
  );
};

export const useAppPreferences = () => {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  }
  return context;
};