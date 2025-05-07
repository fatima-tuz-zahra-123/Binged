import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../src/contexts/UserContext';
import { useTheme } from '../src/contexts/ThemeContext';
import PlaylistCreator from '../components/PlaylistCreator';
import PlaylistsList from '../components/PlaylistsList';
import PlaylistDetail from '../components/PlaylistDetail';
import AuthPrompt from '../components/AuthPrompt';
import './Playlists.css';

// Use React.memo to prevent unnecessary re-renders of the entire component
const Playlists = React.memo(() => {
  const { currentUser, updateProfile } = useUser();
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  
  // State for playlists management
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stabilize component render cycles with a render counter
  const renderCount = React.useRef(0);
  
  // Calculate themed styles using themeColors
  const themedStyles = useMemo(() => ({
    emptyState: {
      backgroundColor: `${themeColors.surface}CC`,
      borderLeft: `4px solid ${themeColors.primary}`
    },
    errorMessage: {
      backgroundColor: `${themeColors.error}33`,
      borderLeft: `4px solid ${themeColors.error}`
    },
    loadingSpinner: {
      borderColor: `${themeColors.primary}33`,
      borderLeftColor: themeColors.primary
    },
    emptyPlaylistSelection: {
      backgroundColor: `${themeColors.surface}99`,
      border: `1px solid ${themeColors.primary}33`
    }
  }), [themeColors]);
  
  // Load playlists on component mount only once
  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlaylists();
    }, 100); // Short delay to let the component fully mount first
    
    return () => clearTimeout(timer);
  }, []); // Empty deps array ensures it only runs once
  
  // Memoize the savePlaylist function to prevent unnecessary rerenders
  const savePlaylistsToStorage = useCallback((playlistsToSave) => {
    // Debounce the save operation to prevent rapid successive updates
    const handler = setTimeout(() => {
      try {
        // Always save playlists, even if empty array
        localStorage.setItem('playlists', JSON.stringify(playlistsToSave));
        
        // If user is logged in, update their profile with the playlists
        if (currentUser) {
          updateProfile({ ...currentUser, playlists: playlistsToSave });
        }
      } catch (err) {
        console.error("Error saving playlists:", err);
        setError("Failed to save your playlists. Please try again.");
      }
    }, 300); // Debounce delay
    
    return () => clearTimeout(handler);
  }, [currentUser, updateProfile]);
  
  // Save playlists when they change
  useEffect(() => {
    // Don't save during initial loading or when no real change has happened
    if (!isLoading && renderCount.current > 1) {
      const cleanup = savePlaylistsToStorage(playlists);
      return () => cleanup();
    }
    renderCount.current += 1;
  }, [playlists, isLoading, savePlaylistsToStorage]);
  
  // Load playlists from user profile if logged in, otherwise from localStorage
  const loadPlaylists = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    setTimeout(() => {
      try {
        let loadedPlaylists = [];
        
        if (currentUser && currentUser.playlists) {
          loadedPlaylists = currentUser.playlists;
        } else {
          const savedPlaylists = localStorage.getItem('playlists');
          if (savedPlaylists) {
            loadedPlaylists = JSON.parse(savedPlaylists);
          }
        }
        
        setPlaylists(loadedPlaylists);
      } catch (err) {
        console.error("Error loading playlists:", err);
        setError("Failed to load your playlists. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }, 100); // Short delay to ensure smooth rendering
  }, [currentUser]);
  
  // Create a new playlist with error handling
  const handleCreatePlaylist = useCallback((playlistName) => {
    try {
      // Validate input
      if (!playlistName || playlistName.trim() === '') {
        setError("Playlist name cannot be empty.");
        return;
      }
      
      const newPlaylist = {
        id: `playlist_${Date.now()}`,
        name: playlistName.trim(),
        createdAt: new Date().toISOString(),
        movies: []
      };
      
      setPlaylists(currentPlaylists => {
        const updatedPlaylists = [...currentPlaylists, newPlaylist];
        return updatedPlaylists;
      });
      
      // Auto-select the newly created playlist after a short delay
      setTimeout(() => {
        setSelectedPlaylistId(newPlaylist.id);
      }, 100);
      
    } catch (err) {
      console.error("Error creating playlist:", err);
      setError("Failed to create playlist. Please try again.");
    }
  }, []);
  
  // Delete a playlist with optimized handler
  const handleDeletePlaylist = useCallback((playlistId) => {
    try {
      setPlaylists(currentPlaylists => {
        // Find the playlist to delete within the callback to avoid stale state
        const playlistToDelete = currentPlaylists.find(p => p.id === playlistId);
        if (!playlistToDelete) {
          console.error("Attempted to delete non-existent playlist");
          return currentPlaylists;
        }
        
        // Update selectedPlaylistId if needed
        if (selectedPlaylistId === playlistId) {
          // Need to use setTimeout to break the state update cycle
          setTimeout(() => {
            setSelectedPlaylistId(null);
          }, 0);
        }
        
        // Return filtered playlists
        return currentPlaylists.filter(playlist => playlist.id !== playlistId);
      });
    } catch (err) {
      console.error("Error deleting playlist:", err);
      setError("Failed to delete playlist. Please try again.");
    }
  }, [selectedPlaylistId]); // Only depend on selectedPlaylistId
  
  // Update a playlist with functional state updates
  const handleUpdatePlaylist = useCallback((updatedPlaylist) => {
    try {
      setPlaylists(currentPlaylists => 
        currentPlaylists.map(playlist => 
          playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist
        )
      );
    } catch (err) {
      console.error("Error updating playlist:", err);
      setError("Failed to update playlist. Please try again.");
    }
  }, []);
  
  // Select a playlist to view/edit
  const handleSelectPlaylist = useCallback((playlistId) => {
    setSelectedPlaylistId(playlistId);
  }, []);
  
  // Get the selected playlist - memoized to prevent unnecessary calculations
  const selectedPlaylist = useMemo(() => {
    return playlists.find(playlist => playlist.id === selectedPlaylistId);
  }, [playlists, selectedPlaylistId]);

  // Clear any error messages
  const dismissError = () => {
    setError(null);
  };
  
  // If user is not logged in, show auth prompt with proper navigation
  if (!currentUser) {
    return <AuthPrompt onLogin={() => navigate('/login')} />;
  }
  
  return (
    <div className="page playlists-page" style={{ backgroundColor: themeColors.background }}>
      <h1 className="section-heading" style={{ color: themeColors.text }}>
        Your Movie Playlists
      </h1>
      
      {/* Error message display with themed styles */}
      {error && (
        <div className="error-message" onClick={dismissError} style={themedStyles.errorMessage}>
          {error} <span className="dismiss-error">(Click to dismiss)</span>
        </div>
      )}
      
      {/* Loading state with themed spinner */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner" style={themedStyles.loadingSpinner}></div>
          <p style={{ color: themeColors.text }}>Loading your playlists...</p>
        </div>
      ) : (
        <>
          {/* Create new playlist section */}
          <PlaylistCreator onCreatePlaylist={handleCreatePlaylist} />
          
          {/* Empty state when no playlists exist */}
          {playlists.length === 0 ? (
            <div className="empty-state" style={themedStyles.emptyState}>
              <h3 style={{ color: themeColors.text }}>You don't have any playlists yet</h3>
              <p style={{ color: themeColors.textSecondary }}>Create your first playlist above to get started!</p>
            </div>
          ) : (
            /* Main content area with playlist list and details */
            <div className="playlists-container">
              {/* Sidebar with playlists list */}
              <div className="playlists-sidebar">
                <PlaylistsList 
                  playlists={playlists} 
                  selectedPlaylistId={selectedPlaylistId}
                  onSelectPlaylist={handleSelectPlaylist}
                  onDeletePlaylist={handleDeletePlaylist}
                />
              </div>
              
              {/* Main content area - selected playlist details */}
              <div className="playlist-detail-container">
                {selectedPlaylist ? (
                  <PlaylistDetail
                    playlist={selectedPlaylist}
                    onUpdatePlaylist={handleUpdatePlaylist}
                  />
                ) : (
                  <div className="empty-playlist-selection" style={themedStyles.emptyPlaylistSelection}>
                    <h3 style={{ color: themeColors.text }}>Select a playlist to view and edit</h3>
                    <p style={{ color: themeColors.textSecondary }}>Choose a playlist from the sidebar or create a new one</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default Playlists;