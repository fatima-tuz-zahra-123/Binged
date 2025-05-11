import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';

// Providers
import ThemeProvider from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="content">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;