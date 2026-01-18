import { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext();

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('railtrader-font-size');
    return saved || 'medium';
  });

  useEffect(() => {
    localStorage.setItem('railtrader-font-size', fontSize);
    
    // Apply font size class to document root
    document.documentElement.className = document.documentElement.className
      .replace(/font-size-\w+/g, '')
      .trim();
    document.documentElement.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  const value = {
    fontSize,
    setFontSize,
    isSmall: fontSize === 'small',
    isMedium: fontSize === 'medium'
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
};