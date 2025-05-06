import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../src/contexts/ThemeContext";
import { useUser } from "../src/contexts/UserContext";
import "./Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme, themeColors } = useTheme();
  const { currentUser, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };
  
  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };
  
  const handleNavigate = (e) => {
    // Stop propagation to prevent any parent handlers from capturing the event
    e.stopPropagation();
    setMenuOpen(false);
    setUserDropdownOpen(false);
  };
  
  // Check if a link is active based on current location
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Create a style for the navbar based on current theme
  const navbarStyle = {
    backgroundColor: themeColors.surface,
    boxShadow: `0 3px 15px ${themeColors.theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)'}`,
  };

  return (
    <nav className="navbar" style={navbarStyle}>
      <div className="navbar-container">
        <Link to="/" className="logo" onClick={(e) => handleNavigate(e)}>
          <span className="logo-icon">🎬</span> 
          <span className="logo-text">Binged</span>
        </Link>
        
        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <div className={`nav-content ${menuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <Link to="/" className={isActive('/')} onClick={(e) => handleNavigate(e)}>Home</Link>
            <Link to="/discover" className={isActive('/discover')} onClick={(e) => handleNavigate(e)}>Discover</Link>
            <Link to="/playlists" className={isActive('/playlists')} onClick={(e) => handleNavigate(e)}>Playlists</Link>
            <Link to="/mood" className={isActive('/mood')} onClick={(e) => handleNavigate(e)}>Mood</Link>
            <Link to="/social" className={isActive('/social')} onClick={(e) => handleNavigate(e)}>Social</Link>
          </div>
          
          <div className="nav-actions">
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              style={{
                backgroundColor: `${themeColors.primary}15`,
                borderColor: `${themeColors.primary}30`,
                color: themeColors.primary
              }}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
            {currentUser ? (
              <div className="user-dropdown" ref={dropdownRef}>
                <div 
                  className="user-avatar" 
                  onClick={toggleUserDropdown}
                  title={currentUser.username}
                  style={{ backgroundColor: themeColors.primary }}
                >
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                
                {userDropdownOpen && (
                  <div className="dropdown-menu" style={{ backgroundColor: themeColors.surface }}>
                    <div className="dropdown-header">
                      <p className="dropdown-username">{currentUser.username}</p>
                      <p className="dropdown-email">{currentUser.email}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={(e) => handleNavigate(e)}
                    >
                      <i>👤</i> Profile
                    </Link>
                    <Link 
                      to="/playlists" 
                      className="dropdown-item"
                      onClick={(e) => handleNavigate(e)}
                    >
                      <i>📋</i> My Playlists
                    </Link>
                    <button 
                      className="dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      <i>🚪</i> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="auth-link" onClick={(e) => handleNavigate(e)}>Login</Link>
                <Link to="/signup" className="auth-link signup-link" onClick={(e) => handleNavigate(e)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;