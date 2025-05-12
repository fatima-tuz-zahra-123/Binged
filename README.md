# Binged: Movie Playlist & Recommendation System

![Binged Logo](movie-playlist-site/public/favicon.ico)

## 📌 Overview

Binged is a comprehensive movie discovery platform that allows users to explore, create playlists, and receive personalized movie recommendations. The application features a user-friendly interface with interactive components to enhance the movie browsing experience.

## Key Features

### Movie Discovery & Information

- **Enhanced Hero Section**: Showcasing top-rated and trending movies
- **Comprehensive Movie Details**: Access to movie information, cast, ratings, and reviews
- **Actor Profiles**: Explore actors and their filmography
- **Advanced Search**: Find movies by title, genre, year, and more

### Personal Movie Management

- **Custom Playlists**: Create and manage personalized movie collections
- **Watched Tracking**: Mark and track movies you've already watched
- **Like System**: Save favorite movies to your "Liked" collection
- **User Reviews**: Write and read reviews for any movie

### User Experience

- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Themes**: Customize your viewing experience
- **User Profiles**: Create personal accounts to save your preferences
- **Social Features**: Share playlists and recommendations with friends

### AI-Powered Recommendations

- **Mood-Based Suggestions**: Get recommendations based on your current mood
- **Personalized Recommendations**: AI suggests movies based on your watch history
- **Similar Movie Discovery**: Find movies related to your favorites

## Technologies Used

- **Frontend**: React.js, CSS3, React Context API
- **Backend**: Node.js
- **Database**: Supabase
- **External APIs**: TMDB (The Movie Database)
- **AI Integration**: Machine learning algorithms for personalized recommendations

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/binged-movie-playlist.git
   cd binged-movie-playlist
   ```

2. Install the dependencies:

   ```bash
   cd movie-playlist-site
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the project root and add your API keys:

   ```
   REACT_APP_TMDB_API_KEY=your_tmdb_api_key
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Roadmap

- Add movie recommendation based on friend activity
- Implement public/private playlist options
- Enable social media sharing
- Expand language support for international users
- Develop mobile apps for iOS and Android
