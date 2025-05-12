import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getPersonDetails, getPersonMovieCredits } from '../services/tmdbService';
import './ActorPage.css';

const ActorPage = () => {
  const { actorId } = useParams();
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  
  const [actor, setActor] = useState(null);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchActorData = async () => {
      try {
        setIsLoading(true);
        
        // Use the service functions instead of direct fetch calls
        const actorData = await getPersonDetails(actorId);
        setActor(actorData);
        
        const creditsData = await getPersonMovieCredits(actorId);
        
        // Sort movies by popularity
        const sortedMovies = creditsData.cast.sort((a, b) => b.popularity - a.popularity);
        setMovies(sortedMovies);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching actor data:', err);
        setError(err.message || 'Failed to load actor data');
        setIsLoading(false);
      }
    };
    
    fetchActorData();
  }, [actorId]);
  
  if (isLoading) {
    return (
      <div className="actor-page loading" style={{ backgroundColor: themeColors.background }}>
        <div className="loading-spinner"></div>
        <p>Loading actor information...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="actor-page error" style={{ backgroundColor: themeColors.background }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate(-1)}
          style={{ backgroundColor: themeColors.primary }}
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!actor) {
    return (
      <div className="actor-page not-found" style={{ backgroundColor: themeColors.background }}>
        <h2>Actor Not Found</h2>
        <p>We couldn't find the actor you're looking for.</p>
        <button 
          onClick={() => navigate(-1)}
          style={{ backgroundColor: themeColors.primary }}
        >
          Go Back
        </button>
      </div>
    );
  }
  
  // Format the profile URL
  const profileUrl = actor.profile_path 
    ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
    : 'https://via.placeholder.com/300x450?text=No+Photo';
  
  // Calculate age if birth date is available and actor is alive
  const calculateAge = () => {
    if (!actor.birthday) return null;
    
    const birthDate = new Date(actor.birthday);
    let endDate = new Date();
    
    if (actor.deathday) {
      endDate = new Date(actor.deathday);
    }
    
    let age = endDate.getFullYear() - birthDate.getFullYear();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (
      endDate.getMonth() < birthDate.getMonth() || 
      (endDate.getMonth() === birthDate.getMonth() && endDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    
    return age;
  };
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="actor-page" style={{ backgroundColor: themeColors.background, color: themeColors.text }}>
      <div className="actor-page-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
          style={{ backgroundColor: themeColors.primary }}
        >
          ← Back to Movie
        </button>
      </div>
      
      <div className="actor-content">
        <div className="actor-header">
          <div className="profile-container">
            <img src={profileUrl} alt={actor.name} className="profile-image" />
          </div>
          
          <div className="actor-info">
            <h1>{actor.name}</h1>
            
            {actor.birthday && (
              <div className="birth-info">
                <span className="birth-date">Born: {formatDate(actor.birthday)}</span>
                
                {actor.place_of_birth && (
                  <span className="birth-place">in {actor.place_of_birth}</span>
                )}
                
                {calculateAge() !== null && !actor.deathday && (
                  <span className="age">({calculateAge()} years old)</span>
                )}
              </div>
            )}
            
            {actor.deathday && (
              <div className="death-info">
                <span>Died: {formatDate(actor.deathday)}</span>
                {calculateAge() !== null && (
                  <span className="age">({calculateAge()} years old)</span>
                )}
              </div>
            )}
            
            {actor.known_for_department && (
              <div className="department">Known for: {actor.known_for_department}</div>
            )}
            
            {actor.biography && (
              <div className="biography">
                <h3>Biography</h3>
                <div className="biography-text">{actor.biography}</div>
              </div>
            )}
          </div>
        </div>
        
        {movies.length > 0 && (
          <div className="filmography-section">
            <h2>Filmography</h2>
            <div className="movies-grid">
              {movies.map(movie => (
                <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card">
                  <div className="movie-poster-container">
                    {movie.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} 
                        alt={movie.title}
                        className="movie-poster"
                      />
                    ) : (
                      <div className="no-poster" style={{ backgroundColor: themeColors.surface }}>
                        No Poster
                      </div>
                    )}
                    
                    {movie.vote_average > 0 && (
                      <div className="movie-rating" style={{ backgroundColor: `${themeColors.surface}CC` }}>
                        <span>⭐ {movie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="movie-details" style={{ backgroundColor: themeColors.surface }}>
                    <h3 className="movie-title">{movie.title}</h3>
                    {movie.release_date && (
                      <div className="movie-year">
                        {new Date(movie.release_date).getFullYear()}
                      </div>
                    )}
                    {movie.character && (
                      <div className="movie-character">
                        as <span>{movie.character}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActorPage;