import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useTheme } from "../src/contexts/ThemeContext";
import { useUser } from "../src/contexts/UserContext";
import './PlaylistMovieItem.css';

const PlaylistMovieItem = ({ movie, onRemove }) => {
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { currentUser, addToDefaultPlaylist } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Format the poster URL or use a fallback image
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  // Check if movie is in liked playlist when component mounts
  useEffect(() => {
    if (currentUser && currentUser.playlists) {
      const likedPlaylist = currentUser.playlists.find(p => p.name === 'Liked');
      if (likedPlaylist) {
        const isInLiked = likedPlaylist.movies.some(m => m.id === movie.id);
        setIsLiked(isInLiked);
      }
    }
  }, [currentUser, movie.id]);

  const handleCardClick = () => {
    // Navigate to movie detail page
    navigate(`/movie/${movie.id}`);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation(); // Prevent triggering navigation
    setIsRemoving(true);
    
    // Visual feedback before removal
    setTimeout(() => {
      if (onRemove) {
        onRemove();
      }
      setIsRemoving(false);
    }, 300);
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
            className={`remove-btn ${isRemoving ? 'active' : ''}`}
            onClick={handleRemoveClick}
            aria-label="Remove from playlist"
            title="Remove from playlist"
          >
            <span className="remove-icon">✕</span>
          </button>
        </div>
      </div>
      <div className={`overlay ${isHovered ? 'show-overlay' : ''}`}>
        <div className="movie-info">
          <h3>{movie.title}</h3>
          {releaseYear && <span className="year">({releaseYear})</span>}
          <p className="overview">{truncatedOverview}</p>
        </div>
      </div>
    </div>
  );
};

export default PlaylistMovieItem;