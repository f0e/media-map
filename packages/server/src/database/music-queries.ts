import type { Database } from "bun:sqlite";

export function insertOrUpdateAlbum(
  db: Database,
  albumId: string,
  title: string,
  artist: string,
  label: string | null,
  releaseYear: number | null,
  genre: string | null,
  featuredArtists: string[],
  rating: number | null,
  votes: number | null,
  timestamp: number
): void {
  db.run(
    `
    INSERT OR REPLACE INTO music_albums_raw 
    (id, title, artist, label, release_year, genre, featured_artists, rating, votes, last_updated, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      albumId,
      title,
      artist,
      label,
      releaseYear,
      genre,
      JSON.stringify(featuredArtists),
      rating,
      votes,
      timestamp,
      timestamp,
    ]
  );
}

export function insertOrUpdateArtist(
  db: Database,
  artistId: string,
  name: string,
  bio: string | null,
  genre: string | null,
  formedYear: number | null,
  label: string | null,
  rating: number | null,
  timestamp: number
): void {
  db.run(
    `
    INSERT OR REPLACE INTO music_artists_raw 
    (id, name, bio, genre, formed_year, label, rating, last_updated, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      artistId,
      name,
      bio,
      genre,
      formedYear,
      label,
      rating,
      timestamp,
      timestamp,
    ]
  );
}

export function insertOrUpdateLabel(
  db: Database,
  labelId: string,
  name: string,
  foundedYear: number | null,
  headquarters: string | null,
  parentCompany: string | null,
  timestamp: number
): void {
  db.run(
    `
    INSERT OR REPLACE INTO music_labels_raw 
    (id, name, founded_year, headquarters, parent_company, last_updated, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      labelId,
      name,
      foundedYear,
      headquarters,
      parentCompany,
      timestamp,
      timestamp,
    ]
  );
}

export function getAlbumsByLabel(db: Database, labelName: string): any[] {
  return db
    .query(
      `
      SELECT * FROM music_albums_raw 
      WHERE label = ?
      ORDER BY release_year DESC, title
    `
    )
    .all(labelName);
}

export function getAlbumsByFeaturedArtist(
  db: Database,
  artistName: string
): any[] {
  throw "todo";
  // return db
  //   .query(
  //     `
  //     SELECT * FROM music_albums_raw
  //     WHERE json_array_contains(featured_artists, ?)
  //     ORDER BY release_year DESC, title
  //   `
  //   )
  //   .all(artistName);
}

export function getArtistsByLabel(db: Database, labelName: string): any[] {
  return db
    .query(
      `
      SELECT * FROM music_artists_raw 
      WHERE label = ?
      ORDER BY name
    `
    )
    .all(labelName);
}
