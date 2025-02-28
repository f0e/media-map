import { Database } from "bun:sqlite";
import { DATABASE_FILE } from "../config";

export function initDatabase(): Database {
  const db = new Database(DATABASE_FILE, { create: true });

  db.run(`
    CREATE TABLE IF NOT EXISTS shows_raw (
      id INTEGER PRIMARY KEY,
      tmdb_data TEXT NOT NULL,
      imdb_id TEXT,
      imdb_rating REAL,
      imdb_votes INTEGER,
      crew_data TEXT,
      last_updated INTEGER NOT NULL,
      last_seen INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS movies_raw (
      id INTEGER PRIMARY KEY,
      tmdb_data TEXT NOT NULL,
      imdb_id TEXT,
      imdb_rating REAL,
      imdb_votes INTEGER,
      crew_data TEXT,
      last_updated INTEGER NOT NULL,
      last_seen INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS music_albums_raw (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      label TEXT,
      release_year INTEGER,
      genre TEXT,
      featured_artists TEXT,
      rating REAL,
      votes INTEGER,
      last_updated INTEGER NOT NULL,
      last_seen INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS music_artists_raw (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      bio TEXT,
      genre TEXT,
      formed_year INTEGER,
      label TEXT,
      rating REAL,
      last_updated INTEGER NOT NULL,
      last_seen INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS music_labels_raw (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      founded_year INTEGER,
      headquarters TEXT,
      parent_company TEXT,
      last_updated INTEGER NOT NULL,
      last_seen INTEGER NOT NULL
    )
  `);

  return db;
}
