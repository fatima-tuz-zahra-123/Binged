import React, { createContext, useState, useContext, useEffect } from 'react';

// Define our theme colors - Blue-inspired theme with enhanced readability
const themes = {
  light: {
    primary: '#2962ff',      // Vibrant blue for primary elements
    secondary: '#1e88e5',    // Slightly darker blue for hover states
    accent: '#82b1ff',       // Light blue accent color
    background: '#f8f9fa',   // Light gray background with blue tint
    surface: '#ffffff',      // White surface
    surfaceAlt: '#f0f4f8',   // Alternate surface with blue tint
    text: '#212121',         // Dark gray text for readability
    textSecondary: '#505050', // Medium gray for secondary text
    textInverse: '#ffffff',  // White text for dark backgrounds
    buttonText: '#ffffff',   // White text for buttons
    border: '#e0e6ed',       // Light gray border with blue tint
    error: '#e53935',        // Red for error states
    success: '#43a047',      // Green for success states
    shadow: '0 2px 10px rgba(41, 98, 255, 0.1)',
    shadowHover: '0 4px 18px rgba(41, 98, 255, 0.2)',
    gradient: 'linear-gradient(135deg, #2962ff, #1e88e5)',
    spacing: {
      xs: '0.35rem',
      sm: '0.75rem',
      md: '1.25rem',
      lg: '2rem',
      xl: '3rem'
    },
    font: {
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
        xxl: '2rem'
      }
    },
    radius: '8px',  // More rounded corners
    transition: '0.3s ease',
    theme: 'light'  // Theme identifier
  },
  dark: {
    primary: '#2962ff',      // Same vibrant blue as light theme
    secondary: '#1e88e5',    // Same secondary blue
    accent: '#82b1ff',       // Light blue accent color
    background: '#0a0a19',   // Very dark blue-black
    surface: '#121225',      // Dark blue-gray 
    surfaceAlt: '#1a1a30',   // Slightly lighter surface with blue tint
    text: '#e5e5e5',         // Light gray text for readability
    textSecondary: '#b0b0b0', // Slightly darker gray for secondary text
    textInverse: '#212121',  // Dark text for light backgrounds
    buttonText: '#ffffff',   // White text for buttons
    border: '#2d2d40',       // Darker border with blue tint
    error: '#f44336',        // Brighter red for dark theme
    success: '#4caf50',      // Brighter green for dark theme
    shadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    shadowHover: '0 4px 18px rgba(41, 98, 255, 0.4)',
    gradient: 'linear-gradient(135deg, #2962ff, #1e88e5)',
    spacing: {
      xs: '0.35rem',
      sm: '0.75rem',
      md: '1.25rem',
      lg: '2rem',
      xl: '3rem'
    },
    font: {
      size: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.25rem',
        xl: '1.5rem',
        xxl: '2rem'
      }
    },
    radius: '8px',  // More rounded corners
    transition: '0.3s ease',
    theme: 'dark'  // Theme identifier
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
        // For nested objects like spacing and font sizes
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
    
    // Set font sizes
    const fontSizes = themeColors.font.size;
    document.documentElement.style.setProperty('--font-size-xs', fontSizes.xs);
    document.documentElement.style.setProperty('--font-size-sm', fontSizes.sm);
    document.documentElement.style.setProperty('--font-size-md', fontSizes.md);
    document.documentElement.style.setProperty('--font-size-lg', fontSizes.lg);
    document.documentElement.style.setProperty('--font-size-xl', fontSizes.xl);
    document.documentElement.style.setProperty('--font-size-xxl', fontSizes.xxl);
    
    document.documentElement.style.setProperty('--radius', themeColors.radius);
    document.documentElement.style.setProperty('--transition', themeColors.transition);
    document.documentElement.style.setProperty('--shadow', themeColors.shadow);
    document.documentElement.style.setProperty('--shadow-hover', themeColors.shadowHover);
    document.documentElement.style.setProperty('--gradient', themeColors.gradient);
    
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