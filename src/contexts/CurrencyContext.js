import { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('$');

  useEffect(() => {
    fetchCurrency();
  }, []);

  const fetchCurrency = async () => {
    try {
      const response = await fetch(`${apiUrl()}/api/platform-settings`);
      const data = await response.json();
      setCurrency(data.currency || '$');
    } catch (error) {
      console.error('Error fetching currency:', error);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fetchCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};