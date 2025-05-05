import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchMovies } from '../services/tmdbService';
import { useUser } from '../src/contexts/UserContext';
import { useTheme } from '../src/contexts/ThemeContext';
import './Playlists.css';

const Playlists = () => {
  const { currentUser, updateProfile } = useUser();
  const { theme } = useTheme();
  
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

  if (!currentUser) {
    return (
      <div className="page playlists-page">
        <div className="auth-prompt">
          <h2>Your Movie Playlists</h2>
          <p>Sign in to create and manage your movie playlists!</p>
          <div className="auth-buttons">
            <Link to="/login" className="button">Login</Link>
            <Link to="/signup" className="button button-secondary">Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page playlists-page">
      <h2 className="section-heading">Your Movie Playlists</h2>
      
      {/* Create playlist section */}
      <div className="create-playlist-container">
        <input
          type="text"
          value={newPlaylist}
          onChange={(e) => setNewPlaylist(e.target.value)}
          placeholder="New Playlist Name"
          className="create-input"
        />
        <button className="button" onClick={handleCreatePlaylist}>
          Create Playlist
        </button>
      </div>
      
      {/* Playlists display section */}
      <div className="playlist-grid">
        {playlists.length === 0 ? (
          <div className="empty-state">
            <p>No playlists yet. Create one to get started!</p>
          </div>
        ) : (
          playlists.map((playlist, index) => (
            <div key={playlist.id || index} className="playlist-card card">
              <div className="playlist-header">
                <h3>{playlist.name}</h3>
                <span className="movie-count">
                  {playlist.movies.length} {playlist.movies.length === 1 ? 'movie' : 'movies'}
                </span>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeletePlaylist(index)}
                  aria-label={`Delete ${playlist.name} playlist`}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              
              {/* Add movies to this specific playlist */}
              <div className="add-to-playlist">
                <div className="search-container">
                  <input
                    type="text"
                    value={activePlaylistIndex === index ? searchQuery : ''}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for movies to add..."
                    className="search-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchMovies(index);
                    }}
                  />
                  <button 
                    className="button"
                    onClick={() => handleSearchMovies(index)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                {error && activePlaylistIndex === index && (
                  <div className="error-message">{error}</div>
                )}
                
                {activePlaylistIndex === index && searchResults.length > 0 && (
                  <div className="search-results">
                    <h4>Search Results</h4>
                    <div className="movie-grid">
                      {searchResults.map((movie) => (
                        <div key={movie.id} className="movie-search-item card">
                          <div className="poster-container">
                            <img 
                              src={movie.poster} 
                              alt={movie.title} 
                              className="movie-poster"
                              loading="lazy"
                            />
                            <div className="movie-rating">
                              <span>{movie.voteAverage?.toFixed(1) || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="movie-details">
                            <h4 className="movie-title">{movie.title}</h4>
                            <p className="movie-year">{movie.year !== 'Unknown' ? movie.year : ''}</p>
                            <button 
                              className={`button ${playlist.movies.some(m => m.id === movie.id) ? 'button-secondary' : ''}`}
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
                  <div className="no-results">No movies found for "{searchQuery}"</div>
                )}
              </div>
              
              {/* Movies in playlist */}
              <div className="playlist-movies">
                <h4>Movies in this Playlist</h4>
                {playlist.movies.length > 0 ? (
                  <div className="movie-grid">
                    {playlist.movies.map((movie) => (
                      <div key={movie.id} className="movie-item card">
                        <div className="poster-container">
                          <img 
                            src={movie.poster} 
                            alt={movie.title} 
                            className="movie-poster"
                            loading="lazy"
                          />
                          <div className="movie-rating">
                            <span>{movie.voteAverage?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="movie-details">
                          <h4 className="movie-title">{movie.title}</h4>
                          <p className="movie-year">{movie.year !== 'Unknown' ? movie.year : ''}</p>
                          <button 
                            className="button button-danger"
                            onClick={() => removeMovieFromPlaylist(index, movie.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-playlist-message">No movies in this playlist yet.</p>
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