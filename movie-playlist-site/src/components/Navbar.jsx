import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";
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
    setUserDropdownOpen(prev => !prev);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Check if a link is active based on current location
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Create a style for the navbar based on current theme
  const navbarStyle = {
    backgroundColor: themeColors.surface,
    boxShadow: `0 3px 15px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)'}`,
  };

  // Theme toggle button styles
  const themeToggleStyle = {
    backgroundColor: `${themeColors.primary}15`,
    borderColor: `${themeColors.primary}30`,
    color: themeColors.primary,
    boxShadow: theme === 'dark' ? `0 0 8px ${themeColors.primary}40` : 'none'
  };

  return (
    <nav className="navbar" style={navbarStyle}>
      <div className="navbar-container">
        <Link to="/" className="logo">
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
            <Link to="/" className={isActive('/')}>
              Home
            </Link>
            <Link to="/discover" className={isActive('/discover')}>
              Discover
            </Link>
            <Link to="/playlists" className={isActive('/playlists')}>
              Playlists
            </Link>
            <Link to="/mood" className={isActive('/mood')}>
              Mood
            </Link>
            <Link to="/social" className={isActive('/social')}>
              Social
            </Link>
          </div>
          
          <div className="nav-actions">
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              style={themeToggleStyle}
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
                    >
                      <i>👤</i> Profile
                    </Link>
                    <Link 
                      to="/playlists" 
                      className="dropdown-item"
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
                <Link to="/login" className="auth-link">
                  Login
                </Link>
                <Link to="/signup" className="auth-link signup-link">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;