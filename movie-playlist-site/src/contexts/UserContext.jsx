import React, { createContext, useState, useContext, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Initialize user state from localStorage if available
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  
  const [friends, setFriends] = useState(() => {
    const savedFriends = localStorage.getItem('friends');
    return savedFriends ? JSON.parse(savedFriends) : [];
  });

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  // Register new user
  const register = (username, email, password) => {
    // Check if username or email already exists
    const userExists = users.some(
      user => user.username === username || user.email === email
    );
    
    if (userExists) {
      return { success: false, message: 'Username or email already exists' };
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password, // In a real app, you would hash this password!
      favoriteGenres: [],
      watchedMovies: [],
      likedMovies: [],
      playlists: []
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  // Login user
  const login = (email, password) => {
    const user = users.find(
      user => user.email === email && user.password === password
    );
    
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    
    return { success: false, message: 'Invalid email or password' };
  };

  // Logout user
  const logout = () => {
    setCurrentUser(null);
  };

  // Add friend connection
  const addFriend = (friendId) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    // Check if friendship already exists
    const friendshipExists = friends.some(
      f => (f.user1Id === currentUser.id && f.user2Id === friendId) ||
           (f.user1Id === friendId && f.user2Id === currentUser.id)
    );
    
    if (friendshipExists) {
      return { success: false, message: 'Already connected' };
    }
    
    const newFriend = {
      id: Date.now().toString(),
      user1Id: currentUser.id,
      user2Id: friendId,
      status: 'pending', // Can be 'pending', 'accepted', 'rejected'
      createdAt: new Date().toISOString()
    };
    
    setFriends([...friends, newFriend]);
    return { success: true, friendship: newFriend };
  };

  // Accept friend request
  const acceptFriendRequest = (friendshipId) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    const updatedFriends = friends.map(f => {
      if (f.id === friendshipId && f.user2Id === currentUser.id) {
        return { ...f, status: 'accepted' };
      }
      return f;
    });
    
    setFriends(updatedFriends);
    return { success: true };
  };

  // Calculate movie taste compatibility with another user
  const calculateBlendCompatibility = (userId) => {
    if (!currentUser) return 0;
    
    const otherUser = users.find(user => user.id === userId);
    if (!otherUser) return 0;
    
    // Compare liked movies - safely handle missing arrays with default empty arrays
    const myLiked = new Set((currentUser.likedMovies || []).map(m => m.id));
    const theirLiked = new Set((otherUser.likedMovies || []).map(m => m.id));
    
    // Get movie IDs from playlists
    const myPlaylistMovies = new Set();
    const theirPlaylistMovies = new Set();
    
    // Extract movie IDs from current user's playlists
    if (currentUser.playlists && currentUser.playlists.length > 0) {
      currentUser.playlists.forEach(playlist => {
        if (playlist.movies && playlist.movies.length > 0) {
          playlist.movies.forEach(movie => {
            if (movie && movie.id) {
              myPlaylistMovies.add(movie.id);
            }
          });
        }
      });
    }
    
    // Extract movie IDs from other user's playlists
    if (otherUser.playlists && otherUser.playlists.length > 0) {
      otherUser.playlists.forEach(playlist => {
        if (playlist.movies && playlist.movies.length > 0) {
          playlist.movies.forEach(movie => {
            if (movie && movie.id) {
              theirPlaylistMovies.add(movie.id);
            }
          });
        }
      });
    }
    
    // Combine liked movies with playlist movies
    const allMyMovies = new Set([...myLiked, ...myPlaylistMovies]);
    const allTheirMovies = new Set([...theirLiked, ...theirPlaylistMovies]);
    
    // Intersection of all movies (common movies)
    const commonMovies = [...allMyMovies].filter(id => allTheirMovies.has(id));
    
    // Calculate compatibility percentage
    const totalUniqueMovies = new Set([...allMyMovies, ...allTheirMovies]);
    
    const movieOverlapScore = totalUniqueMovies.size > 0 
      ? Math.round((commonMovies.length / totalUniqueMovies.size) * 100)
      : 0;
    
    // Calculate genre match percentage (50% movie overlap, 50% genre match)
    const genreMatchScore = calculateGenreMatchPercentage(currentUser.id, userId);
    
    // Weighted average of both scores
    return Math.round((movieOverlapScore * 0.5) + (genreMatchScore * 0.5));
  };

  // Get active friends (accepted status)
  const getActiveFriends = () => {
    if (!currentUser) return [];
    
    return friends
      .filter(f => 
        f.status === 'accepted' && 
        (f.user1Id === currentUser.id || f.user2Id === currentUser.id)
      )
      .map(f => {
        const friendId = f.user1Id === currentUser.id ? f.user2Id : f.user1Id;
        const friendUser = users.find(u => u.id === friendId);
        
        if (friendUser) {
          return {
            ...friendUser,
            compatibility: calculateBlendCompatibility(friendUser.id)
          };
        }
        
        return null;
      })
      .filter(Boolean);
  };

  // Get friend requests
  const getFriendRequests = () => {
    if (!currentUser) return [];
    
    return friends
      .filter(f => 
        f.status === 'pending' && 
        f.user2Id === currentUser.id
      )
      .map(f => {
        const senderUser = users.find(u => u.id === f.user1Id);
        
        if (senderUser) {
          return {
            friendshipId: f.id,
            user: senderUser
          };
        }
        
        return null;
      })
      .filter(Boolean);
  };

  // Update user profile
  const updateProfile = (updates) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    const updatedUser = { ...currentUser, ...updates };
    
    // Update in current user
    setCurrentUser(updatedUser);
    
    // Update in users array
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? updatedUser : u
    );
    
    setUsers(updatedUsers);
    return { success: true, user: updatedUser };
  };

  // Add to or remove from default playlists (like "Liked" playlist)
  const addToDefaultPlaylist = (movie, playlistName, add = true) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    
    // Make a copy of the current user
    const userCopy = { ...currentUser };
    
    // Ensure playlists array exists
    if (!userCopy.playlists) {
      userCopy.playlists = [];
    }
    
    // Find or create the default playlist
    let defaultPlaylist = userCopy.playlists.find(p => p.name === playlistName);
    
    if (!defaultPlaylist) {
      defaultPlaylist = {
        id: Date.now().toString(),
        name: playlistName,
        description: `Your ${playlistName.toLowerCase()} movies`,
        isSystem: true,
        createdAt: new Date().toISOString(),
        movies: []
      };
      userCopy.playlists.push(defaultPlaylist);
    } else if (!defaultPlaylist.movies) {
      defaultPlaylist.movies = [];
    }
    
    // Add or remove the movie
    if (add) {
      // Check if movie already exists in the playlist
      const movieExists = defaultPlaylist.movies.some(m => m.id === movie.id);
      if (!movieExists) {
        // Add the movie (with simplified movie object to reduce storage size)
        defaultPlaylist.movies.push({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          addedAt: new Date().toISOString()
        });
      }
    } else {
      // Remove the movie
      defaultPlaylist.movies = defaultPlaylist.movies.filter(m => m.id !== movie.id);
    }
    
    // Update the user in state
    setCurrentUser(userCopy);
    
    // Update the user in users array
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? userCopy : u
    );
    
    setUsers(updatedUsers);
    
    return { success: true };
  };

  // Calculate taste profile based on genres in watched and liked movies
  const calculateUserTasteProfile = (userId = null) => {
    const user = userId ? users.find(u => u.id === userId) : currentUser;
    if (!user || !user.playlists) return {};
    
    // Initialize counters for each genre
    const genreCounts = {};
    let totalGenreInstances = 0;
    
    // Function to process a movie and count its genres
    const processMovie = (movie) => {
      if (!movie.genre_ids && !movie.genres) return;
      
      // Handle both genre_ids array and genres object array
      const genres = movie.genre_ids || (movie.genres ? movie.genres.map(g => g.id) : []);
      
      genres.forEach(genreId => {
        const genreName = getGenreName(genreId);
        if (genreName) {
          genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
          totalGenreInstances++;
        }
      });
    };
    
    // Process watched and liked playlists with higher weight
    user.playlists.forEach(playlist => {
      if (!playlist.movies) return;
      
      const isWatched = playlist.name === 'Watched';
      const isLiked = playlist.name === 'Liked';
      
      playlist.movies.forEach(movie => {
        // Process regular playlist movies
        processMovie(movie);
        
        // Give extra weight to watched and liked movies
        if (isWatched || isLiked) {
          processMovie(movie); // Process again for extra weight
        }
        
        // Give even more weight to movies that are both watched and liked
        if (isWatched && user.playlists.some(p => 
          p.name === 'Liked' && p.movies && p.movies.some(m => m.id === movie.id))
        ) {
          processMovie(movie); // Process a third time for extra-extra weight
        }
      });
    });
    
    // Calculate percentages
    const profile = {};
    if (totalGenreInstances > 0) {
      Object.keys(genreCounts).forEach(genre => {
        profile[genre] = Math.round((genreCounts[genre] / totalGenreInstances) * 100);
      });
    }
    
    return profile;
  };

  // Calculate genre match percentage between current user and another user
  const calculateGenreMatchPercentage = (userId) => {
    if (!currentUser) return 0;
    
    const myProfile = calculateUserTasteProfile();
    const otherProfile = calculateUserTasteProfile(userId);
    
    // Find all unique genres between both users
    const allGenres = new Set([
      ...Object.keys(myProfile),
      ...Object.keys(otherProfile)
    ]);
    
    if (allGenres.size === 0) return 0;
    
    let totalOverlap = 0;
    let totalPossible = 0;
    
    allGenres.forEach(genre => {
      const myValue = myProfile[genre] || 0;
      const otherValue = otherProfile[genre] || 0;
      
      // Add the minimum (the overlap) to the total
      totalOverlap += Math.min(myValue, otherValue);
      
      // Add the maximum (the possible) to the total
      totalPossible += Math.max(myValue, otherValue);
    });
    
    // Calculate percentage based on overlap
    return totalPossible > 0 ? Math.round((totalOverlap / totalPossible) * 100) : 0;
  };
  
  // Get movie recommendations based on shared tastes with a friend
  const getSharedTasteRecommendations = (friendId) => {
    if (!currentUser) return [];
    
    const friend = users.find(user => user.id === friendId);
    if (!friend || !friend.playlists) return [];
    
    const myProfile = calculateUserTasteProfile();
    const friendProfile = calculateUserTasteProfile(friendId);
    
    // Find common strong genres (both users have at least 10% interest)
    const commonGenres = Object.keys(myProfile).filter(genre => 
      myProfile[genre] >= 10 && friendProfile[genre] >= 10
    );
    
    // Get genre IDs from names
    const commonGenreIds = commonGenres.map(getGenreId).filter(Boolean);
    
    // If no common genres, use friend's top genres
    const fallbackGenreIds = [];
    if (commonGenreIds.length === 0) {
      const topFriendGenres = Object.entries(friendProfile)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => getGenreId(genre))
        .filter(Boolean);
      
      fallbackGenreIds.push(...topFriendGenres);
    }
    
    // Use either common genres or fallback to friend's top genres
    const genresToUse = commonGenreIds.length > 0 ? commonGenreIds : fallbackGenreIds;
    
    // Get all movies from friend's playlists that I haven't watched
    const myWatchedIds = new Set();
    const recommendations = [];
    
    // Get all my watched movie IDs
    if (currentUser.playlists) {
      currentUser.playlists.forEach(playlist => {
        if (playlist.movies) {
          playlist.movies.forEach(movie => {
            myWatchedIds.add(movie.id);
          });
        }
      });
    }
    
    // Find movies from friend's playlists that match target genres
    if (friend.playlists) {
      friend.playlists.forEach(playlist => {
        if (playlist.movies) {
          playlist.movies.forEach(movie => {
            // Skip if I've already watched this movie
            if (myWatchedIds.has(movie.id)) return;
            
            // Check if movie has any of our target genres
            const movieGenreIds = movie.genre_ids || 
              (movie.genres ? movie.genres.map(g => g.id) : []);
            
            const hasTargetGenre = movieGenreIds.some(genreId => 
              genresToUse.includes(genreId)
            );
            
            if (hasTargetGenre || genresToUse.length === 0) {
              // Add to recommendations if not already added
              if (!recommendations.some(rec => rec.id === movie.id)) {
                recommendations.push(movie);
              }
            }
          });
        }
      });
    }
    
    // If we still don't have recommendations, include some of friend's highest rated movies
    if (recommendations.length === 0 && friend.playlists) {
      const allFriendMovies = [];
      
      friend.playlists.forEach(playlist => {
        if (playlist.movies) {
          playlist.movies.forEach(movie => {
            if (!myWatchedIds.has(movie.id)) {
              allFriendMovies.push(movie);
            }
          });
        }
      });
      
      // Get top rated movies from friend
      const topRatedMovies = allFriendMovies
        .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
        .slice(0, 6);
        
      recommendations.push(...topRatedMovies);
    }
    
    // Sort by vote average (highest rated first)
    return recommendations
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 6); // Limit to 6 recommendations
  };
  
  // Get personalized movie recommendations based on user's taste profile
  const getPersonalizedRecommendations = () => {
    if (!currentUser) return [];
    
    // Get the user's taste profile
    const tasteProfile = calculateUserTasteProfile();
    
    // Get the top 3 genres from the user's profile
    const topGenres = Object.entries(tasteProfile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);
    
    // Convert genre names to IDs
    const topGenreIds = topGenres.map(getGenreId).filter(Boolean);
    
    // Create a set of already watched movies to avoid recommending them
    const watchedMovieIds = new Set();
    
    if (currentUser.playlists) {
      currentUser.playlists.forEach(playlist => {
        if (playlist.movies) {
          playlist.movies.forEach(movie => {
            watchedMovieIds.add(movie.id);
          });
        }
      });
    }
    
    // Collect potential recommendations from other users' playlists
    const allRecommendations = [];
    
    users.forEach(user => {
      if (user.id === currentUser.id) return; // Skip current user
      
      if (user.playlists) {
        user.playlists.forEach(playlist => {
          if (playlist.movies) {
            playlist.movies.forEach(movie => {
              // Skip if already watched
              if (watchedMovieIds.has(movie.id)) return;
              
              // Check if the movie matches any of the top genres
              const movieGenreIds = movie.genre_ids || 
                (movie.genres ? movie.genres.map(g => g.id) : []);
              
              const matchesTopGenre = movieGenreIds.some(genreId => 
                topGenreIds.includes(genreId)
              );
              
              if (matchesTopGenre) {
                // Add to recommendations if not already in the list
                if (!allRecommendations.some(rec => rec.id === movie.id)) {
                  allRecommendations.push({
                    ...movie,
                    recommendationScore: calculateRecommendationScore(movie, tasteProfile)
                  });
                }
              }
            });
          }
        });
      }
    });
    
    // Sort by recommendation score and return the top 8
    return allRecommendations
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 8);
  };
  
  // Calculate a recommendation score based on genre match and rating
  const calculateRecommendationScore = (movie, tasteProfile) => {
    let score = movie.vote_average || 5; // Base score from movie rating
    
    // Get movie genres
    const movieGenres = movie.genres ? 
      movie.genres.map(g => g.name) : 
      (movie.genre_ids || []).map(id => getGenreName(id)).filter(Boolean);
    
    // Boost score based on genre match percentage
    movieGenres.forEach(genre => {
      if (tasteProfile[genre]) {
        // Add a percentage of the user's interest in this genre
        score += (tasteProfile[genre] / 100) * 3; // Up to 3 points boost per genre
      }
    });
    
    return score;
  };

  // Helper function to convert genre ID to name
  const getGenreName = (genreId) => {
    const genreMap = {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      53: 'Thriller',
      10752: 'War',
      37: 'Western'
    };
    
    return genreMap[genreId];
  };
  
  // Helper function to convert genre name to ID
  const getGenreId = (genreName) => {
    const genreMap = {
      'Action': 28,
      'Adventure': 12,
      'Animation': 16,
      'Comedy': 35,
      'Crime': 80,
      'Documentary': 99,
      'Drama': 18,
      'Family': 10751,
      'Fantasy': 14,
      'History': 36,
      'Horror': 27,
      'Music': 10402,
      'Mystery': 9648,
      'Romance': 10749,
      'Science Fiction': 878,
      'Thriller': 53,
      'War': 10752,
      'Western': 37
    };
    
    return genreMap[genreName];
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        friends,
        register,
        login,
        logout,
        addFriend,
        acceptFriendRequest,
        getActiveFriends,
        getFriendRequests,
        calculateBlendCompatibility,
        updateProfile,
        addToDefaultPlaylist,
        calculateUserTasteProfile,
        calculateGenreMatchPercentage,
        getSharedTasteRecommendations,
        getPersonalizedRecommendations
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the auth context
export const useUser = () => useContext(UserContext);

export default UserProvider;