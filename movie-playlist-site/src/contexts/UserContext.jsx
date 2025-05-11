import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const sessionTimeout = useRef(null);
  const isNavigating = useRef(false);
  
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  
  const [friends, setFriends] = useState(() => {
    const savedFriends = localStorage.getItem('friends');
    return savedFriends ? JSON.parse(savedFriends) : [];
  });

  // Function to clean up all user data
  const cleanupUserData = useCallback(() => {
    if (!mounted.current) return;
    
    // Clear all state
    setCurrentUser(null);
    setSession(null);
    
    // Clear all localStorage items
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('userPlaylists');
    localStorage.removeItem('userConnections');
    localStorage.removeItem('friends');
    
    // Remove any active Supabase subscriptions
    supabase.removeAllChannels();
  }, []);

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (event, session) => {
    if (!mounted.current) return;

    // Clear any existing timeout
    if (sessionTimeout.current) {
      clearTimeout(sessionTimeout.current);
    }

    // Set session with a small delay to prevent rapid state changes
    sessionTimeout.current = setTimeout(() => {
      if (mounted.current) {
        if (event === 'SIGNED_OUT') {
          cleanupUserData();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          localStorage.setItem('sessionExpiry', new Date(session.expires_at).toISOString());
        }
        
        // Only update session if we're not already navigating
        if (!isNavigating.current) {
          setSession(session);
        }
      }
    }, 100);
  }, [cleanupUserData]);

  // Check for existing session and set up auth listener
  useEffect(() => {
    mounted.current = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted.current) {
          // Set initial session with a small delay
          sessionTimeout.current = setTimeout(() => {
            if (mounted.current && !isNavigating.current) {
              setSession(currentSession);
              setLoading(false);
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted.current) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted.current = false;
      if (sessionTimeout.current) {
        clearTimeout(sessionTimeout.current);
      }
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (!mounted.current) return;
    
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    if (!mounted.current) return;
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (!mounted.current) return;
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  // Social functions
  const getActiveFriends = useCallback(() => {
    if (!currentUser) return [];
    return friends.filter(friend => 
      friend.status === 'accepted' && 
      (friend.user_id === currentUser.id || friend.friend_id === currentUser.id)
    ).map(friend => {
      const friendId = friend.user_id === currentUser.id ? friend.friend_id : friend.user_id;
      const friendUser = users.find(u => u.id === friendId);
      return {
        ...friend,
        user: friendUser,
        compatibility: calculateCompatibility(friendUser)
      };
    });
  }, [currentUser, friends, users]);

  const getFriendRequests = useCallback(() => {
    if (!currentUser) return [];
    return friends.filter(friend => 
      friend.status === 'pending' && 
      friend.friend_id === currentUser.id
    ).map(friend => {
      const requestingUser = users.find(u => u.id === friend.user_id);
      return {
        ...friend,
        user: requestingUser
      };
    });
  }, [currentUser, friends, users]);

  const addFriend = useCallback(async (userId) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };

    try {
      const { data, error } = await supabase
        .from('user_connections')
        .insert([
          {
            user_id: currentUser.id,
            friend_id: userId,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      const newFriend = {
        id: data[0].id,
        user_id: currentUser.id,
        friend_id: userId,
        status: 'pending'
      };

      setFriends(prev => [...prev, newFriend]);
      return { success: true, data: newFriend };
    } catch (error) {
      console.error('Error adding friend:', error);
      return { success: false, message: error.message };
    }
  }, [currentUser]);

  const acceptFriendRequest = useCallback(async (friendshipId) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };

    try {
      const { data, error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .eq('friend_id', currentUser.id);

      if (error) throw error;

      setFriends(prev => 
        prev.map(friend => 
          friend.id === friendshipId 
            ? { ...friend, status: 'accepted' }
            : friend
        )
      );

      return { success: true, data };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return { success: false, message: error.message };
    }
  }, [currentUser]);

  // Helper function to calculate compatibility between users
  const calculateCompatibility = useCallback((friendUser) => {
    if (!currentUser || !friendUser) return 0;
    
    // Get user preferences
    const currentUserPrefs = currentUser.favoriteGenres || [];
    const friendUserPrefs = friendUser.favoriteGenres || [];
    
    // Calculate genre overlap
    const commonGenres = currentUserPrefs.filter(genre => 
      friendUserPrefs.includes(genre)
    );
    
    // Calculate compatibility score (0-100)
    const totalGenres = new Set([...currentUserPrefs, ...friendUserPrefs]).size;
    const compatibilityScore = totalGenres > 0 
      ? Math.round((commonGenres.length / totalGenres) * 100)
      : 0;
    
    return compatibilityScore;
  }, [currentUser]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clean up all user data
      cleanupUserData();
      
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, try to clean up
      cleanupUserData();
      return { success: false, error: error.message };
    }
  }, [cleanupUserData]);

  const value = {
    currentUser,
    session,
    loading,
    users,
    friends,
    setCurrentUser,
    logout,
    getActiveFriends,
    getFriendRequests,
    addFriend,
    acceptFriendRequest,
    isNavigating
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};