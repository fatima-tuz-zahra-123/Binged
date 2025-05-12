from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
from lightfm import LightFM
from lightfm.data import Dataset
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import json
from typing import List, Dict
import asyncio
from datetime import datetime, timedelta
import traceback
import time
from fastapi import BackgroundTasks

load_dotenv()  # Loads variables from .env

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase = create_client(supabase_url, supabase_key)

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for the model and dataset
model = None
dataset = None
user_map = None
item_map = None
last_training_time = None

async def fetch_data():
    """Fetch data from Supabase"""
    try:
        print("✅ Fetching data from Supabase")
        # Fetch watch history
        watched_movies = supabase.table('watched_movies').select('*').execute()
        watch_df = pd.DataFrame(watched_movies.data)

        # Fetch movies
        movies = supabase.table('movie').select('*').execute()
        movies_df = pd.DataFrame(movies.data)

        # Fetch movie genres
        movie_genres = supabase.table('movie_genre').select('*').execute()
        genres_df = pd.DataFrame(movie_genres.data)

        return watch_df, movies_df, genres_df
    except Exception as e:
        print(f"Error fetching data: {e}")
        raise HTTPException(status_code=500, detail="Error fetching data from database")

def prepare_data(watch_df: pd.DataFrame, movies_df: pd.DataFrame, genres_df: pd.DataFrame):
    """Prepare data for the LightFM model"""
    global dataset, user_map, item_map

    print("✅ Preparing data for training")
    # Filter watch_df to include only movie_ids that exist in movies_df
    valid_movie_ids = set(movies_df['movie_id'])
    print(f"Valid movie IDs: {len(valid_movie_ids)}")
    # Logging missing movie IDs
    missing_movie_ids = [movie_id for movie_id in watch_df['movie_id'] if movie_id not in valid_movie_ids]
    if missing_movie_ids:
        print(f"⚠️ Missing movie IDs from 'movies' table: {missing_movie_ids}")
    watch_df = watch_df[watch_df['movie_id'].isin(valid_movie_ids)]
    # Filter genres_df to include only genres for valid movie IDs
    genres_df = genres_df[genres_df['movie_id'].isin(valid_movie_ids)]

    # Create dataset
    dataset = Dataset()
    
    # Fit the dataset
    dataset.fit(
        users=watch_df['user_id'].unique(),
        items=movies_df['movie_id'].unique(),
        item_features=genres_df['genre_id'].unique()
    )

    # Build interactions
    interactions, _ = dataset.build_interactions(
        [(row['user_id'], row['movie_id']) for _, row in watch_df.iterrows()]
    )

    # Build item features
    item_features = dataset.build_item_features(
        [(row['movie_id'], [row['genre_id']]) for _, row in genres_df.iterrows()]
    )

    # Get mappings
    user_map, user_inv_map, item_map, item_inv_map = dataset.mapping()
    print(f"Dataset built with {len(user_map)} users and {len(item_map)} items")

    return interactions, item_features

def train_model(interactions, item_features):
    """Train the LightFM model"""
    global model, last_training_time

    print("✅ Starting model training...")
    print(f"Interactions shape: {interactions.shape}")
    print(f"Item features shape: {item_features.shape}")
    # Initialize model
    model = LightFM(loss='warp', learning_rate=0.05)

    # Train model
    model.fit(
        interactions=interactions,
        item_features=item_features,
        epochs=30,
        num_threads=4
    )

    print("✅ Model training completed")
    last_training_time = datetime.now()

async def update_model():
    """Update the model with new data"""
    watch_df, movies_df, genres_df = await fetch_data()
    interactions, item_features = prepare_data(watch_df, movies_df, genres_df)
    train_model(interactions, item_features)

async def update_model_periodically():
    while True:
        try:
            print("🔄 Periodic model update started...")
            await update_model()
            print("✅ Periodic model update completed")
        except Exception as e:
            print(f"❌ Error during periodic model update: {e}")
        time.sleep(86400)  # 24 hours

@app.on_event("startup")
async def startup_event():
    """Initialize the model on startup and schedule periodic updates"""
    try:
        print("✅ Running model initialization on startup")
        await update_model()
        if model is not None and user_map is not None and item_map is not None:
            print("✅ Model and mappings successfully initialized on startup.")
        else:
            print("⚠️ Model or mappings not properly initialized on startup.")

        # Start background task for periodic updates
        import threading
        threading.Thread(target=lambda: asyncio.run(update_model_periodically()), daemon=True).start()

    except Exception as e:
        print(f"❌ Exception during startup model initialization: {e}")
        traceback.print_exc()

@app.get("/recommendations/{user_id}")
async def get_recommendations(user_id: str, n: int = 10):
    """Get movie recommendations for a user"""
    global model, dataset, user_map, item_map, last_training_time

    try:
        print(f"🔍 Getting recommendations for user {user_id}")
        # Check if model needs updating (update every 24 hours)
        if last_training_time and datetime.now() - last_training_time > timedelta(hours=24):
            print("🔄 Refreshing model due to age...")
            await update_model()

        # Check if model and mappings are initialized
        if model is None:
            print("⚠️ Model not initialized.")
            raise HTTPException(status_code=500, detail="Recommendation model is not ready.")
        if user_map is None or item_map is None:
            print("⚠️ User or item mappings not initialized.")
            raise HTTPException(status_code=500, detail="Recommendation model is not ready.")

        print(f"🔍 Requesting recommendations for user: {user_id}")
        print(f"👥 Users in model sample: {list(user_map.keys())[:5]}")
        print(f"🎬 Items in model sample: {list(item_map.keys())[:5]}")

        # If user not in model, attempt retraining once
        if user_id not in user_map:
            print(f"🌀 User '{user_id}' not found. Attempting one-time retrain...")
            await update_model()
            if user_id not in user_map:
                print(f"🚫 Still not found after retrain. Skipping recommendation.")
                return []

        user_index = user_map[user_id]
        n_items = len(item_map)

        scores = model.predict(
            user_index,
            np.arange(n_items),
            item_features=None  # item_features is not global here, passing None
        )

        top_items = np.argsort(-scores)[:n]
        reverse_item_map = {v: k for k, v in item_map.items()}
        recommended_movie_ids = [reverse_item_map[i] for i in top_items]

        print(f"🎯 Recommended movie IDs: {recommended_movie_ids}")

        movies = supabase.table('movie').select('*').in_('movie_id', recommended_movie_ids).execute()

        return movies.data

    except Exception as e:
        print("❌ Exception in get_recommendations:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error generating recommendations")

@app.post("/record-watch")
async def record_watch(user_id: str, movie_id: str):
    """Record a movie watch and update the model"""
    try:
        print(f"✅ Recording movie watch for user {user_id} and movie {movie_id}")
        # Record the watch in Supabase
        supabase.table('watched_movies').insert({
            'user_id': user_id,
            'movie_id': movie_id,
            'watch_date': datetime.now().isoformat()
        }).execute()

        # Update the model
        await update_model()

        return {"status": "success"}
    except Exception as e:
        print(f"Error recording watch: {e}")
        raise HTTPException(status_code=500, detail="Error recording watch")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)