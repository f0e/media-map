export const SERVER_PORT = 3001;
export const DATABASE_FILE = "media.sqlite";

export const TMDB_API_KEY = process.env.TMDB_API_KEY;
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const IMDB_BASE_URL = "https://www.imdb.com";
export const MAX_PAGES = 500;
export const UPDATE_INTERVAL_SECS = 30 * 24 * 60 * 60;

// Music API configuration
export const MUSIC_API_KEY = process.env.MUSIC_API_KEY;
export const MUSIC_BASE_URL = "https://api.music-database.example.com/v1"; // Replace with actual API

export const MIN_IMDB_RATING = 6;
export const MIN_IMDB_VOTES = 1000;
export const EXCLUDED_GENRES = ["Kids"]; // todo: fix multiple elems
