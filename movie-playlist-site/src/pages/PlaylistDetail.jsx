import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import './PlaylistDetail.css';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { themeColors } = useTheme();
  const [playlist, setPlaylist] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        // Fetch playlist details
        const { data: playlistData, error: playlistError } = await supabase
          .from('playlists')
          .select('*')
          .eq('id', id)
          .single();

        if (playlistError) throw playlistError;

        // Check if user has access to this playlist
        if (playlistData.user_id !== currentUser.id && !playlistData.is_public) {
          throw new Error('You do not have access to this playlist');
        }

        setPlaylist(playlistData);

        // Fetch movies in the playlist
        const { data: moviesData, error: moviesError } = await supabase
          .from('playlist_movies')
          .select(`
            *,
            movies (*)
          `)
          .eq('playlist_id', id)
          .order('created_at', { ascending: false });

        if (moviesError) throw moviesError;

        setMovies(moviesData.map(item => item.movies));
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id && currentUser) {
      fetchPlaylist();
    }
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="playlist-detail-page" style={{ backgroundColor: themeColors.background }}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="playlist-detail-page" style={{ backgroundColor: themeColors.background }}>
        <div className="error-message" style={{ color: themeColors.error }}>
          {error}
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="playlist-detail-page" style={{ backgroundColor: themeColors.background }}>
        <div className="error-message" style={{ color: themeColors.error }}>
          Playlist not found
        </div>
      </div>
    );
  }

  return (
    <div className="playlist-detail-page" style={{ backgroundColor: themeColors.background }}>
      <div className="playlist-header" style={{ backgroundColor: themeColors.surface }}>
        <h1 style={{ color: themeColors.text }}>{playlist.name}</h1>
        <p style={{ color: themeColors.textSecondary }}>{playlist.description}</p>
        <div className="playlist-meta">
          <span style={{ color: themeColors.textSecondary }}>
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
          </span>
          <span style={{ color: themeColors.textSecondary }}>
            Created by {playlist.user_id === currentUser.id ? 'you' : 'another user'}
          </span>
        </div>
      </div>

      <div className="movies-grid">
        {movies.map(movie => (
          <div 
            key={movie.id} 
            className="movie-card"
            style={{ backgroundColor: themeColors.surface }}
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title}
              className="movie-poster"
            />
            <div className="movie-info">
              <h3 style={{ color: themeColors.text }}>{movie.title}</h3>
              <p style={{ color: themeColors.textSecondary }}>
                {new Date(movie.release_date).getFullYear()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistDetail; 