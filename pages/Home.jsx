import React, { useEffect, useState } from 'react';
import { fetchNowPlayingMovies } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { useTheme } from '../src/contexts/ThemeContext';

import './Home.css';

const Home = () => {
  const { themeColors } = useTheme();
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const nowPlaying = await fetchNowPlayingMovies();
        setMovies(nowPlaying);
      } catch (err) {
        console.error('Failed to load movies:', err);
      }
    };

    loadMovies();
  }, []);

  const handleAddToPlaylist = (movie) => {
    // This will later connect to Supabase to save it
    console.log(`Add to playlist: ${movie.title}`);
    alert(`"${movie.title}" added to playlist!`);
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  // Apply theme-based styling
  const homeStyle = {
    backgroundColor: themeColors.background,
    color: themeColors.text,
  };

  const titleStyle = {
    color: themeColors.primary
  };

  return (
    <div className="home-page" style={homeStyle}>
      <h2 className="title" style={titleStyle}>Now Playing 🎬</h2>

      <SearchBar query={query} setQuery={setQuery} />

      <div className="movie-grid">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              showAddToPlaylist
              onAddToPlaylist={handleAddToPlaylist}
            />
          ))
        ) : (
          <p>No movies match your search.</p>
        )}
      </div>
    </div>
  );
};

export default Home;