import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Discover from './pages/Discover';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import MoodRecommend from './pages/MoodRecommend';
import Social from './pages/Social';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import MoviePage from './pages/MoviePage';
import ActorPage from './pages/ActorPage';
import Confirmation from './pages/Confirmation';
import ConfirmedPage from './pages/ConfirmedPage';

const AppRoutes = () => {
  const { session } = useUser();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/confirmation" element={<Confirmation />} />
      <Route path="/confirmed-page" element={<ConfirmedPage />} />
      <Route path="/movie/:movieId" element={<MoviePage />} />
      <Route path="/actor/:actorId" element={<ActorPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists"
        element={
          <ProtectedRoute>
            <Playlists />
          </ProtectedRoute>
        }
      />
      <Route
        path="/playlists/:id"
        element={
          <ProtectedRoute>
            <PlaylistDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mood"
        element={
          <ProtectedRoute>
            <MoodRecommend />
          </ProtectedRoute>
        }
      />
      <Route
        path="/social"
        element={
          <ProtectedRoute>
            <Social />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 