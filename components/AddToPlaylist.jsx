// components/AddToPlaylist.jsx
import React from 'react';

const AddToPlaylist = ({ movie, onAdd }) => {
  return (
    <button className="add-to-playlist" onClick={() => onAdd(movie)}>
      ➕ Add to Playlist
    </button>
  );
};

export default AddToPlaylist;