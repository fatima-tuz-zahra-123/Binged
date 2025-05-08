import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useTheme } from "../contexts/ThemeContext";
import PlaylistDropdown from "./PlaylistDropdown";
import "./MovieCard.css";

const MovieCard = ({ movie, showAddToPlaylist = true, onAddToPlaylist }) => {
  const navigate = useNavigate();
  const { currentUser, addToDefaultPlaylist } = useUser();
  const { themeColors } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Format the poster URL or use a fallback image
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  // Check if movie is in liked/watched playlists when component mounts
  useEffect(() => {
    if (currentUser && currentUser.playlists) {
      // Check if in Liked playlist
      const likedPlaylist = currentUser.playlists.find(p => p.name === 'Liked');
      if (likedPlaylist) {
        const isInLiked = likedPlaylist.movies.some(m => m.id === movie.id);
        setIsLiked(isInLiked);
      }
      
      // Check if in Watched playlist
      const watchedPlaylist = currentUser.playlists.find(p => p.name === 'Watched');
      if (watchedPlaylist) {
        const isInWatched = watchedPlaylist.movies.some(m => m.id === movie.id);
        setIsWatched(isInWatched);
      }
    }
  }, [currentUser, movie.id]);

  const handleCardClick = () => {
    // Navigate to movie detail page
    navigate(`/movie/${movie.id}`);
  };

  const handleAddToPlaylistClick = (e) => {
    e.stopPropagation(); // Prevent triggering navigation
    
    if (!currentUser) {
      // If no user is logged in, use the provided onAddToPlaylist function
      if (onAddToPlaylist) {
        setIsAdding(true);
        // Show checkmark for 1.5 seconds
        setTimeout(() => {
          setIsAdding(false);
        }, 1500);
        onAddToPlaylist(movie);
      }
    } else {
      // For logged in users, show the playlist dropdown
      setShowDropdown(prev => !prev);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation(); // Prevent triggering navigation
    
    if (!currentUser) {
      // If no user is logged in, prompt to login
      alert("Please log in to like movies");
      return;
    }
    
    // Toggle liked state
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // Add to or remove from default "Liked" playlist
    addToDefaultPlaylist(movie, 'Liked', newLikedState);
  };
  
  const handleWatchedClick = (e) => {
    e.stopPropagation(); // Prevent triggering navigation
    
    if (!currentUser) {
      // If no user is logged in, prompt to login
      alert("Please log in to mark movies as watched");
      return;
    }
    
    // Toggle watched state
    const newWatchedState = !isWatched;
    setIsWatched(newWatchedState);
    
    // Add to or remove from default "Watched" playlist
    addToDefaultPlaylist(movie, 'Watched', newWatchedState);
  };

  const handlePlaylistSelected = (playlistId) => {
    setShowDropdown(false);
    setIsAdding(true);
    // Show checkmark for 1.5 seconds
    setTimeout(() => {
      setIsAdding(false);
    }, 1500);
    console.log(`Movie ${movie.title} added to playlist with ID: ${playlistId}`);
  };

  // Create a truncated overview if it's too long
  const truncatedOverview = movie.overview
    ? movie.overview.length > 100
      ? `${movie.overview.slice(0, 100)}...`
      : movie.overview
    : "No overview available";

  // Format release date to year only if available
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  return (
    <div 
      className="movie-card" 
      onClick={handleCardClick} 
      title={movie.title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="poster-container">
        <img
          className="poster"
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
        />
        {movie.vote_average && (
          <div className="rating" style={{ 
            backgroundColor: `${themeColors.surface}CC`,
            color: themeColors.primary 
          }}>
            <span>⭐ {movie.vote_average.toFixed(1)}</span>
          </div>
        )}
        
        {showAddToPlaylist && (
          <div className="poster-actions">
            <button 
              className={`like-btn ${isLiked ? 'active' : ''}`}
              onClick={handleLikeClick}
              aria-label={isLiked ? "Remove from liked" : "Add to liked"}
              title="Like"
            >
              <span className="heart-icon">{isLiked ? '♥' : '♡'}</span>
            </button>
            
            <button 
              className={`watched-btn ${isWatched ? 'active' : ''}`}
              onClick={handleWatchedClick}
              aria-label={isWatched ? "Remove from watched" : "Add to watched"}
              title="Watched"
            >
              <span className="watched-icon">{isWatched ? '✓' : '👁️'}</span>
            </button>
            
            <button 
              className={`add-btn ${isAdding ? 'active' : ''}`}
              onClick={handleAddToPlaylistClick}
              aria-label="Add to playlist"
              title="Add to playlist"
            >
              {isAdding ? '✓' : '+'}
            </button>
          </div>
        )}
      </div>
      <div className={`overlay ${isHovered ? 'show-overlay' : ''}`}>
        <div className="movie-info">
          <h3>{movie.title}</h3>
          {releaseYear && <span className="year">({releaseYear})</span>}
          <p className="overview">{truncatedOverview}</p>
        </div>
      </div>
      
      {showDropdown && currentUser && (
        <div 
          className={`playlist-dropdown-container ${showDropdown ? 'visible' : ''}`} 
          onClick={e => e.stopPropagation()}
        >
          <PlaylistDropdown 
            movie={movie} 
            onPlaylistSelected={handlePlaylistSelected} 
            onClose={() => setShowDropdown(false)}
          />
        </div>
      )}
    </div>
  );
};

export default MovieCard;