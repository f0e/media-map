export const SERVER_PORT = 3001;
export const DATABASE_FILE = "media.sqlite";

export const TMDB_API_KEY = process.env.TMDB_API_KEY;
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const IMDB_BASE_URL = "https://www.imdb.com";
export const MAX_PAGES = 500;
export const UPDATE_INTERVAL_SECS = 30 * 24 * 60 * 60;

export const MUSICBRAINZ_APP_NAME = "MusicMap";
export const MUSICBRAINZ_VERSION = "1.0.0";
export const MUSICBRAINZ_CONTACT = process.env.MUSICBRAINZ_CONTACT;

export const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
export const LASTFM_API_SECRET = process.env.LASTFM_API_SECRET;

export const TV_MIN_IMDB_RATING = 6;
export const TV_MIN_IMDB_VOTES = 1000;
export const TV_EXCLUDED_GENRES = ["Kids"]; // todo: fix multiple elems

export const MOVIE_MIN_IMDB_RATING = 7;
export const MOVIE_MIN_IMDB_VOTES = 10000;
export const MOVIE_EXCLUDED_GENRES = ["Kids"]; // todo: fix multiple elems
