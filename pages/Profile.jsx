import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../src/contexts/UserContext';
import { useTheme } from '../src/contexts/ThemeContext';
import './Profile.css';

const Profile = () => {
  const { currentUser, updateProfile, logout } = useUser();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    favoriteGenres: []
  });
  
  const [mode, setMode] = useState('view'); // 'view' or 'edit'
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalPlaylists: 0,
    totalFriends: 0
  });
  
  // Genres list
  const genres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", 
    "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance", 
    "Science Fiction", "Thriller", "War", "Western"
  ];
  
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        password: '',
        confirmPassword: '',
        bio: currentUser.bio || '',
        favoriteGenres: currentUser.favoriteGenres || []
      });
      
      // Calculate stats
      const totalMovies = (currentUser.watchedMovies || []).length + 
                        (currentUser.likedMovies || []).length;
      const totalPlaylists = (currentUser.playlists || []).length;
      const totalFriends = 0; // We would calculate friends count from context
      
      setStats({ totalMovies, totalPlaylists, totalFriends });
    }
  }, [currentUser]);
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleGenreToggle = (genre) => {
    setFormData(prev => {
      if (prev.favoriteGenres.includes(genre)) {
        return {
          ...prev,
          favoriteGenres: prev.favoriteGenres.filter(g => g !== genre)
        };
      } else {
        return {
          ...prev,
          favoriteGenres: [...prev.favoriteGenres, genre]
        };
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match'
      });
      return;
    }
    
    const updates = {
      username: formData.username,
      bio: formData.bio,
      favoriteGenres: formData.favoriteGenres
    };
    
    // Only include password in updates if it was changed
    if (formData.password) {
      updates.password = formData.password;
    }
    
    try {
      const result = updateProfile(updates);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully'
        });
        setMode('view');
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Failed to update profile'
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.'
      });
    }
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="page profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="profile-info">
          <h2>{currentUser.username}</h2>
          <p className="profile-email">{currentUser.email}</p>
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{stats.totalPlaylists}</span>
              <span className="stat-label">Playlists</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.totalMovies}</span>
              <span className="stat-label">Movies</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.totalFriends}</span>
              <span className="stat-label">Friends</span>
            </div>
          </div>
        </div>
      </div>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {mode === 'view' ? (
        <div className="profile-view">
          <div className="profile-section">
            <h3>About</h3>
            <p>{currentUser.bio || 'No bio added yet.'}</p>
          </div>
          
          <div className="profile-section">
            <h3>Favorite Genres</h3>
            <div className="genre-tags">
              {currentUser.favoriteGenres && currentUser.favoriteGenres.length > 0 ? 
                currentUser.favoriteGenres.map(genre => (
                  <span key={genre} className="genre-tag">{genre}</span>
                )) : 
                <p>No favorite genres selected yet.</p>
              }
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              className="button"
              onClick={() => setMode('edit')}
            >
              Edit Profile
            </button>
            <button 
              className="button button-secondary"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>
      ) : (
        <div className="profile-edit">
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-control">
              <label htmlFor="email">Email (cannot be changed)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
              />
            </div>
            
            <div className="form-control">
              <label htmlFor="password">Password (leave blank to keep current)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
            </div>
            
            <div className="form-control">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
              />
            </div>
            
            <div className="form-control">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                placeholder="Tell us about yourself and your movie tastes..."
              />
            </div>
            
            <div className="form-control">
              <label>Favorite Genres</label>
              <div className="genre-selector">
                {genres.map(genre => (
                  <div 
                    key={genre}
                    className={`genre-option ${formData.favoriteGenres.includes(genre) ? 'selected' : ''}`}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="profile-actions">
              <button 
                type="submit"
                className="button"
              >
                Save Changes
              </button>
              <button 
                type="button"
                className="button button-secondary"
                onClick={() => setMode('view')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;