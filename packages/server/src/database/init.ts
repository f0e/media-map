import { Database } from "bun:sqlite";

export function initDatabase(): Database {
	const db = new Database("shows.sqlite", { create: true });

	db.run(`
    CREATE TABLE IF NOT EXISTS shows_raw (
      id INTEGER PRIMARY KEY,
      tmdb_data TEXT NOT NULL,
      imdb_id TEXT,
      imdb_rating REAL,
      imdb_votes INTEGER,
      imdb_creators TEXT,
      crew_data TEXT,
      last_updated INTEGER NOT NULL,
      last_seen INTEGER NOT NULL
    )
  `);

	return db;
}
