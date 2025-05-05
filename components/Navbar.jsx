import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../src/contexts/ThemeContext";
import { useUser } from "../src/contexts/UserContext";
import "./Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
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
  
  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };
  
  // Check if a link is active based on current location
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
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
            <Link to="/" onClick={() => setMenuOpen(false)} className={isActive('/')}>Home</Link>
            <Link to="/discover" onClick={() => setMenuOpen(false)} className={isActive('/discover')}>Discover</Link>
            <Link to="/playlists" onClick={() => setMenuOpen(false)} className={isActive('/playlists')}>Playlists</Link>
            <Link to="/mood" onClick={() => setMenuOpen(false)} className={isActive('/mood')}>Mood</Link>
            <Link to="/social" onClick={() => setMenuOpen(false)} className={isActive('/social')}>Social</Link>
          </div>
          
          <div className="nav-actions">
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
            {currentUser ? (
              <div className="user-dropdown" ref={dropdownRef}>
                <div 
                  className="user-avatar" 
                  onClick={toggleUserDropdown}
                  title={currentUser.username}
                >
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                
                {userDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p className="dropdown-username">{currentUser.username}</p>
                      <p className="dropdown-email">{currentUser.email}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <i>👤</i> Profile
                    </Link>
                    <Link 
                      to="/playlists" 
                      className="dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
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
                <Link to="/login" className="auth-link" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="auth-link signup-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;