import React, { useEffect, useState } from "react";
import "./MovieModal.css";
import { fetchMovieDetails, fetchMovieCredits } from "../services/tmdbService";

const MovieModal = ({ movieId, onClose }) => {
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <img
          className="modal-poster"
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
        />
        <div className="modal-info">
          <h2>{movie.title}</h2>
          <p>{movie.overview}</p>
          <p><strong>Rating:</strong> ⭐ {movie.vote_average}</p>
          <p><strong>Cast:</strong> {cast.map(c => c.name).join(", ")}</p>

          <div className="reviews">
            <textarea placeholder="Leave a review..."></textarea>
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;