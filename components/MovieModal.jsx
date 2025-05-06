import React, { useEffect, useState } from "react";
import { useTheme } from "../src/contexts/ThemeContext";
import "./MovieModal.css";
import { fetchMovieDetails, fetchMovieCredits } from "../services/tmdbService";

const MovieModal = ({ movieId, onClose }) => {
  const { themeColors } = useTheme();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);

  useEffect(() => {
    const getMovieData = async () => {
      const details = await fetchMovieDetails(movieId);
      const credits = await fetchMovieCredits(movieId);
      setMovie(details);
      setCast(credits.cast.slice(0, 5)); // Top 5 cast members
    };
    getMovieData();
  }, [movieId]);

  if (!movie) return null;

  // Apply theme-based styling
  const backdropStyle = {
    background: `rgba(${themeColors.background === '#0f0f0f' ? '15, 8, 75, 0.85' : '255, 255, 255, 0.85'})`,
  };

  const contentStyle = {
    backgroundColor: themeColors.surface,
    color: themeColors.text,
    boxShadow: themeColors.shadow
  };

  const submitBtnStyle = {
    backgroundColor: themeColors.primary,
    color: themeColors.surface
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={backdropStyle}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={contentStyle}>
        <button className="close-btn" onClick={onClose} style={{ color: themeColors.textSecondary }}>×</button>
        <img
          className="modal-poster"
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />
        <div className="modal-info">
          <h2 style={{ color: themeColors.primary }}>{movie.title}</h2>
          <p>{movie.overview}</p>
          <p><strong>Rating:</strong> ⭐ {movie.vote_average}</p>
          <p><strong>Cast:</strong> {cast.map(c => c.name).join(", ")}</p>

          <div className="reviews">
            <textarea 
              placeholder="Leave a review..." 
              style={{
                borderColor: themeColors.border,
                backgroundColor: `${themeColors.background}50`,
                color: themeColors.text
              }}
            />
            <button style={submitBtnStyle}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;