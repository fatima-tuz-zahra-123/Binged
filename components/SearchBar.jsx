// components/SearchBar.jsx
import React from 'react';
import { useTheme } from '../src/contexts/ThemeContext';
import './SearchBar.css';

const SearchBar = ({ query, setQuery }) => {
  const { themeColors } = useTheme();
  
  const inputStyle = {
    backgroundColor: themeColors.surface,
    color: themeColors.text,
    borderColor: themeColors.border
  };
  
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
};

export default SearchBar;