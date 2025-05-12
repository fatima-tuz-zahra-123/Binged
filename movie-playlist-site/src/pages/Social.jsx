import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import './Social.css';

const Social = () => {
  const { currentUser, users, addFriend, acceptFriendRequest, getActiveFriends, getFriendRequests, calculateUserTasteProfile, calculateGenreMatchPercentage, getSharedTasteRecommendations } = useUser();
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [commonGenres, setCommonGenres] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  useEffect(() => {
    if (currentUser) {
      // Load friends and requests
      setFriends(getActiveFriends());
      setFriendRequests(getFriendRequests());
    }
  }, [currentUser, getActiveFriends, getFriendRequests]);
  
  // Calculate common genres and recommendations when a friend is selected
  useEffect(() => {
    if (selectedFriend) {
      const myProfile = calculateUserTasteProfile();
      const friendProfile = calculateUserTasteProfile(selectedFriend.id);
      
      // Find common genres
      const commonGenresList = [];
      
      Object.keys(myProfile).forEach(genre => {
        if (friendProfile[genre]) {
          commonGenresList.push({
            name: genre,
            myPercentage: myProfile[genre],
            friendPercentage: friendProfile[genre],
            averageScore: Math.round((myProfile[genre] + friendProfile[genre]) / 2)
          });
        }
      });
      
      // Sort by average score
      commonGenresList.sort((a, b) => b.averageScore - a.averageScore);
      setCommonGenres(commonGenresList.slice(0, 5)); // Top 5 common genres
      
      // Get movie recommendations based on shared taste
      const recs = getSharedTasteRecommendations(selectedFriend.id);
      setRecommendations(recs);
    }
  }, [selectedFriend, calculateUserTasteProfile, getSharedTasteRecommendations]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Search for users by username or email
    const results = users.filter(user => 
      user.id !== currentUser?.id && // Don't show current user
      (user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
       user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setSearchResults(results);
  };
  
  const handleAddFriend = (userId) => {
    const result = addFriend(userId);
    if (result.success) {
      // Update the search results to show pending status
      setSearchResults(prevResults => 
        prevResults.map(user => 
          user.id === userId 
            ? { ...user, requestSent: true } 
            : user
        )
      );
    }
  };
  
  const handleAcceptRequest = (friendshipId) => {
    const result = acceptFriendRequest(friendshipId);
    if (result.success) {
      // Refresh friends and requests
      setFriends(getActiveFriends());
      setFriendRequests(getFriendRequests());
    }
  };
  
  const handleSelectFriend = (friend) => {
    if (selectedFriend && selectedFriend.id === friend.id) {
      setSelectedFriend(null); // Close if already open
    } else {
      setSelectedFriend(friend);
    }
  };
  
  const handleNavigateToMovie = (movieId) => {
    navigate(`/movie/${movieId}`);
  };
  
  // Render blends visualization based on compatibility score
  const renderBlendMeter = (score) => {
    // Calculate color based on score (red to green gradient)
    const hue = Math.min(score * 1.2, 120); // 0 to 120 (red to green)
    const color = `hsl(${hue}, 80%, 50%)`;
    
    return (
      <div className="blend-meter">
        <div className="blend-score" style={{ color }}>
          {score}%
        </div>
        <div className="blend-bar">
          <div 
            className="blend-fill" 
            style={{ width: `${score}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Render smaller genre match visualization
  const renderGenreMatch = (myPercent, friendPercent) => {
    const overlap = Math.min(myPercent, friendPercent);
    
    return (
      <div className="genre-match">
        <div className="match-bar-wrapper">
          <div className="your-bar" style={{ width: `${myPercent}%` }}></div>
          <div className="friend-bar" style={{ width: `${friendPercent}%` }}></div>
          <div className="overlap-indicator" style={{ width: `${overlap}%` }}></div>
        </div>
        <div className="match-percentages">
          <span className="your-percent">{myPercent}%</span>
          <span className="overlap-percent">{overlap}% match</span>
          <span className="friend-percent">{friendPercent}%</span>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="page social-page">
        <div className="auth-prompt">
          <h2>Connect with Movie Fans</h2>
          <p>Sign in to find friends and compare your movie tastes!</p>
          <div className="auth-buttons">
            <Link to="/login" className="button">Login</Link>
            <Link to="/signup" className="button button-secondary">Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page social-page" style={{ backgroundColor: themeColors.background, color: themeColors.text }}>
      <h2 className="section-heading" style={{ color: themeColors.primary }}>Movie Blends</h2>
      <p className="section-description" style={{ color: themeColors.textSecondary }}>Connect with friends and see how your movie tastes blend together</p>
      
      <div className="social-tabs">
        <button 
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`} 
          onClick={() => setActiveTab('friends')}
        >
          My Blends
        </button>
        <button 
          className={`tab ${activeTab === 'requests' ? 'active' : ''}`} 
          onClick={() => setActiveTab('requests')}
        >
          Friend Requests 
          {friendRequests.length > 0 && <span className="tab-badge">{friendRequests.length}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'find' ? 'active' : ''}`} 
          onClick={() => setActiveTab('find')}
        >
          Find Friends
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'friends' && (
          <div className="friends-tab">
            {friends.length > 0 ? (
              <div className="friends-grid">
                {friends.map(friend => (
                  <div key={friend.id}>
                    <div 
                      className={`friend-card ${selectedFriend?.id === friend.id ? 'active' : ''}`}
                      onClick={() => handleSelectFriend(friend)}
                    >
                      <div className="friend-avatar" style={{ backgroundColor: themeColors.primary }}>
                        {friend.username.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="friend-info">
                        <h3>{friend.username}</h3>
                        <div className="blend-info">
                          <span style={{ color: themeColors.textSecondary }}>Taste Compatibility</span>
                          {renderBlendMeter(friend.compatibility)}
                        </div>
                      </div>
                      <div className="friend-actions">
                        <button 
                          className="expand-button"
                          aria-label={selectedFriend?.id === friend.id ? "Collapse" : "Expand"}
                        >
                          {selectedFriend?.id === friend.id ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>
                    
                    {selectedFriend?.id === friend.id && (
                      <div className="friend-details" style={{ 
                        backgroundColor: `${themeColors.surface}E6`,
                        borderRadius: '12px',
                        boxShadow: `0 6px 15px ${themeColors.shadow}`
                      }}>
                        <div className="shared-recommendations">
                          <h4 style={{ 
                            color: themeColors.primary, 
                            fontWeight: '600',
                            borderBottom: `2px solid ${themeColors.primary}30`,
                            paddingBottom: '10px',
                            marginBottom: '16px'
                          }}>Movies You Might Both Enjoy</h4>
                          {recommendations.length > 0 ? (
                            <div className="recommendations-grid">
                              {recommendations.map(movie => (
                                <div 
                                  key={movie.id} 
                                  className="recommended-movie"
                                  onClick={() => handleNavigateToMovie(movie.id)}
                                  style={{
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                  }}
                                >
                                  <img 
                                    src={movie.poster_path 
                                      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                                      : 'https://via.placeholder.com/200x300?text=No+Poster'
                                    } 
                                    alt={movie.title} 
                                    className="movie-poster"
                                    style={{ borderRadius: '8px 8px 0 0' }}
                                  />
                                  <div className="movie-info" style={{ 
                                    padding: '10px',
                                    backgroundColor: `${themeColors.background}90`
                                  }}>
                                    <h5 style={{ margin: '0 0 5px 0' }}>{movie.title}</h5>
                                    {movie.vote_average && (
                                      <div className="movie-rating">
                                        <span>⭐ {movie.vote_average.toFixed(1)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="no-recommendations" style={{ 
                              color: themeColors.textSecondary,
                              textAlign: 'center',
                              padding: '20px',
                              backgroundColor: `${themeColors.background}50`,
                              borderRadius: '8px'
                            }}>
                              No recommendations found based on your shared tastes.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't connected with any friends yet.</p>
                <button 
                  className="button"
                  onClick={() => setActiveTab('find')}
                  style={{
                    backgroundColor: themeColors.primary,
                    color: themeColors.surface
                  }}
                >
                  Find Friends
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'requests' && (
          <div className="requests-tab">
            {friendRequests.length > 0 ? (
              <div className="requests-list">
                {friendRequests.map(request => (
                  <div key={request.friendshipId} className="request-card">
                    <div className="request-avatar">
                      {request.user.username.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="request-info">
                      <h3>{request.user.username}</h3>
                      <p>Wants to connect with you</p>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="button"
                        onClick={() => handleAcceptRequest(request.friendshipId)}
                      >
                        Accept
                      </button>
                      <button className="button-secondary">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You don't have any pending friend requests.</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'find' && (
          <div className="find-tab">
            <div className="search-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or email..."
                className="search-input"
              />
              <button 
                className="button"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="search-results">
                {searchResults.map(user => {
                  // Check if a friend request has already been sent or received
                  const isFriend = friends.some(friend => friend.id === user.id);
                  const requestSent = user.requestSent || friends.some(f => f.id === user.id);
                  
                  return (
                    <div key={user.id} className="user-card">
                      <div className="user-avatar">
                        {user.username.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <h3>{user.username}</h3>
                      </div>
                      <div className="user-actions">
                        {isFriend ? (
                          <span className="status-connected">Connected</span>
                        ) : requestSent ? (
                          <span className="status-pending">Request Sent</span>
                        ) : (
                          <button 
                            className="button"
                            onClick={() => handleAddFriend(user.id)}
                          >
                            Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : searchQuery ? (
              <div className="empty-state">
                <p>No users found matching "{searchQuery}"</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;