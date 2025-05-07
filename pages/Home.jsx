import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNowPlayingMovies } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { useTheme } from '../src/contexts/ThemeContext';

import './Home.css';

const Home = () => {
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        const nowPlaying = await fetchNowPlayingMovies();
        
        // Select a featured movie (one with a backdrop image and good rating)
        const potentialFeatures = nowPlaying.filter(
          movie => movie.backdrop_path && movie.vote_average >= 7
        );
        
        if (potentialFeatures.length > 0) {
          // Choose a random movie from the filtered list
          const randomIndex = Math.floor(Math.random() * potentialFeatures.length);
          setFeaturedMovie(potentialFeatures[randomIndex]);
        }
        
        setMovies(nowPlaying);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load movies:', err);
        setIsLoading(false);
      }
    };

    loadMovies();
  }, []);

  const handleAddToPlaylist = (movie) => {
    console.log(`Add to playlist: ${movie.title}`);
    alert(`"${movie.title}" added to playlist!`);
  };
  
  const handleFeaturedMovieClick = () => {
    if (featuredMovie) {
      navigate(`/movie/${featuredMovie.id}`);
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  // Apply theme-based styling
  const homeStyle = {
    backgroundColor: themeColors.background,
    color: themeColors.text,
  };

  const titleStyle = {
    color: themeColors.primary
  };

  return (
    <div className="home-page" style={homeStyle}>
      {featuredMovie && !query && (
        <div className="hero-section" onClick={handleFeaturedMovieClick} style={{ cursor: 'pointer' }}>
          <div 
            className="hero-backdrop"
            style={{ 
              backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})` 
            }}
          ></div>
          <div className="hero-content">
            <h1 className="hero-title">{featuredMovie.title}</h1>
            <p className="hero-description">
              {featuredMovie.overview.length > 200 
                ? `${featuredMovie.overview.substring(0, 200)}...` 
                : featuredMovie.overview}
            </p>
            <button 
              className="hero-cta"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/movie/${featuredMovie.id}`);
              }}
              style={{
                backgroundColor: themeColors.primary,
                color: themeColors.buttonText
              }}
            >
              View Details
            </button>
          </div>
        </div>
      )}

      <SearchBar query={query} setQuery={setQuery} />

      <div className="movie-section">
        <h2 className="section-title" style={titleStyle}>Now Playing 🎬</h2>

        {isLoading ? (
          <div className="loading">Loading movies...</div>
        ) : filteredMovies.length > 0 ? (
          <div className="movie-grid">
            {filteredMovies.map((movie) => (
              <div className="movie-card-container" key={movie.id}>
                <MovieCard
                  movie={movie}
                  showAddToPlaylist
                  onAddToPlaylist={handleAddToPlaylist}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>No movies match your search.</p>
        )}
      </div>
    </div>
  );
};

export default Home;