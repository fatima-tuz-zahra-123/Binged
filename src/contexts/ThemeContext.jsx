import React, { createContext, useState, useContext, useEffect } from 'react';

// Define our theme colors - Blue-inspired theme
const themes = {
  light: {
    primary: '#3498db',      // Primary blue
    secondary: '#2980b9',    // Darker blue for hover states
    background: '#f5f5f5',   // Light gray background
    surface: '#ffffff',      // White surface
    text: '#141414',         // Near black text
    textSecondary: '#666666',// Medium gray for secondary text
    border: '#dbdbdb',       // Light gray border
    shadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    shadowHover: '0 4px 18px rgba(0, 0, 0, 0.2)',
    spacing: {
      xs: '0.35rem',
      sm: '0.75rem',
      md: '1.25rem',
      lg: '2rem',
      xl: '3rem'
    },
    radius: '4px',
    transition: '0.3s ease'
  },
  dark: {
    primary: '#3498db',      // Primary blue
    secondary: '#2980b9',    // Darker blue for hover states
    background: '#0f0f0f',   // Very dark gray/near black
    surface: '#141414',      // Dark gray
    text: '#e5e5e5',         // Light gray text
    textSecondary: '#b3b3b3',// Secondary text gray
    border: '#333333',       // Dark gray border
    shadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    shadowHover: '0 4px 18px rgba(0, 0, 0, 0.8)',
    spacing: {
      xs: '0.35rem',
      sm: '0.75rem',
      md: '1.25rem',
      lg: '2rem',
      xl: '3rem'
    },
    radius: '4px',
    transition: '0.3s ease'
  }
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has previously selected a theme
  const storedTheme = localStorage.getItem('theme') || 'dark';
  const [theme, setTheme] = useState(storedTheme);
  const [themeColors, setThemeColors] = useState(themes[storedTheme]);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    setThemeColors(themes[newTheme]);
  };

  useEffect(() => {
    // Apply theme colors to CSS variables
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply main color values
    Object.entries(themeColors).forEach(([key, value]) => {
      if (typeof value === 'object') {
        // For nested objects like spacing
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          document.documentElement.style.setProperty(`--${key}-${nestedKey}`, nestedValue);
        });
      } else {
        document.documentElement.style.setProperty(`--${key}`, value);
      }
    });
    
    // Set shorthand variables for spacing
    const spacing = themeColors.spacing;
    document.documentElement.style.setProperty('--spacing-xs', spacing.xs);
    document.documentElement.style.setProperty('--spacing-sm', spacing.sm);
    document.documentElement.style.setProperty('--spacing-md', spacing.md);
    document.documentElement.style.setProperty('--spacing-lg', spacing.lg);
    document.documentElement.style.setProperty('--spacing-xl', spacing.xl);
    document.documentElement.style.setProperty('--radius', themeColors.radius);
    document.documentElement.style.setProperty('--transition', themeColors.transition);
    document.documentElement.style.setProperty('--shadow', themeColors.shadow);
    document.documentElement.style.setProperty('--shadow-hover', themeColors.shadowHover);
    
    // Apply font styling
    document.body.style.fontFamily = "'Roboto', 'Segoe UI', sans-serif";
    document.body.style.fontSize = '16px';
    document.body.style.fontWeight = '400';
    document.body.style.lineHeight = '1.5';
    document.body.style.color = themeColors.text;
    document.body.style.backgroundColor = themeColors.background;
    
    // Apply smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
  }, [theme, themeColors]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using theme
export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;