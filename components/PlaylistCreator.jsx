import React, { useState, useCallback, memo } from 'react';
import { useTheme } from '../src/contexts/ThemeContext';
import './PlaylistCreator.css';

const PlaylistCreator = memo(({ onCreatePlaylist }) => {
  const [playlistName, setPlaylistName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { themeColors } = useTheme();
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const trimmedName = playlistName.trim();
    if (!trimmedName || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Call the create playlist function passed from parent
      // Wait briefly before calling to prevent UI glitches
      setTimeout(() => {
        onCreatePlaylist(trimmedName);
        setPlaylistName('');
        setIsSubmitting(false);
      }, 50);
    } catch (error) {
      console.error('Error creating playlist:', error);
      setIsSubmitting(false);
    }
  }, [playlistName, isSubmitting, onCreatePlaylist]);
  
  const handleChange = useCallback((e) => {
    setPlaylistName(e.target.value);
  }, []);
  
  const creatorStyles = {
    container: {
      backgroundColor: `${themeColors.surface}CC`, // semi-transparent
      borderLeft: `4px solid ${themeColors.primary}`
    },
    title: {
      color: themeColors.text
    },
    input: {
      backgroundColor: themeColors.inputBackground || '#262626',
      color: themeColors.text,
      borderColor: isSubmitting ? themeColors.primary : themeColors.border
    },
    button: {
      backgroundColor: isSubmitting ? `${themeColors.primary}99` : themeColors.primary,
      color: themeColors.buttonText || '#ffffff'
    }
  };
  
  return (
    <div className="playlist-creator" style={creatorStyles.container}>
      <h3 className="creator-title" style={creatorStyles.title}>Create New Playlist</h3>
      
      <form onSubmit={handleSubmit} className="creator-form">
        <input
          type="text"
          className="playlist-name-input"
          placeholder="Enter playlist name..."
          value={playlistName}
          onChange={handleChange}
          maxLength={50}
          required
          disabled={isSubmitting}
          style={creatorStyles.input}
        />
        
        <button 
          type="submit" 
          className="create-button"
          disabled={!playlistName.trim() || isSubmitting}
          style={creatorStyles.button}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
});

export default PlaylistCreator;