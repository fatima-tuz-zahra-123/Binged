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
    
    // Compare liked movies
    const myLiked = new Set(currentUser.likedMovies.map(m => m.id));
    const theirLiked = new Set(otherUser.likedMovies.map(m => m.id));
    
    // Intersection of liked movies
    const commonLikes = [...myLiked].filter(id => theirLiked.has(id));
    
    // Calculate compatibility percentage (simplified)
    const totalMovies = new Set([...myLiked, ...theirLiked]);
    const compatibilityScore = totalMovies.size > 0 
      ? Math.round((commonLikes.length / totalMovies.size) * 100)
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
        updateProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the auth context
export const useUser = () => useContext(UserContext);

export default UserProvider;