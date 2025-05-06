import React, { useState } from "react";
import { useUser } from "../src/contexts/UserContext";
import { useTheme } from "../src/contexts/ThemeContext";
import MovieModal from "./MovieModal";
import PlaylistDropdown from "./PlaylistDropdown";
import "./MovieCard.css";

const MovieCard = ({ movie, showAddToPlaylist = false, onAddToPlaylist }) => {
  const { currentUser } = useUser();
  const { themeColors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Format the poster URL or use a fallback image
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const handleCardClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleAddToPlaylistClick = (e) => {
    e.stopPropagation(); // Prevent triggering modal
    if (!currentUser) {
      // If no user is logged in, use the provided onAddToPlaylist function
      if (onAddToPlaylist) {
        onAddToPlaylist(movie);
      }
    } else {
      // For logged in users, show the playlist dropdown
      setShowDropdown(prev => !prev);
    }
  };

  const handlePlaylistSelected = (playlistId) => {
    setShowDropdown(false);
    // Now using the playlistId parameter correctly
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

  // Apply theme-based styling
  const cardStyle = {
    backgroundColor: themeColors.surface,
    boxShadow: themeColors.shadow
  };

  const ratingStyle = {
    backgroundColor: `${themeColors.surface}CC`, // Adding some transparency
    color: themeColors.primary
  };

  const addBtnStyle = {
    backgroundColor: themeColors.primary,
    color: themeColors.surface
  };

  return (
    <>
      <div className="movie-card" onClick={handleCardClick} title={movie.title} style={cardStyle}>
        <div className="poster-container">
          <img
            className="poster"
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
          />
          {movie.vote_average && (
            <div className="rating" style={ratingStyle}>
              <span>⭐ {movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="overlay">
          <div className="movie-info">
            <h3>{movie.title}</h3>
            {releaseYear && <span className="year">({releaseYear})</span>}
            <p className="overview">{truncatedOverview}</p>
          </div>
          <div className="actions">
            {showAddToPlaylist && (
              <button 
                className="add-btn" 
                onClick={handleAddToPlaylistClick}
                aria-label="Add to playlist"
                style={addBtnStyle}
              >
                {showDropdown ? '✕' : '+'}
              </button>
            )}
          </div>
        </div>
        
        {showDropdown && currentUser && (
          <div className="playlist-dropdown-container" onClick={e => e.stopPropagation()}>
            <PlaylistDropdown 
              movie={movie} 
              onPlaylistSelected={handlePlaylistSelected} 
              onClose={() => setShowDropdown(false)}
            />
          </div>
        )}
      </div>

      {showModal && <MovieModal movieId={movie.id} onClose={closeModal} />}
    </>
  );
};

export default MovieCard;