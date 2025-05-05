import React, { useState } from "react";
import { searchMovies } from "../services/tmdbService";
import MovieCard from "../components/MovieCard";

const Discover = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const data = await searchMovies(query);
    setResults(data);
  };

  return (
    <div className="discover-page">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search all movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

      <div className="movie-grid">
        {results.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default Discover;