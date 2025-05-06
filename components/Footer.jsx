import React from 'react';
import { useTheme } from '../src/contexts/ThemeContext';
import './Footer.css';

const Footer = () => {
  const { themeColors } = useTheme();
  
  const footerStyle = {
    backgroundColor: themeColors.surface,
    color: themeColors.text,
    borderTop: `1px solid ${themeColors.border}`
  };
  
  return (
    <footer className="footer" style={footerStyle}>
      <p>˗ˏˋ binged by asma, fatima & zain ´ˎ˗</p>
    </footer>
  );
};

export default Footer;