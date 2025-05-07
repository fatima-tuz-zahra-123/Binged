import React, { useCallback, memo, useMemo } from 'react';
import { useTheme } from '../src/contexts/ThemeContext';
import './PlaylistItem.css';

const PlaylistItem = memo(({ playlist, isSelected, onSelect, onDelete }) => {
  const { themeColors } = useTheme();
  
  const handleSelect = useCallback(() => {
    onSelect(playlist.id);
  }, [playlist.id, onSelect]);
  
  const handleDelete = useCallback((e) => {
    e.stopPropagation(); // Prevent triggering the playlist selection
    
    // Double confirm playlist deletion
    if (window.confirm(`Are you sure you want to delete playlist "${playlist.name}"? This action cannot be undone.`)) {
      try {
        onDelete(playlist.id);
      } catch (error) {
        console.error("Error deleting playlist:", error);
        alert("Failed to delete playlist. Please try again.");
      }
    }
  }, [playlist.id, playlist.name, onDelete]);
  
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }, []);
  
  // Create theme-aware styles
  const itemStyles = useMemo(() => ({
    container: {
      backgroundColor: isSelected 
        ? `${themeColors.primary}15` 
        : `${themeColors.surface}CC`,
      borderLeftColor: isSelected ? themeColors.primary : 'transparent'
    },
    name: {
      color: themeColors.text
    },
    meta: {
      color: themeColors.textSecondary
    },
    count: {
      color: themeColors.primary
    },
    deleteButton: {
      color: themeColors.textSecondary,
      '&:hover': {
        color: themeColors.error || '#e74c3c'
      }
    }
  }), [isSelected, themeColors]);
  
  return (
    <li 
      className={`playlist-item ${isSelected ? 'selected' : ''}`}
      onClick={handleSelect}
      data-playlist-id={playlist.id}
      style={itemStyles.container}
    >
      <div className="playlist-info">
        <h4 className="playlist-name" style={itemStyles.name}>
          {playlist.name}
        </h4>
        <div className="playlist-meta" style={itemStyles.meta}>
          <span className="movie-count" style={itemStyles.count}>
            {playlist.movies?.length || 0} movies
          </span>
          <span className="playlist-date">
            {formatDate(playlist.createdAt)}
          </span>
        </div>
      </div>
      <button 
        className="delete-button" 
        onClick={handleDelete}
        title="Delete playlist"
        aria-label={`Delete playlist ${playlist.name}`}
        style={itemStyles.deleteButton}
      >
        <span className="delete-icon">×</span>
      </button>
    </li>
  );
});

export default PlaylistItem;