import React, { useMemo, memo } from 'react';
import { useTheme } from '../src/contexts/ThemeContext';
import PlaylistItem from './PlaylistItem';
import './PlaylistsList.css';

const PlaylistsList = memo(({ 
  playlists, 
  selectedPlaylistId, 
  onSelectPlaylist, 
  onDeletePlaylist 
}) => {
  const { themeColors } = useTheme();
  
  // Sort playlists by creation date (newest first) - memoized to prevent resort on every render
  const sortedPlaylists = useMemo(() => {
    return [...playlists].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [playlists]);
  
  // Create theme-aware styles
  const listStyles = useMemo(() => ({
    container: {
      backgroundColor: `${themeColors.surface}CC`,
      boxShadow: `0 6px 12px ${themeColors.shadow || 'rgba(0, 0, 0, 0.2)'}`
    },
    title: {
      color: themeColors.text
    },
    titleAfter: {
      backgroundColor: themeColors.primary
    },
    emptyState: {
      backgroundColor: `${themeColors.surface}99`,
      color: themeColors.textSecondary,
      border: `1px solid ${themeColors.border || 'rgba(52, 152, 219, 0.1)'}`
    }
  }), [themeColors]);
  
  return (
    <div className="playlists-list" style={listStyles.container}>
      <h3 className="list-title" style={listStyles.title}>
        Your Playlists
        <span className="title-underline" style={listStyles.titleAfter}></span>
      </h3>
      
      {playlists.length === 0 ? (
        <div className="empty-playlists" style={listStyles.emptyState}>
          <p>No playlists found</p>
          <p className="empty-help">Create your first playlist to get started</p>
        </div>
      ) : (
        <ul className="playlist-items">
          {sortedPlaylists.map(playlist => (
            <PlaylistItem
              key={playlist.id}
              playlist={playlist}
              isSelected={playlist.id === selectedPlaylistId}
              onSelect={onSelectPlaylist}
              onDelete={onDeletePlaylist}
            />
          ))}
        </ul>
      )}
    </div>
  );
});

export default PlaylistsList;