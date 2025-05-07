import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../src/contexts/ThemeContext';

const AuthPrompt = () => {
  const { themeColors } = useTheme();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    margin: '2rem auto',
    maxWidth: '600px',
    backgroundColor: themeColors.surface,
    borderRadius: '8px',
    boxShadow: `0 4px 12px ${themeColors.shadow}`,
    color: themeColors.text
  };

  const headingStyle = {
    color: themeColors.primary,
    marginBottom: '1rem'
  };

  const buttonStyle = {
    backgroundColor: themeColors.primary,
    color: themeColors.buttonText,
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    border: 'none',
    margin: '0.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Authentication Required</h2>
      <p style={{ marginBottom: '2rem', textAlign: 'center' }}>
        You need to be logged in to create and manage your movie playlists.
      </p>
      <div>
        <Link to="/login" style={buttonStyle}>Login</Link>
        <Link to="/signup" style={{ ...buttonStyle, backgroundColor: themeColors.secondary }}>Sign Up</Link>
      </div>
    </div>
  );
};

export default AuthPrompt;