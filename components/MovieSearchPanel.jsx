import React, { useState, useEffect } from 'react';
import { searchMovies } from '../services/tmdbService';
import './MovieSearchPanel.css';

const MovieSearchPanel = ({ onAddMovie }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Debounce search requests
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const results = await searchMovies(searchTerm);
      setSearchResults(results.slice(0, 12)); // Limit to 12 results
    } catch (err) {
      console.error('Failed to search movies:', err);
      setError('Failed to search movies. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddToPlaylist = (movie) => {
    onAddMovie({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      overview: movie.overview,
      vote_average: movie.vote_average
    });
  };
  
  return (
    <div className="movie-search-panel">
      <div className="search-header">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for movies to add..."
          className="search-input"
        />
      </div>
      
      <div className="search-content">
        {isLoading && (
          <div className="search-loading">Loading...</div>
        )}
        
        {error && (
          <div className="search-error">{error}</div>
        )}
        
        {!isLoading && !error && searchResults.length === 0 && searchTerm.trim().length > 2 && (
          <div className="no-results">No movies found matching "{searchTerm}"</div>
        )}
        
        {!isLoading && searchResults.length > 0 && (
          <div className="search-results-grid">
            {searchResults.map(movie => (
              <div key={movie.id} className="movie-search-item">
                <div className="search-poster-container">
                  <img 
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}
                    alt={movie.title}
                    className="search-movie-poster"
                  />
                </div>
                <div className="search-movie-info">
                  <h5 className="search-movie-title">{movie.title}</h5>
                  <div className="search-movie-year">
                    {movie.release_date && new Date(movie.release_date).getFullYear()}
                  </div>
                  <button 
                    className="add-to-playlist-btn"
                    onClick={() => handleAddToPlaylist(movie)}
                  >
                    <span className="add-icon">+</span> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {searchTerm.trim().length < 3 && !isLoading && (
          <div className="search-instruction">Type at least 3 characters to search</div>
        )}
      </div>
    </div>
  );
};

export default MovieSearchPanel;