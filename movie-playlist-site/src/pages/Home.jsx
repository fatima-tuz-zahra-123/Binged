import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNowPlayingMovies, fetchTopRatedMovies, fetchPopularMovies, fetchUpcomingMovies } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import { useTheme } from '../contexts/ThemeContext';

import './Home.css';

const Home = () => {
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const slideIntervalRef = useRef(null);
  
  // Hero slider movies
  const [heroMovies, setHeroMovies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Home component: Starting to fetch movies from TMDB...");
        
        // Fetch different movie categories
        const nowPlaying = await fetchNowPlayingMovies();
        console.log(`Fetched ${nowPlaying?.length || 0} now playing movies`);
        
        const topRated = await fetchTopRatedMovies();
        console.log(`Fetched ${topRated?.length || 0} top rated movies`);
        
        const popular = await fetchPopularMovies();
        console.log(`Fetched ${popular?.length || 0} popular movies`);
        
        const upcoming = await fetchUpcomingMovies();
        console.log(`Fetched ${upcoming?.length || 0} upcoming movies`);
        
        // Filter movies with backdrop images and high ratings for hero section
        const potentialHeroMovies = [
          ...topRated.filter(movie => movie.backdrop_path && movie.vote_average >= 7.5).slice(0, 3),
          ...popular.filter(movie => movie.backdrop_path && movie.vote_average >= 7.2).slice(0, 3),
          ...upcoming.filter(movie => movie.backdrop_path).slice(0, 2)
        ];
        
        // Set hero movies for slider, ensuring diversity in selections
        const selectedHeroMovies = [];
        const movieIds = new Set();
        
        // Prioritize movies with highest ratings and ensure variety
        potentialHeroMovies.sort((a, b) => b.vote_average - a.vote_average);
        
        // Select up to 6 diverse movies for the hero slider
        for (const movie of potentialHeroMovies) {
          if (!movieIds.has(movie.id) && selectedHeroMovies.length < 6) {
            selectedHeroMovies.push(movie);
            movieIds.add(movie.id);
          }
        }
        
        setHeroMovies(selectedHeroMovies);
        
        // Set category movies
        setTopRatedMovies(topRated);
        setPopularMovies(popular);
        setUpcomingMovies(upcoming);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load movies:', err);
        setError(`Error loading movies: ${err.message}`);
        setIsLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Set up automatic slider
  useEffect(() => {
    if (heroMovies.length > 0) {
      slideIntervalRef.current = setInterval(() => {
        setActiveSlide(prev => (prev + 1) % heroMovies.length);
      }, 8000); // Extended interval for better user experience
    }
    
    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [heroMovies.length]);

  const handleAddToPlaylist = (movie) => {
    console.log(`Add to playlist: ${movie.title}`);
    alert(`"${movie.title}" added to playlist!`);
  };
  
  const handleHeroMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  // Apply theme-based styling
  const homeStyle = {
    backgroundColor: themeColors.background,
    color: themeColors.text,
  };

  const titleStyle = {
    color: themeColors.primary
  };
  
  // Get genre names for hero movies
  const getMovieGenres = (genreIds) => {
    const genreMap = {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Sci-Fi',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western'
    };
    
    return genreIds?.map(id => genreMap[id]).filter(Boolean).slice(0, 3) || [];
  };

  return (
    <div className="home-page" style={homeStyle}>
      {/* Hero Slider Section */}
      {heroMovies.length > 0 && (
        <div className="hero-slider">
          <div className="hero-slides">
            {heroMovies.map((movie, index) => (
              <div 
                key={movie.id}
                className={`hero-slide ${index === activeSlide ? 'active' : ''}`}
                onClick={() => handleHeroMovieClick(movie.id)}
              >
                <div 
                  className="hero-backdrop"
                  style={{ 
                    backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` 
                  }}
                ></div>
                <div className="hero-content">
                  <div className="hero-info">
                    <h1 className="hero-title">{movie.title}</h1>
                    <p className="hero-description">
                      {movie.overview.length > 220 
                        ? `${movie.overview.substring(0, 220)}...` 
                        : movie.overview}
                    </p>
                    <div className="hero-metadata">
                      <span className="rating">⭐ {movie.vote_average.toFixed(1)}</span>
                      {movie.release_date && (
                        <span className="year">{new Date(movie.release_date).getFullYear()}</span>
                      )}
                      {getMovieGenres(movie.genre_ids).map(genre => (
                        <span key={genre} className="genre">{genre}</span>
                      ))}
                    </div>
                    <div className="hero-buttons">
                      <button 
                        className="hero-cta"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/movie/${movie.id}`);
                        }}
                        style={{
                          backgroundColor: themeColors.primary,
                          color: themeColors.buttonText
                        }}
                      >
                        View Details
                      </button>
                      <button 
                        className="hero-secondary-cta"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToPlaylist(movie);
                        }}
                      >
                        Add to Playlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="slider-dots">
            {heroMovies.map((_, index) => (
              <button 
                key={index} 
                className={`slider-dot ${index === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      )}

      <div className="content-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading">Loading movies...</div>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">{error}</div>
          </div>
        ) : (
          <>
            {/* Top Rated Movies Section */}
            <div className="movie-section">
              <h2 className="section-title" style={titleStyle}>Top Rated Movies ⭐</h2>
              <div className="movie-row">
                {topRatedMovies.slice(0, 12).map((movie) => (
                  <div className="movie-card-container" key={movie.id}>
                    <MovieCard
                      movie={movie}
                      showAddToPlaylist
                      onAddToPlaylist={handleAddToPlaylist}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* New Releases Section */}
            <div className="movie-section">
              <h2 className="section-title" style={titleStyle}>New Releases 🍿</h2>
              <div className="movie-row">
                {upcomingMovies.slice(0, 12).map((movie) => (
                  <div className="movie-card-container" key={movie.id}>
                    <MovieCard
                      movie={movie}
                      showAddToPlaylist
                      onAddToPlaylist={handleAddToPlaylist}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Fan Favorites Section */}
            <div className="movie-section">
              <h2 className="section-title" style={titleStyle}>Fan Favorites ❤️</h2>
              <div className="movie-row">
                {popularMovies.slice(0, 12).map((movie) => (
                  <div className="movie-card-container" key={movie.id}>
                    <MovieCard
                      movie={movie}
                      showAddToPlaylist
                      onAddToPlaylist={handleAddToPlaylist}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;