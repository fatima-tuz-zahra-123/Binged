import React from 'react';
import { useNavigate } from 'react-router-dom';

// A simple component that provides guaranteed navigation functionality
const NavButton = ({ to, children, className = '', style = {} }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use setTimeout to ensure the click event is fully processed
    // before attempting navigation
    setTimeout(() => {
      navigate(to);
    }, 0);
  };

  return (
    <button 
      className={`nav-button ${className}`}
      onClick={handleClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        margin: 0,
        font: 'inherit',
        color: 'inherit',
        textDecoration: 'inherit',
        ...style
      }}
    >
      {children}
    </button>
  );
};

export default NavButton;