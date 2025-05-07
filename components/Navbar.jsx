import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  
  // Enhanced navigation handler that uses direct programmatic navigation
  const handleNavigate = (e, path) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Stop event propagation
    setMenuOpen(false);
    setUserDropdownOpen(false);
    
    // Direct programmatic navigation
    navigate(path);
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
        <a href="/" className="logo" onClick={(e) => handleNavigate(e, '/')}>
          <span className="logo-icon">🎬</span> 
          <span className="logo-text">Binged</span>
        </a>
        
        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <div className={`nav-content ${menuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <a href="/" className={isActive('/')} onClick={(e) => handleNavigate(e, '/')}>
              Home
            </a>
            <a href="/discover" className={isActive('/discover')} onClick={(e) => handleNavigate(e, '/discover')}>
              Discover
            </a>
            <a href="/playlists" className={isActive('/playlists')} onClick={(e) => handleNavigate(e, '/playlists')}>
              Playlists
            </a>
            <a href="/mood" className={isActive('/mood')} onClick={(e) => handleNavigate(e, '/mood')}>
              Mood
            </a>
            <a href="/social" className={isActive('/social')} onClick={(e) => handleNavigate(e, '/social')}>
              Social
            </a>
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
                    <a 
                      href="/profile" 
                      className="dropdown-item"
                      onClick={(e) => handleNavigate(e, '/profile')}
                    >
                      <i>👤</i> Profile
                    </a>
                    <a 
                      href="/playlists" 
                      className="dropdown-item"
                      onClick={(e) => handleNavigate(e, '/playlists')}
                    >
                      <i>📋</i> My Playlists
                    </a>
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
                <a href="/login" className="auth-link" onClick={(e) => handleNavigate(e, '/login')}>
                  Login
                </a>
                <a href="/signup" className="auth-link signup-link" onClick={(e) => handleNavigate(e, '/signup')}>
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;