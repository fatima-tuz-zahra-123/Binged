import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Providers
import ThemeProvider from './contexts/ThemeContext';
import UserProvider from './contexts/UserContext';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Pages
import Home from '../pages/Home';
import Discover from '../pages/Discover';
import Playlists from '../pages/Playlists';
import MoodRecommend from '../pages/MoodRecommend';
import Social from '../pages/Social';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Profile from '../pages/Profile';
import MoviePage from '../pages/MoviePage';
import ActorPage from '../pages/ActorPage';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/mood" element={<MoodRecommend />} />
                <Route path="/social" element={<Social />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/movie/:movieId" element={<MoviePage />} />
                <Route path="/actor/:actorId" element={<ActorPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;