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
    
    const compatibilityScore = totalUniqueMovies.size > 0 
      ? Math.round((commonMovies.length / totalUniqueMovies.size) * 100)
      : 0;
    
    return compatibilityScore;
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
        addToDefaultPlaylist
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the auth context
export const useUser = () => useContext(UserContext);

export default UserProvider;