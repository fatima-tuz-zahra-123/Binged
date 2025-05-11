import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import './Social.css';

const Social = () => {
  const { currentUser, session, users, addFriend, acceptFriendRequest, getActiveFriends, getFriendRequests } = useUser();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  
  useEffect(() => {
    if (currentUser) {
      // Load friends and requests
      setFriends(getActiveFriends());
      setFriendRequests(getFriendRequests());
    }
  }, [currentUser, getActiveFriends, getFriendRequests]);
  
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

  if (!session) {
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
    <div className="page social-page">
      <h2 className="section-heading">Movie Blends</h2>
      <p className="section-description">Connect with friends and see how your movie tastes blend together</p>
      
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
                  <div key={friend.id} className="friend-card">
                    <div className="friend-avatar">
                      {friend.username.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="friend-info">
                      <h3>{friend.username}</h3>
                      <div className="blend-info">
                        <span>Taste Compatibility</span>
                        {renderBlendMeter(friend.compatibility)}
                      </div>
                    </div>
                    <div className="friend-actions">
                      <button className="button-secondary">View Profile</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't connected with any friends yet.</p>
                <button 
                  className="button"
                  onClick={() => setActiveTab('find')}
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