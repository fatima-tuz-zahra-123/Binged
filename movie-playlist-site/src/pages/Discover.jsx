import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies, getMovieGenres, discoverMovies } from "../services/tmdbService";
import MovieCard from "../components/MovieCard";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../services/supabaseClient";
import "./Discover.css";

const Discover = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Search filter states
  const [yearFilter, setYearFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");

  // Generate year options from 1900 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  
  useEffect(() => {
    // Load movie genres on component mount
    const loadGenres = async () => {
      try {
        const genreData = await getMovieGenres();
        setGenres(genreData);
      } catch (error) {
        console.error("Failed to load genres:", error);
      }
    };
    
    // Load some initial movies
    const loadInitialMovies = async () => {
      setIsLoading(true);
      try {
        const initialMovies = await discoverMovies({
          sort_by: "popularity.desc"
        });
        setResults(initialMovies);
      } catch (error) {
        console.error("Failed to load initial movies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGenres();
    loadInitialMovies();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let data;
      
      if (query) {
        // If there's a search query, use search endpoint
        data = await searchMovies(query, {
          year: yearFilter,
          vote_average: ratingFilter ? `${ratingFilter},10` : ""
        });
      } else {
        // Otherwise use discover endpoint with filters
        const filters = {
          sort_by: sortBy,
          with_genres: selectedGenre,
          primary_release_year: yearFilter,
          "vote_average.gte": ratingFilter
        };
        
        data = await discoverMovies(filters);
      }
      
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenreClick = async (genreId) => {
    setSelectedGenre(genreId);
    setIsLoading(true);
    
    try {
      const data = await discoverMovies({
        sort_by: sortBy,
        with_genres: genreId,
        primary_release_year: yearFilter,
        "vote_average.gte": ratingFilter
      });
      
      setResults(data);
    } catch (error) {
      console.error("Failed to load genre movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = (movie) => {
    console.log(`Add to playlist: ${movie.title}`);
    alert(`"${movie.title}" added to playlist!`);
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1);

      if (error) throw error;

      if (data.length < 20) {
        setHasMore(false);
      }

      setResults(prev => [...prev, ...data]);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (error) {
    return (
      <div className="discover-page" style={{ backgroundColor: themeColors.background }}>
        <div className="error-message" style={{ color: themeColors.error }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="discover-page" style={{ backgroundColor: themeColors.background }}>
      <h1 style={{ color: themeColors.text }}>Discover Movies</h1>
      
      <div className="movies-grid">
        {results.map(movie => (
          <div 
            key={movie.id} 
            className="movie-card"
            style={{ backgroundColor: themeColors.surface }}
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title}
              className="movie-poster"
            />
            <div className="movie-info">
              <h3 style={{ color: themeColors.text }}>{movie.title}</h3>
              <p style={{ color: themeColors.textSecondary }}>
                {new Date(movie.release_date).getFullYear()}
              </p>
              <div className="movie-rating" style={{ color: themeColors.primary }}>
                ★ {movie.vote_average?.toFixed(1) || 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="loading" style={{ color: themeColors.text }}>
          Loading...
        </div>
      )}

      {!loading && hasMore && (
        <button 
          className="load-more"
          onClick={loadMore}
          style={{ 
            backgroundColor: themeColors.primary,
            color: themeColors.onPrimary
          }}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default Discover;