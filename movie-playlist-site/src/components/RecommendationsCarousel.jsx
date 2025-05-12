import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { getRecommendations } from '../services/recommendationService';
import { supabase } from '../services/supabaseClient';
import './RecommendationsCarousel.css';

const RecommendationsCarousel = () => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { currentUser } = useUser();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('RecommendationsCarousel mounted/updated');
    console.log('Current user:', currentUser);

    const fetchRecommendations = async () => {
      if (!currentUser) {
        console.log('No current user, returning early');
        return;
      }

      try {
        console.log('Starting to fetch recommendations for user:', currentUser.id);
        setIsLoading(true);
        setError(null);

        // Get recommendations from the Python backend
        console.log('Calling getRecommendations...');
        const recommendedMovies = await getRecommendations(currentUser.id);
        console.log('Raw recommendations from backend:', recommendedMovies);

        if (!recommendedMovies || recommendedMovies.length === 0) {
          console.log('No recommendations received from backend');
          setRecommendations([]);
          return;
        }

        // Get additional movie details from Supabase
        const movieIds = recommendedMovies.map(movie => movie.movie_id);
        console.log('Movie IDs to fetch from Supabase:', movieIds);

        const { data: movieDetails, error: detailsError } = await supabase
          .from('movie')
          .select('*')
          .in('movie_id', movieIds);

        if (detailsError) {
          console.error('Error fetching movie details from Supabase:', detailsError);
          throw detailsError;
        }

        console.log('Movie details from Supabase:', movieDetails);

        // Combine recommendation scores with movie details
        const enrichedMovies = recommendedMovies.map(movie => {
          const details = movieDetails.find(d => d.movie_id === movie.movie_id);
          console.log('Enriching movie:', movie.movie_id, 'with details:', details);
          return {
            ...movie,
            ...details
          };
        });

        console.log('Final enriched movies:', enrichedMovies);
        setRecommendations(enrichedMovies);
      } catch (err) {
        console.error('Error in fetchRecommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentUser]);

  // Debug render conditions
  console.log('Render conditions:', {
    hasUser: !!currentUser,
    isLoading,
    hasError: !!error,
    recommendationsCount: recommendations.length
  });

  if (!currentUser) {
    console.log('No user, returning null');
    return null;
  }
  if (isLoading) {
    console.log('Loading state, showing loading message');
    return <div className="loading">Loading recommendations...</div>;
  }
  if (error) {
    console.log('Error state, showing error message:', error);
    return <div className="error">{error}</div>;
  }
  if (recommendations.length === 0) {
    console.log('No recommendations, returning null');
    return null;
  }

  console.log('Rendering recommendations carousel with movies:', recommendations);

  return (
    <div className="recommendations-carousel">
      <h2>Recommended for You</h2>
      <div className="carousel-container">
        <div className="carousel">
          {recommendations.map((movie) => {
            console.log('Rendering movie card for:', movie);
            return (
              <div
                key={movie.movie_id}
                className="movie-card"
                onClick={() => navigate(`/movie/${movie.movie_id}`)}
                style={{ backgroundColor: themeColors.surface }}
              >
                <div className="poster-container">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      className="movie-poster"
                    />
                  ) : (
                    <div className="no-poster">No Poster</div>
                  )}
                  {movie.vote_average > 0 && (
                    <div className="rating" style={{ backgroundColor: themeColors.surface }}>
                      ⭐ {movie.vote_average.toFixed(1)}
                    </div>
                  )}
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  {movie.release_date && (
                    <span className="year">
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsCarousel; 