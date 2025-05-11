import { supabase } from './supabaseClient';

// Movies CRUD operations
export const moviesService = {
  // Create a new movie
  async createMovie(movieData) {
    const { data, error } = await supabase
      .from('movies')
      .insert([movieData]);
    
    if (error) throw error;
    return data;
  },

  // Get all movies
  async getMovies() {
    const { data, error } = await supabase
      .from('movies')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get a specific movie by id
  async getMovieById(id) {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a movie
  async updateMovie(id, updates) {
    const { data, error } = await supabase
      .from('movies')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    return data;
  },

  // Delete a movie
  async deleteMovie(id) {
    const { data, error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }
};

// Playlists CRUD operations
export const playlistsService = {
  // Create a new playlist
  async createPlaylist(playlistData) {
    const { data, error } = await supabase
      .from('playlists')
      .insert([playlistData]);
    
    if (error) throw error;
    return data;
  },

  // Get all playlists
  async getPlaylists() {
    const { data, error } = await supabase
      .from('playlists')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get a specific playlist by id
  async getPlaylistById(id) {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a playlist
  async updatePlaylist(id, updates) {
    const { data, error } = await supabase
      .from('playlists')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    return data;
  },

  // Delete a playlist
  async deletePlaylist(id) {
    const { data, error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }
};

// Playlist-Movies relation operations
export const playlistMoviesService = {
  // Add a movie to a playlist
  async addMovieToPlaylist(playlistId, movieId) {
    const { data, error } = await supabase
      .from('playlist_movies')
      .insert([{ playlist_id: playlistId, movie_id: movieId }]);
    
    if (error) throw error;
    return data;
  },

  // Get all movies in a playlist
  async getMoviesInPlaylist(playlistId) {
    const { data, error } = await supabase
      .from('playlist_movies')
      .select('movies(*)')
      .eq('playlist_id', playlistId);
    
    if (error) throw error;
    return data.map(item => item.movies);
  },

  // Remove a movie from a playlist
  async removeMovieFromPlaylist(playlistId, movieId) {
    const { data, error } = await supabase
      .from('playlist_movies')
      .delete()
      .match({ playlist_id: playlistId, movie_id: movieId });
    
    if (error) throw error;
    return data;
  }
};

// Database operations using Supabase
// Playlist operations
export async function createPlaylist(userId, name, description = '') {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: userId,
        name,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;
    return { success: true, playlist: data[0] };
  } catch (error) {
    console.error('Error creating playlist:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserPlaylists(userId) {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { success: true, playlists: data };
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return { success: false, error: error.message };
  }
}

export async function getPlaylistDetails(playlistId) {
  try {
    // Get playlist details
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .single();

    if (playlistError) throw playlistError;

    // Get movies in playlist
    const { data: movies, error: moviesError } = await supabase
      .from('playlist_movies')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('added_at', { ascending: false });

    if (moviesError) throw moviesError;

    return { 
      success: true, 
      playlist: { ...playlist, movies: movies || [] } 
    };
  } catch (error) {
    console.error('Error fetching playlist details:', error);
    return { success: false, error: error.message };
  }
}

export async function addMovieToPlaylist(playlistId, movieData) {
  try {
    // First check if movie already exists in playlist
    const { data: existing, error: checkError } = await supabase
      .from('playlist_movies')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('movie_id', movieData.id)
      .maybeSingle();

    if (checkError) throw checkError;

    // If movie already exists, return early
    if (existing) {
      return { 
        success: false, 
        error: 'Movie already exists in this playlist' 
      };
    }

    // Add movie to playlist
    const { data, error } = await supabase
      .from('playlist_movies')
      .insert({
        playlist_id: playlistId,
        movie_id: movieData.id,
        title: movieData.title,
        poster_path: movieData.poster_path,
        overview: movieData.overview,
        release_date: movieData.release_date,
        vote_average: movieData.vote_average,
        added_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    // Update playlist last modified time
    await supabase
      .from('playlists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', playlistId);

    return { success: true, movie: data[0] };
  } catch (error) {
    console.error('Error adding movie to playlist:', error);
    return { success: false, error: error.message };
  }
}

export async function removeMovieFromPlaylist(playlistId, movieId) {
  try {
    const { error } = await supabase
      .from('playlist_movies')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('movie_id', movieId);

    if (error) throw error;

    // Update playlist last modified time
    await supabase
      .from('playlists')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', playlistId);

    return { success: true };
  } catch (error) {
    console.error('Error removing movie from playlist:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePlaylist(playlistId) {
  try {
    // Delete all movies in the playlist first
    const { error: moviesError } = await supabase
      .from('playlist_movies')
      .delete()
      .eq('playlist_id', playlistId);

    if (moviesError) throw moviesError;

    // Delete the playlist
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return { success: false, error: error.message };
  }
}

// User operations
export async function updateUserProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from('user')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) throw error;
    return { success: true, user: data[0] };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: error.message };
  }
}

// Social features
export async function followUser(userId, followedUserId) {
  try {
    const { data, error } = await supabase
      .from('user_connections')
      .insert({
        user_id: userId,
        followed_user_id: followedUserId,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;
    return { success: true, connection: data[0] };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error: error.message };
  }
}

export async function unfollowUser(userId, followedUserId) {
  try {
    const { error } = await supabase
      .from('user_connections')
      .delete()
      .eq('user_id', userId)
      .eq('followed_user_id', followedUserId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserFollowers(userId) {
  try {
    const { data, error } = await supabase
      .from('user_connections')
      .select(`
        user_id,
        user:user_id (username, full_name)
      `)
      .eq('followed_user_id', userId);

    if (error) throw error;
    return { success: true, followers: data };
  } catch (error) {
    console.error('Error fetching user followers:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserFollowing(userId) {
  try {
    const { data, error } = await supabase
      .from('user_connections')
      .select(`
        followed_user_id,
        followed_user:followed_user_id (username, full_name)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, following: data };
  } catch (error) {
    console.error('Error fetching user following:', error);
    return { success: false, error: error.message };
  }
}