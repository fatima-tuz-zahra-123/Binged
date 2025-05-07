import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../src/contexts/ThemeContext';
import { useUser } from '../src/contexts/UserContext';
import { getMovieDetails, getMovieCredits, getMovieReviews } from '../services/tmdbService';
import PlaylistDropdown from '../components/PlaylistDropdown';
import './MoviePage.css';

const MoviePage = () => {
  const { movieId } = useParams();
  const { themeColors } = useTheme();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch movie details
        const movieData = await getMovieDetails(movieId);
        setMovie(movieData);
        
        // Fetch credits (cast and crew)
        const creditsData = await getMovieCredits(movieId);
        setCredits(creditsData);
        
        // Fetch official reviews
        const reviewsData = await getMovieReviews(movieId);
        setReviews(reviewsData.results || []);
        
        // Load user reviews from localStorage
        const savedUserReviews = localStorage.getItem('userReviews');
        if (savedUserReviews) {
          const parsedReviews = JSON.parse(savedUserReviews);
          const movieReviews = parsedReviews.filter(review => review.movieId === movieId);
          setUserReviews(movieReviews);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('Failed to load movie data. Please try again.');
        setIsLoading(false);
      }
    };
    
    fetchMovieData();
  }, [movieId]);

  const handleAddToPlaylist = () => {
    if (currentUser) {
      setShowAddToPlaylist(!showAddToPlaylist);
    } else {
      if (window.confirm('You need to be logged in to add movies to playlists. Go to login page?')) {
        navigate('/login');
      }
    }
  };
  
  const handlePlaylistSelected = (playlistId) => {
    setShowAddToPlaylist(false);
    // Implementation would connect to your playlists state management
    console.log(`Movie ${movie.title} added to playlist with ID: ${playlistId}`);
  };
  
  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      if (window.confirm('You need to be logged in to post reviews. Go to login page?')) {
        navigate('/login');
      }
      return;
    }
    
    if (!newReview.trim()) return;
    
    const review = {
      id: `user_review_${Date.now()}`,
      movieId,
      author: currentUser.username,
      content: newReview,
      rating: newRating,
      created_at: new Date().toISOString(),
      userId: currentUser.id
    };
    
    // Add to user reviews
    const updatedReviews = [...userReviews, review];
    setUserReviews(updatedReviews);
    
    // Save to localStorage
    const savedUserReviews = localStorage.getItem('userReviews');
    const parsedReviews = savedUserReviews ? JSON.parse(savedUserReviews) : [];
    const newReviews = [...parsedReviews, review];
    localStorage.setItem('userReviews', JSON.stringify(newReviews));
    
    // Clear form
    setNewReview('');
    setNewRating(5);
  };
  
  if (isLoading) {
    return (
      <div className="movie-page loading">
        <div className="loading-spinner"></div>
        <p>Loading movie details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="movie-page error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="movie-page not-found">
        <h2>Movie Not Found</h2>
        <p>We couldn't find the movie you're looking for.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Format the poster URL
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';
  
  // Format the backdrop URL
  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  return (
    <div className="movie-page" style={{ backgroundColor: themeColors.background }}>
      {backdropUrl && (
        <div className="backdrop" style={{ backgroundImage: `url(${backdropUrl})` }}>
          <div className="backdrop-overlay" style={{ backgroundColor: `${themeColors.background}CC` }}></div>
        </div>
      )}
      
      <div className="movie-content">
        <div className="movie-header">
          <div className="poster-container">
            <img src={posterUrl} alt={movie.title} className="movie-poster" />
            <button 
              className="add-to-playlist-btn" 
              onClick={handleAddToPlaylist}
              style={{ backgroundColor: themeColors.primary }}
            >
              Add to Playlist
            </button>
            {showAddToPlaylist && (
              <div className="playlist-dropdown-wrapper">
                <PlaylistDropdown
                  movie={movie}
                  onPlaylistSelected={handlePlaylistSelected}
                  onClose={() => setShowAddToPlaylist(false)}
                />
              </div>
            )}
          </div>
          
          <div className="movie-info">
            <h1>{movie.title} {movie.release_date && <span>({new Date(movie.release_date).getFullYear()})</span>}</h1>
            
            <div className="movie-meta">
              {movie.runtime && <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
              {movie.genres && movie.genres.map(genre => (
                <span key={genre.id} className="genre-tag">{genre.name}</span>
              ))}
              {movie.vote_average && (
                <div className="rating">
                  <span>⭐ {movie.vote_average.toFixed(1)}</span>
                  <span>({movie.vote_count} votes)</span>
                </div>
              )}
            </div>
            
            <div className="tagline">{movie.tagline}</div>
            
            <div className="overview">
              <h3>Overview</h3>
              <p>{movie.overview || 'No overview available'}</p>
            </div>
            
            <div className="additional-info">
              <div>
                <strong>Status:</strong> {movie.status}
              </div>
              {movie.budget > 0 && (
                <div>
                  <strong>Budget:</strong> ${(movie.budget / 1000000).toFixed(1)} million
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <strong>Revenue:</strong> ${(movie.revenue / 1000000).toFixed(1)} million
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Cast Section */}
        {credits && credits.cast && credits.cast.length > 0 && (
          <div className="cast-section">
            <h2>Cast</h2>
            <div className="cast-list">
              {credits.cast.slice(0, 12).map(person => (
                <Link to={`/actor/${person.id}`} key={person.id} className="cast-member">
                  <div className="actor-photo">
                    {person.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} 
                        alt={person.name}
                      />
                    ) : (
                      <div className="no-photo" style={{ backgroundColor: themeColors.surface }}>
                        No Photo
                      </div>
                    )}
                  </div>
                  <div className="actor-info">
                    <div className="actor-name">{person.name}</div>
                    <div className="character">{person.character}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Reviews</h2>
          
          {/* User review form */}
          {currentUser && (
            <form onSubmit={handleSubmitReview} className="review-form">
              <h3>Write a Review</h3>
              
              <div className="rating-input">
                <label>Your Rating:</label>
                <select 
                  value={newRating} 
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  style={{ backgroundColor: themeColors.surface, color: themeColors.text }}
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'star' : 'stars'}
                    </option>
                  ))}
                </select>
              </div>
              
              <textarea
                placeholder="Share your thoughts on this movie..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                required
                style={{ backgroundColor: themeColors.surface, color: themeColors.text }}
              ></textarea>
              
              <button 
                type="submit"
                style={{ backgroundColor: themeColors.primary, color: themeColors.buttonText }}
              >
                Submit Review
              </button>
            </form>
          )}
          
          {/* All reviews */}
          <div className="reviews-list">
            {/* User reviews */}
            {userReviews.length > 0 && (
              <>
                <h3>User Reviews</h3>
                {userReviews.map(review => (
                  <div key={review.id} className="review" style={{ backgroundColor: themeColors.surface }}>
                    <div className="review-header">
                      <div className="reviewer">
                        <strong>{review.author}</strong>
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="review-rating">⭐ {review.rating}/10</div>
                    </div>
                    <div className="review-content">{review.content}</div>
                  </div>
                ))}
              </>
            )}
            
            {/* TMDB reviews */}
            {reviews.length > 0 && (
              <>
                <h3>TMDB Reviews</h3>
                {reviews.map(review => (
                  <div key={review.id} className="review" style={{ backgroundColor: themeColors.surface }}>
                    <div className="review-header">
                      <div className="reviewer">
                        <strong>{review.author}</strong>
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.author_details && review.author_details.rating && (
                        <div className="review-rating">⭐ {review.author_details.rating}/10</div>
                      )}
                    </div>
                    <div className="review-content">{review.content}</div>
                  </div>
                ))}
              </>
            )}
            
            {reviews.length === 0 && userReviews.length === 0 && (
              <div className="no-reviews">
                <p>No reviews yet. {!currentUser && 'Log in to be the first to review!'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviePage;