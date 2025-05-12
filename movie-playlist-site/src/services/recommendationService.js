import { supabase } from './supabaseClient';

const API_URL = process.env.REACT_APP_RECOMMENDATION_API_URL || 'http://localhost:8000';

// Check if Supabase is working
(async () => {
  try {
    const { data, error } = await supabase.from('movie').select('movie_id').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase is working:', data);
    }
  } catch (err) {
    console.error('Error checking Supabase connection:', err);
  }
})();

// Function to get recommendations for a user
export async function getRecommendations(userId, limit = 10) {
  try {
    console.log(userId);
    const response = await fetch(`${API_URL}/recommendations/${userId}?n=${limit}`);
    if (!response.ok) {
      console.error(response.statusText);
      throw new Error('Failed to fetch recommendations');
    }
    const recommendations = await response.json();
    return recommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

// Function to get similar movies based on a movie ID
export async function getSimilarMovies(movieId, limit = 10) {
  try {
    // Get the target movie's genres
    const { data: targetMovie, error: targetError } = await supabase
      .from('movie_genre')
      .select('genre_id')
      .eq('movie_id', movieId);

    if (targetError) throw targetError;
    if (!targetMovie.length) return [];

    // Get all movies with their genres
    const { data: movies, error: moviesError } = await supabase
      .from('movie')
      .select('movie_id, title, vote_average')
      .neq('movie_id', movieId);

    if (moviesError) throw moviesError;

    // Get genres for all movies
    const { data: allGenres, error: genresError } = await supabase
      .from('movie_genre')
      .select('movie_id, genre_id');

    if (genresError) throw genresError;

    // Calculate similarity based on genre overlap
    const similarMovies = movies.map(movie => {
      const movieGenres = allGenres
        .filter(g => g.movie_id === movie.movie_id)
        .map(g => g.genre_id);
      
      const genreOverlap = targetMovie
        .filter(g => movieGenres.includes(g.genre_id))
        .length;
      
      // Ensure the returned object uses movie.movie_id instead of movie.id
      return {
        movie_id: movie.movie_id,
        title: movie.title,
        vote_average: movie.vote_average,
        similarity: genreOverlap
      };
    });

    // Sort by similarity and rating
    return similarMovies
      .sort((a, b) => {
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity;
        }
        return b.vote_average - a.vote_average;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting similar movies:', error);
    return [];
  }
}

// Function to record a movie watch
export async function recordMovieWatch(userId, movieId) {
  try {
    // Record in Supabase
    const { error: supabaseError } = await supabase
      .from('watched_movies')
      .insert({
        user_id: userId,
        movie_id: movieId,
        watch_date: new Date().toISOString()
      });

    if (supabaseError) throw supabaseError;

    // Record in recommendation service
    const response = await fetch(`${API_URL}/record-watch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, movie_id: movieId }),
    });

    if (!response.ok) {
      console.error('Failed to record watch in recommendation service');
    }

    return true;
  } catch (error) {
    console.error('Error recording movie watch:', error);
    return false;
  }
}