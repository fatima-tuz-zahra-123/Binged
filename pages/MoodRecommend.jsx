import React from 'react';
import { useTheme } from '../src/contexts/ThemeContext';

const MoodRecommend = () => {
  const { themeColors } = useTheme();
  
  const containerStyle = {
    padding: '2rem',
    backgroundColor: themeColors.surface,
    color: themeColors.text,
    borderRadius: '8px',
    boxShadow: themeColors.shadow,
  };
  
  const titleStyle = {
    color: themeColors.primary,
    marginBottom: '1rem',
  };
  
  const descriptionStyle = {
    color: themeColors.textSecondary,
  };

  return (
    <div className="page" style={containerStyle}>
      <h2 style={titleStyle}>AI Mood Recommendations</h2>
      <p style={descriptionStyle}>Tell us how you're feeling and get movie suggestions.</p>
    </div>
  );
};

export default MoodRecommend;