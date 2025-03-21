import type { Database } from "bun:sqlite";
import {
	MOVIE_EXCLUDED_GENRES,
	MOVIE_MIN_IMDB_RATING,
	MOVIE_MIN_IMDB_VOTES,
} from "../config";

export function getMovieLastUpdate(
	db: Database,
	movieId: number,
): { last_updated: number } | undefined {
	return db
		.query("SELECT last_updated FROM movies_raw WHERE id = ?")
		.get(movieId) as { last_updated: number } | undefined;
}

export function insertOrUpdateMovie(
	db: Database,
	movieId: number,
	movie: any,
	imdbId: string | null,
	imdbData: {
		rating?: number;
		votes?: number;
		creators?: string[];
	} | null,
	crew: any,
	now: number,
): void {
	db.run(
		`
    INSERT OR REPLACE INTO movies_raw 
    (id, tmdb_data, imdb_id, imdb_rating, imdb_votes, crew_data, 
     last_updated, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
		[
			movieId,
			JSON.stringify(movie),
			imdbId,
			imdbData?.rating ?? null,
			imdbData?.votes ?? null,
			JSON.stringify(crew),
			now,
			now,
		],
	);
}

export function updateMovieLastSeen(
	db: Database,
	movieId: number,
	timestamp: number,
): void {
	db.run(
		`UPDATE movies_raw 
     SET last_seen = ? 
     WHERE id = ?
    `,
		[timestamp, movieId],
	);
}

export function getQualifiedMovies(db: Database): any[] {
	return db
		.query(
			`
      SELECT * FROM movies_raw 
      WHERE imdb_rating > ${MOVIE_MIN_IMDB_RATING}
      AND imdb_votes > ${MOVIE_MIN_IMDB_VOTES}
      AND NOT EXISTS (
        SELECT 1 FROM json_each(movies_raw.tmdb_data, '$.genres')
        WHERE json_each.value->>'name' = '${MOVIE_EXCLUDED_GENRES[0]}'
      )
    `,
		)
		.all();
}

export function getUnseenMovies(
	db: Database,
	now: number,
	updateInterval: number,
): number[] {
	return db
		.query(
			`SELECT id
      FROM movies_raw
      WHERE last_seen < ?
      AND last_updated < ?
    `,
		)
		.all(now, now - updateInterval * 1000)
		.map((row: any) => row.id);
}
