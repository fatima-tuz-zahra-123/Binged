import React, { useState, useEffect } from "react";
import { useUser } from "../src/contexts/UserContext";
import { useTheme } from "../src/contexts/ThemeContext";
import "./PlaylistDropdown.css";

const PlaylistDropdown = ({ movie, onPlaylistSelected, onClose }) => {
  const { currentUser, updateProfile } = useUser();
  const { themeColors } = useTheme();
  const [selected, setSelected] = useState("");
  const [playlists, setPlaylists] = useState([]);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (currentUser && currentUser.playlists) {
      setPlaylists(currentUser.playlists);
    } else {
      const savedPlaylists = localStorage.getItem('playlists');
      setPlaylists(savedPlaylists ? JSON.parse(savedPlaylists) : []);
    }
  }, [currentUser]);

  const handleAdd = () => {
    if (!selected) {
      setMessage({ type: 'error', text: 'Please select a playlist' });
      return;
    }
    
    try {
      const playlistIndex = playlists.findIndex(p => 
        p.id === selected || p.name === selected
      );
      
      if (playlistIndex === -1) {
        setMessage({ type: 'error', text: 'Playlist not found' });
        return;
      }
      
      if (playlists[playlistIndex].movies.some(m => m.id === movie.id)) {
        setMessage({ 
          type: 'info', 
          text: `"${movie.title}" is already in "${playlists[playlistIndex].name}"` 
        });
        return;
      }
      
      const updatedPlaylists = [...playlists];
      updatedPlaylists[playlistIndex].movies.push({
        ...movie,
        addedAt: new Date().toISOString()
      });
      
      setPlaylists(updatedPlaylists);
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      
      if (currentUser) {
        updateProfile({ playlists: updatedPlaylists });
      }
      
      setMessage({ 
        type: 'success', 
        text: `Added "${movie.title}" to "${playlists[playlistIndex].name}"!`
      });
      
      if (onPlaylistSelected) {
        onPlaylistSelected(selected);
      }
      
      setSelected("");
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Error adding movie to playlist:", err);
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a playlist name' });
      return;
    }
    
    try {
      const newPlaylist = {
        id: Date.now().toString(),
        name: newPlaylistName.trim(),
        movies: [{ 
          ...movie,
          addedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString()
      };
      
      const updatedPlaylists = [...playlists, newPlaylist];
      
      setPlaylists(updatedPlaylists);
      localStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      
      if (currentUser) {
        updateProfile({ playlists: updatedPlaylists });
      }
      
      setMessage({ 
        type: 'success', 
        text: `Created "${newPlaylistName}" and added "${movie.title}"!`
      });
      
      setNewPlaylistName("");
      setShowCreateNew(false);
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Error creating playlist:", err);
      setMessage({ type: 'error', text: 'Something went wrong' });
    }
  };

  // Apply theme-based styling
  const dropdownStyle = {
    backgroundColor: themeColors.surface,
    color: themeColors.text,
    borderColor: themeColors.border,
    boxShadow: themeColors.shadow
  };

  const headerStyle = {
    borderBottomColor: themeColors.border
  };

  const inputStyle = {
    backgroundColor: `${themeColors.background}30`,
    color: themeColors.text,
    borderColor: themeColors.border
  };

  const primaryBtnStyle = {
    backgroundColor: themeColors.primary,
    color: themeColors.surface
  };

  const secondaryBtnStyle = {
    backgroundColor: 'transparent',
    color: themeColors.textSecondary,
    borderColor: themeColors.border
  };

  const getMessageStyle = (type) => {
    switch (type) {
      case 'error':
        return { backgroundColor: 'rgba(255, 0, 0, 0.1)', color: '#ff3b3b' };
      case 'success':
        return { backgroundColor: 'rgba(39, 174, 96, 0.1)', color: '#2ecc71' };
      case 'info':
        return { backgroundColor: 'rgba(52, 152, 219, 0.1)', color: '#3498db' };
      default:
        return {};
    }
  };

  return (
    <div className="playlist-dropdown" style={dropdownStyle}>
      <div className="dropdown-header" style={headerStyle}>
        <h4 style={{ color: themeColors.primary }}>Add to Playlist</h4>
        <button 
          className="close-btn" 
          onClick={onClose}
          style={{ color: themeColors.textSecondary }}
        >
          ✕
        </button>
      </div>
      
      {message && (
        <div className={`message ${message.type}`} style={getMessageStyle(message.type)}>
          {message.text}
        </div>
      )}
      
      {showCreateNew ? (
        <div className="create-new-form">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New playlist name"
            className="new-playlist-input"
            style={inputStyle}
            autoFocus
          />
          <div className="dropdown-actions">
            <button 
              className="cancel-btn"
              onClick={() => setShowCreateNew(false)}
              style={secondaryBtnStyle}
            >
              Cancel
            </button>
            <button 
              className="create-btn"
              onClick={handleCreatePlaylist}
              style={primaryBtnStyle}
            >
              Create & Add
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="select-container">
            <select 
              value={selected} 
              onChange={(e) => setSelected(e.target.value)}
              className="playlist-select"
              style={inputStyle}
            >
              <option value="">Select a playlist...</option>
              {playlists.map((playlist) => (
                <option 
                  key={playlist.id || playlist.name} 
                  value={playlist.id || playlist.name}
                >
                  {playlist.name} ({playlist.movies?.length || 0})
                </option>
              ))}
            </select>
          </div>
          
          <div className="dropdown-actions">
            <button 
              className="new-btn"
              onClick={() => setShowCreateNew(true)}
              style={secondaryBtnStyle}
            >
              New Playlist
            </button>
            <button 
              className="add-btn"
              onClick={handleAdd}
              disabled={!selected}
              style={selected ? primaryBtnStyle : { ...primaryBtnStyle, opacity: 0.5 }}
            >
              Add to Playlist
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PlaylistDropdown;