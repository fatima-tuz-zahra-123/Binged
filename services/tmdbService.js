// services/tmdbService.js
import axios from "axios";

const apiKey = import.meta.env.VITE_TMDB_API_KEY;

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: apiKey,
    language: "en-US",
  },
});

// 🟢 Get movies that are now playing in theatres
export const fetchNowPlayingMovies = async () => {
  const response = await tmdb.get("/movie/now_playing");
  return response.data.results;
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
export const searchMovies = async (query) => {
  const response = await tmdb.get("/search/movie", {
    params: { query },
  });
  return response.data.results;
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