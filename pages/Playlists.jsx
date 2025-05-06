import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchMovies } from '../services/tmdbService';
import { useUser } from '../src/contexts/UserContext';
import { useTheme } from '../src/contexts/ThemeContext';
import './Playlists.css';

const Playlists = () => {
  const { currentUser, updateProfile } = useUser();
  const { themeColors } = useTheme();
  
  // Initialize playlists from user profile if logged in, otherwise from localStorage
  const [playlists, setPlaylists] = useState(() => {
    if (currentUser && currentUser.playlists) {
      return currentUser.playlists;
    }
    const savedPlaylists = localStorage.getItem('playlists');
    return savedPlaylists ? JSON.parse(savedPlaylists) : [];
  });
  
  const [newPlaylist, setNewPlaylist] = useState('');
  const [activePlaylistIndex, setActivePlaylistIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save playlists to user profile and localStorage whenever they change
  useEffect(() => {
    // Save to localStorage as a fallback for non-logged in users
    localStorage.setItem('playlists', JSON.stringify(playlists));
    
    // If user is logged in, update their profile with the playlists
    if (currentUser) {
      updateProfile({ playlists });
    }
  }, [playlists, currentUser, updateProfile]);

  const handleCreatePlaylist = () => {
    if (newPlaylist.trim()) {
      setPlaylists([...playlists, { 
        id: Date.now().toString(),  // Add unique ID
        name: newPlaylist, 
        movies: [],
        createdAt: new Date().toISOString()
      }]);
      setNewPlaylist('');
    }
  };

  const handleDeletePlaylist = (index) => {
    const updatedPlaylists = [...playlists];
    updatedPlaylists.splice(index, 1);
    setPlaylists(updatedPlaylists);
  };

  const handleSearchMovies = async (playlistIndex) => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the TMDB service to search for movies
        const results = await searchMovies(searchQuery);
        
        // Map the results to the format we need
        const formattedResults = results.map(movie => ({
          id: movie.id,
          title: movie.title,
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster',
          overview: movie.overview,
          voteAverage: movie.vote_average
        }));
        
        setSearchResults(formattedResults);
        setActivePlaylistIndex(playlistIndex);
      } catch (err) {
        console.error('Error searching movies:', err);
        setError('Failed to fetch movies. Please try again.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addMovieToPlaylist = (playlistIndex, movie) => {
    const updatedPlaylists = [...playlists];
    // Check if movie is already in the playlist to avoid duplicates
    if (!updatedPlaylists[playlistIndex].movies.some(m => m.id === movie.id)) {
      updatedPlaylists[playlistIndex].movies.push({
        ...movie,
        addedAt: new Date().toISOString()
      });
      setPlaylists(updatedPlaylists);
    }
  };

  const removeMovieFromPlaylist = (playlistIndex, movieId) => {
    const updatedPlaylists = [...playlists];
    updatedPlaylists[playlistIndex].movies = updatedPlaylists[playlistIndex].movies.filter(
      movie => movie.id !== movieId
    );
    setPlaylists(updatedPlaylists);
  };

  // Apply theme-based styling
  const pageStyle = {
    backgroundColor: themeColors.background,
    color: themeColors.text,
    minHeight: "calc(100vh - 70px)"
  };

  const createContainerStyle = {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    backgroundColor: `${themeColors.surface}DD`,
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: themeColors.shadow,
    borderLeft: `4px solid ${themeColors.primary}`
  };

  const inputStyle = {
    flex: 1,
    padding: "0.75rem",
    borderRadius: "8px",
    border: `1px solid ${themeColors.border}`,
    backgroundColor: `${themeColors.background}60`,
    color: themeColors.text
  };

  const buttonStyle = {
    backgroundColor: themeColors.primary,
    color: themeColors.surface,
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontWeight: "600"
  };

  const cardStyle = {
    backgroundColor: themeColors.surface,
    borderRadius: "12px",
    boxShadow: themeColors.shadow,
    overflow: "hidden",
    borderTop: `3px solid ${themeColors.primary}`
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: `${themeColors.background}80`,
    borderBottom: `1px solid ${themeColors.border}`
  };

  const emptyStateStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    textAlign: "center",
    color: themeColors.textSecondary,
    backgroundColor: `${themeColors.surface}DD`,
    borderRadius: "12px",
    borderLeft: `4px solid ${themeColors.primary}`
  };

  const authPromptStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    textAlign: "center",
    backgroundColor: `${themeColors.surface}DD`,
    borderRadius: "12px",
    margin: "100px auto",
    maxWidth: "500px",
    borderTop: `3px solid ${themeColors.primary}`,
    boxShadow: themeColors.shadow
  };

  if (!currentUser) {
    return (
      <div className="page playlists-page" style={pageStyle}>
        <div style={authPromptStyle}>
          <h2 style={{ color: themeColors.primary, marginBottom: "1rem" }}>Your Movie Playlists</h2>
          <p style={{ marginBottom: "1.5rem", color: themeColors.textSecondary }}>Sign in to create and manage your movie playlists!</p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link to="/login" style={{ ...buttonStyle, textDecoration: "none" }}>Login</Link>
            <Link to="/signup" style={{ 
              backgroundColor: "transparent", 
              border: `1px solid ${themeColors.primary}`,
              color: themeColors.primary,
              textDecoration: "none",
              borderRadius: "8px",
              padding: "0.5rem 1rem"
            }}>Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page playlists-page" style={pageStyle}>
      <h2 style={{ color: themeColors.primary, marginBottom: "1.5rem" }}>Your Movie Playlists</h2>
      
      {/* Create playlist section */}
      <div style={createContainerStyle}>
        <input
          type="text"
          value={newPlaylist}
          onChange={(e) => setNewPlaylist(e.target.value)}
          placeholder="New Playlist Name"
          style={inputStyle}
        />
        <button style={buttonStyle} onClick={handleCreatePlaylist}>
          Create Playlist
        </button>
      </div>
      
      {/* Playlists display section */}
      <div className="playlist-grid">
        {playlists.length === 0 ? (
          <div style={emptyStateStyle}>
            <p>No playlists yet. Create one to get started!</p>
          </div>
        ) : (
          playlists.map((playlist, index) => (
            <div key={playlist.id || index} style={cardStyle}>
              <div style={headerStyle}>
                <h3 style={{ margin: 0, color: themeColors.text }}>{playlist.name}</h3>
                <span style={{ 
                  fontSize: "0.9rem",
                  color: themeColors.textSecondary,
                  backgroundColor: `${themeColors.primary}30`,
                  padding: "3px 8px",
                  borderRadius: "12px"
                }}>
                  {playlist.movies.length} {playlist.movies.length === 1 ? 'movie' : 'movies'}
                </span>
                <button 
                  style={{
                    background: "none",
                    border: "none",
                    color: themeColors.textSecondary,
                    fontSize: "1.5rem",
                    cursor: "pointer"
                  }}
                  onClick={() => handleDeletePlaylist(index)}
                  aria-label={`Delete ${playlist.name} playlist`}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              
              {/* Add movies to this specific playlist */}
              <div style={{ padding: "1rem", borderBottom: `1px solid ${themeColors.border}` }}>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <input
                    type="text"
                    value={activePlaylistIndex === index ? searchQuery : ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for movies to add..."
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "8px",
                      border: `1px solid ${themeColors.border}`,
                      backgroundColor: `${themeColors.background}60`,
                      color: themeColors.text
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchMovies(index);
                    }}
                  />
                  <button 
                    style={buttonStyle}
                    onClick={() => handleSearchMovies(index)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                {error && activePlaylistIndex === index && (
                  <div style={{ 
                    color: themeColors.primary,
                    padding: "0.5rem",
                    marginBottom: "1rem",
                    backgroundColor: `${themeColors.primary}15`,
                    borderRadius: "8px"
                  }}>{error}</div>
                )}
                
                {activePlaylistIndex === index && searchResults.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ marginBottom: "0.5rem", color: themeColors.text }}>Search Results</h4>
                    <div className="movie-grid">
                      {searchResults.map((movie) => (
                        <div key={movie.id} style={{ 
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "12px",
                          backgroundColor: themeColors.surface,
                          boxShadow: themeColors.shadow,
                          border: `1px solid ${themeColors.border}`
                        }}>
                          <div className="poster-container">
                            <img 
                              src={movie.poster} 
                              alt={movie.title} 
                              className="movie-poster"
                              loading="lazy"
                            />
                            <div style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              backgroundColor: "rgba(0, 0, 0, 0.7)",
                              color: themeColors.primary,
                              borderRadius: "8px",
                              padding: "4px 8px",
                              fontSize: "0.9rem",
                              fontWeight: "600"
                            }}>
                              <span>{movie.voteAverage?.toFixed(1) || 'N/A'}</span>
                            </div>
                          </div>
                          <div style={{ padding: "0.5rem", backgroundColor: `${themeColors.background}95` }}>
                            <h4 style={{
                              margin: "0 0 5px 0",
                              fontSize: "0.95rem",
                              color: themeColors.text,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis"
                            }}>{movie.title}</h4>
                            <p style={{
                              fontSize: "0.9rem",
                              color: themeColors.textSecondary,
                              marginBottom: "10px"
                            }}>{movie.year !== 'Unknown' ? movie.year : ''}</p>
                            <button 
                              style={{
                                ...buttonStyle,
                                width: "100%",
                                opacity: playlist.movies.some(m => m.id === movie.id) ? 0.7 : 1
                              }}
                              onClick={() => addMovieToPlaylist(index, movie)}
                              disabled={playlist.movies.some(m => m.id === movie.id)}
                            >
                              {playlist.movies.some(m => m.id === movie.id) 
                                ? 'In Playlist' 
                                : 'Add to Playlist'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activePlaylistIndex === index && searchResults.length === 0 && !isLoading && searchQuery.trim() && !error && (
                  <div style={{ padding: "1rem", textAlign: "center", color: themeColors.textSecondary }}>No movies found for "{searchQuery}"</div>
                )}
              </div>
              
              {/* Movies in playlist */}
              <div style={{ padding: "1rem" }}>
                <h4 style={{ marginBottom: "1rem", color: themeColors.text }}>Movies in this Playlist</h4>
                {playlist.movies.length > 0 ? (
                  <div className="movie-grid">
                    {playlist.movies.map((movie) => (
                      <div key={movie.id} style={{ 
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: "12px",
                        backgroundColor: themeColors.surface,
                        boxShadow: themeColors.shadow,
                        border: `1px solid ${themeColors.border}`
                      }}>
                        <div className="poster-container">
                          <img 
                            src={movie.poster} 
                            alt={movie.title} 
                            className="movie-poster"
                            loading="lazy"
                          />
                          <div style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            color: themeColors.primary,
                            borderRadius: "8px",
                            padding: "4px 8px",
                            fontSize: "0.9rem",
                            fontWeight: "600"
                          }}>
                            <span>{movie.voteAverage?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                        <div style={{ padding: "0.5rem", backgroundColor: `${themeColors.background}95` }}>
                          <h4 style={{
                            margin: "0 0 5px 0",
                            fontSize: "0.95rem",
                            color: themeColors.text,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>{movie.title}</h4>
                          <p style={{
                            fontSize: "0.9rem",
                            color: themeColors.textSecondary,
                            marginBottom: "10px"
                          }}>{movie.year !== 'Unknown' ? movie.year : ''}</p>
                          <button 
                            style={{
                              backgroundColor: `${themeColors.background}60`,
                              color: themeColors.primary,
                              border: `1px solid ${themeColors.primary}`,
                              borderRadius: "8px",
                              padding: "0.5rem 1rem",
                              cursor: "pointer",
                              fontWeight: "600",
                              width: "100%"
                            }}
                            onClick={() => removeMovieFromPlaylist(index, movie.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ padding: "1rem", textAlign: "center", color: themeColors.textSecondary }}>No movies in this playlist yet.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Playlists;