import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useUser } from '../contexts/UserContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentUser } = useUser();
  const hasNavigated = useRef(false);

  // Store subscription references in component state
  const [subscriptions, setSubscriptions] = useState({
    playlists: null,
    social: null
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    if (hasNavigated.current) return;

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError || !authData.session) {
        throw new Error("Invalid email or password.");
      }

      // 2. Fetch user profile from custom user table
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('id, username, full_name, email')
        .ilike('email', email)
        .limit(1);

      if (userError || !userData) {
        throw new Error("User profile not found.");
      }

      const user = userData[0];

      // 3. Store user profile and set current user
      const userProfile = {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      setCurrentUser(userProfile);

      // 4. Fetch playlists
      const { data: playlists, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id);

      if (!playlistsError && playlists) {
        localStorage.setItem('userPlaylists', JSON.stringify(playlists));
      }

      // 5. Fetch social connections
      const { data: connections, error: connectionsError } = await supabase
        .from('user_connections')
        .select('*')
        .eq('user_id', user.id);

      if (!connectionsError && connections) {
        localStorage.setItem('userConnections', JSON.stringify(connections));
      }

      // 6. Set up real-time subscriptions
      const playlistsSubscription = supabase
        .channel('playlists_changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'playlists',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const currentPlaylists = JSON.parse(localStorage.getItem('userPlaylists') || '[]');
            if (payload.eventType === 'INSERT') {
              localStorage.setItem('userPlaylists', JSON.stringify([...currentPlaylists, payload.new]));
            } else if (payload.eventType === 'UPDATE') {
              const updatedPlaylists = currentPlaylists.map(playlist =>
                playlist.id === payload.new.id ? payload.new : playlist
              );
              localStorage.setItem('userPlaylists', JSON.stringify(updatedPlaylists));
            } else if (payload.eventType === 'DELETE') {
              const filteredPlaylists = currentPlaylists.filter(playlist =>
                playlist.id !== payload.old.id
              );
              localStorage.setItem('userPlaylists', JSON.stringify(filteredPlaylists));
            }
          }
        )
        .subscribe();

      const socialSubscription = supabase
        .channel('social_changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_connections',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const currentConnections = JSON.parse(localStorage.getItem('userConnections') || '[]');
            if (payload.eventType === 'INSERT') {
              localStorage.setItem('userConnections', JSON.stringify([...currentConnections, payload.new]));
            } else if (payload.eventType === 'UPDATE') {
              const updatedConnections = currentConnections.map(connection =>
                connection.id === payload.new.id ? payload.new : connection
              );
              localStorage.setItem('userConnections', JSON.stringify(updatedConnections));
            } else if (payload.eventType === 'DELETE') {
              const filteredConnections = currentConnections.filter(connection =>
                connection.id !== payload.old.id
              );
              localStorage.setItem('userConnections', JSON.stringify(filteredConnections));
            }
          }
        )
        .subscribe();

      setSubscriptions({
        playlists: playlistsSubscription,
        social: socialSubscription
      });

      // Navigate to profile
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        const params = new URLSearchParams(location.search);
        const from = params.get('from');
        navigate(from || '/profile', { replace: true });
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up subscriptions on component unmount
  useEffect(() => {
    return () => {
      if (subscriptions.playlists) {
        supabase.removeChannel(subscriptions.playlists);
      }
      if (subscriptions.social) {
        supabase.removeChannel(subscriptions.social);
      }
      hasNavigated.current = false;
    };
  }, [subscriptions]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome back!</h2>
          <p>Login to continue your movie journey</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-control">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-control">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          
          <button 
            className="auth-button" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 