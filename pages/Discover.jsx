import React, { useState } from "react";
import { searchMovies } from "../services/tmdbService";
import MovieCard from "../components/MovieCard";
import { useTheme } from "../src/contexts/ThemeContext";

const Discover = () => {
  const { themeColors } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const data = await searchMovies(query);
    setResults(data);
  };

  // Apply theme-based styling
  const pageStyle = {
    backgroundColor: themeColors.background,
    color: themeColors.text,
    padding: "2rem",
  };

  const formStyle = {
    marginBottom: "2rem",
    display: "flex",
    gap: "1rem",
  };

  const inputStyle = {
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: `1px solid ${themeColors.border}`,
    backgroundColor: themeColors.surface,
    color: themeColors.text,
    flexGrow: 1,
    fontSize: "1rem",
  };

  const buttonStyle = {
    padding: "0.75rem 1.5rem",
    backgroundColor: themeColors.primary,
    color: themeColors.surface,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "all 0.2s ease",
  };

  const emptyStyle = {
    textAlign: "center",
    padding: "2rem",
    color: themeColors.textSecondary,
  };

  return (
    <div className="discover-page" style={pageStyle}>
      <form onSubmit={handleSearch} style={formStyle}>
        <input
          type="text"
          placeholder="Search all movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>🔍</button>
      </form>

      <div className="movie-grid">
        {results.length > 0 ? (
          results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} showAddToPlaylist />
          ))
        ) : (
          <p style={emptyStyle}>Search for movies to discover new titles!</p>
        )}
      </div>
    </div>
  );
};

export default Discover;