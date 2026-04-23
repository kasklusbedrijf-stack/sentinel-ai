import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from './translations';

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

// Conversion rates (USD base)
// TODO: Replace with live FX API call (e.g., API endpoint or external service)
// Currently using static rates for production safety — update rates monthly or integrate real-time API
const CONVERSION_RATES = {
  USD: 1.0,           // Base currency
  EUR: 0.92,          // 1 USD = 0.92 EUR (approximate)
  GBP: 0.79,          // 1 USD = 0.79 GBP (approximate)
  PLN: 4.00,          // 1 USD = 4.00 PLN (approximate)
};

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

  const convertAmount = (amountInUSD) => {
    if (amountInUSD === undefined || amountInUSD === null) return 0;
    const rate = CONVERSION_RATES[currency] || 1.0;
    return amountInUSD * rate;
  };

  const formatCurrency = (amountInUSD) => {
    if (amountInUSD === undefined || amountInUSD === null) return '';
    const symbol = getCurrencySymbol();
    const convertedAmount = convertAmount(amountInUSD);
    return `${symbol}${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const t = (key, defaultValue = key) => {
    return translations[language]?.[key] || translations.en[key] || defaultValue;
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
      convertAmount,
      formatCurrency,
      applyPreferences,
      hasUnsavedChanges,
      t,
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