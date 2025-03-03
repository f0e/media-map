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

  // db.run(`
  //   CREATE TABLE IF NOT EXISTS music_artists (
  //     id INTEGER PRIMARY KEY,
  //     gid TEXT NOT NULL,
  //     name TEXT NOT NULL,
  //     sort_name TEXT NOT NULL,
  //     begin_date_year INTEGER,
  //     begin_date_month INTEGER,
  //     begin_date_day INTEGER,
  //     end_date_year INTEGER,
  //     end_date_month INTEGER,
  //     end_date_day INTEGER,
  //     type INTEGER,
  //     area INTEGER,
  //     gender INTEGER,
  //     comment TEXT NOT NULL,
  //     edits_pending INTEGER NOT NULL,
  //     last_updated TIMESTAMP,
  //     ended BOOLEAN NOT NULL,
  //     begin_area INTEGER,
  //     end_area INTEGER,
  //   );
  // `);

  // db.run(`
  //   CREATE TABLE IF NOT EXISTS music_collaborations (
  //     artist1_id	INTEGER,
  //     artist2_id	INTEGER,
  //     collaboration_count	INTEGER,
  //     PRIMARY KEY(artist1_id, artist2_id),
  //     FOREIGN KEY(artist1_id) REFERENCES music_artists(id),
  //     FOREIGN KEY(artist2_id) REFERENCES music_artists(id)
  //   );
  // `);

  return db;
}
