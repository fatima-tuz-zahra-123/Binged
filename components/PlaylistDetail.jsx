import React, { useState, useCallback, useEffect, memo } from 'react';
import { useTheme } from '../src/contexts/ThemeContext';
import MovieSearchPanel from './MovieSearchPanel';
import PlaylistMovieItem from './PlaylistMovieItem';
import './PlaylistDetail.css';

// Use memo to prevent unnecessary re-renders
const PlaylistDetail = memo(({ playlist, onUpdatePlaylist }) => {
  const { themeColors } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  
  // Update editedName when playlist changes
  useEffect(() => {
    if (playlist?.name) {
      setEditedName(playlist.name);
    }
  }, [playlist?.name]);
  
  // Memoize handlers to prevent recreation on every render
  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prevState => !prevState);
  }, []);
  
  const handleAddMovie = useCallback((movie) => {
    // Check if movie is already in the playlist
    if (!playlist || !movie) return;
    
    if (playlist.movies.some(m => m.id === movie.id)) {
      alert('This movie is already in your playlist');
      return;
    }
    
    // Add movie to playlist
    const updatedPlaylist = {
      ...playlist,
      movies: [...playlist.movies, movie]
    };
    
    onUpdatePlaylist(updatedPlaylist);
  }, [playlist, onUpdatePlaylist]);
  
  const handleRemoveMovie = useCallback((movieId) => {
    if (!playlist) return;
    
    if (window.confirm('Remove this movie from your playlist?')) {
      const updatedPlaylist = {
        ...playlist,
        movies: playlist.movies.filter(movie => movie.id !== movieId)
      };
      
      onUpdatePlaylist(updatedPlaylist);
    }
  }, [playlist, onUpdatePlaylist]);
  
  const startEditingName = useCallback(() => {
    if (!playlist) return;
    setEditedName(playlist.name);
    setIsEditingName(true);
  }, [playlist]);
  
  const savePlaylistName = useCallback(() => {
    if (!playlist) return;
    
    if (editedName.trim()) {
      onUpdatePlaylist({
        ...playlist,
        name: editedName.trim()
      });
      setIsEditingName(false);
    }
  }, [editedName, playlist, onUpdatePlaylist]);
  
  const handleNameKeyDown = useCallback((e) => {
    if (!playlist) return;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      savePlaylistName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditedName(playlist.name);
    }
  }, [playlist, savePlaylistName]);
  
  // Apply themed styles to components
  const detailStyles = {
    container: {
      backgroundColor: `${themeColors.surface}CC`,
      borderTop: `3px solid ${themeColors.primary}`
    },
    title: {
      color: themeColors.text
    },
    editBtn: {
      color: themeColors.primary
    },
    addBtn: {
      backgroundColor: themeColors.primary
    },
    movieCount: {
      backgroundColor: `${themeColors.primary}20`,
      color: themeColors.textSecondary
    },
    emptyMessage: {
      color: themeColors.textSecondary
    }
  };
  
  // Return null if playlist is undefined to prevent rendering errors
  if (!playlist) return null;
  
  return (
    <div className="playlist-detail" style={detailStyles.container}>
      <div className="detail-header">
        {isEditingName ? (
          <div className="name-edit-container">
            <input
              type="text"
              className="name-edit-input"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={savePlaylistName}
              onKeyDown={handleNameKeyDown}
              autoFocus
              maxLength={50}
            />
            <small className="edit-hint">Press Enter to save, Esc to cancel</small>
          </div>
        ) : (
          <h2 className="playlist-title" onClick={startEditingName} title="Click to rename" style={detailStyles.title}>
            {playlist.name}
            <span className="edit-icon" style={detailStyles.editBtn}>✎</span>
          </h2>
        )}
        <div className="playlist-meta">
          <span className="detail-movie-count" style={detailStyles.movieCount}>
            {playlist.movies?.length || 0} movies
          </span>
          <button 
            className="add-movie-btn"
            onClick={toggleSearch}
            style={detailStyles.addBtn}
          >
            {isSearchOpen ? 'Cancel' : 'Add Movies'}
          </button>
        </div>
      </div>
      
      {isSearchOpen && (
        <MovieSearchPanel onAddMovie={handleAddMovie} />
      )}
      
      <div className="playlist-movies">
        {playlist.movies?.length > 0 ? (
          <div className="movies-grid">
            {playlist.movies.map(movie => (
              <PlaylistMovieItem 
                key={movie.id} 
                movie={movie} 
                onRemove={() => handleRemoveMovie(movie.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="empty-playlist">
            <p style={detailStyles.emptyMessage}>This playlist is empty</p>
            <button 
              className="add-movie-btn empty-add-btn"
              onClick={toggleSearch}
              style={detailStyles.addBtn}
            >
              Add Your First Movie
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default PlaylistDetail;