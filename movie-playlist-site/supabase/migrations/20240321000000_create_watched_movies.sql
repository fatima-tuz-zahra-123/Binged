-- Create watched_movies table
CREATE TABLE IF NOT EXISTS watched_movies (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movie(movie_id) ON DELETE CASCADE,
    watched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

-- Add RLS policies
ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own watch history
CREATE POLICY "Users can view their own watch history"
    ON watched_movies
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own watch history
CREATE POLICY "Users can insert their own watch history"
    ON watched_movies
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own watch history
CREATE POLICY "Users can delete their own watch history"
    ON watched_movies
    FOR DELETE
    USING (auth.uid() = user_id); 