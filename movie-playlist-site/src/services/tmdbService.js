// services/tmdbService.js
import axios from "axios";

// Import environment variables
const { REACT_APP_TMDB_API_KEY } = process.env;

// Direct API key for development - In production, use environment variables
const apiKey = REACT_APP_TMDB_API_KEY;
console.log("TMDB API Key loaded:", apiKey ? "Key is present" : "Key is missing");

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: apiKey,
    language: "en-US",
  },
});

// 🟢 Get movies that are now playing in theatres
export const fetchNowPlayingMovies = async () => {
  try {
    console.log("Fetching now playing movies from TMDB...");
    const response = await tmdb.get("/movie/now_playing");
    console.log(`Successfully fetched ${response.data.results?.length || 0} now playing movies`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching now playing movies:", error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    } : error.message);
    throw error;
  }
};

// 🟢 Get full movie details by ID
export const fetchMovieDetails = async (id) => {
  const response = await tmdb.get(`/movie/${id}`);
  return response.data;
};

// 🟢 Get credits (cast and crew) of a movie by ID
export const fetchMovieCredits = async (id) => {
  const response = await tmdb.get(`/movie/${id}/credits`);
  return response.data;
};

// 🟢 (Optional) Search for movies by query (for later use)
export const searchMovies = async (query, filters = {}) => {
  try {
    const params = { 
      query,
      include_adult: false,
      ...filters
    };
    
    const response = await tmdb.get('/search/movie', { params });
    return response.data.results;
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
};

// Get detailed movie information
export const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdb.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

// Get movie credits (cast and crew)
export const getMovieCredits = async (movieId) => {
  try {
    const response = await tmdb.get(`/movie/${movieId}/credits`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie credits:", error);
    throw error;
  }
};

// Get movie reviews
export const getMovieReviews = async (movieId) => {
  try {
    const response = await tmdb.get(`/movie/${movieId}/reviews`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie reviews:", error);
    throw error;
  }
};

// Get actor details
export const getPersonDetails = async (personId) => {
  try {
    const response = await tmdb.get(`/person/${personId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching person details:", error);
    throw error;
  }
};

// Get actor's movie credits
export const getPersonMovieCredits = async (personId) => {
  try {
    const response = await tmdb.get(`/person/${personId}/movie_credits`);
    return response.data;
  } catch (error) {
    console.error("Error fetching person movie credits:", error);
    throw error;
  }
};

// Get movie genres
export const getMovieGenres = async () => {
  try {
    const response = await tmdb.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error("Error fetching movie genres:", error);
    throw error;
  }
};

// Get top rated movies
export const fetchTopRatedMovies = async () => {
  try {
    const response = await tmdb.get('/movie/top_rated');
    return response.data.results;
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
    throw error;
  }
};

// Get popular movies
export const fetchPopularMovies = async () => {
  try {
    const response = await tmdb.get('/movie/popular');
    return response.data.results;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    throw error;
  }
};

// Get upcoming movies
export const fetchUpcomingMovies = async () => {
  try {
    const response = await tmdb.get('/movie/upcoming');
    return response.data.results;
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    throw error;
  }
};

// Discover movies with various filters
export const discoverMovies = async (filters = {}) => {
  try {
    const params = {
      include_adult: false,
      ...filters
    };
    
    const response = await tmdb.get('/discover/movie', { params });
    return response.data.results;
  } catch (error) {
    console.error("Error discovering movies:", error);
    throw error;
  }
};