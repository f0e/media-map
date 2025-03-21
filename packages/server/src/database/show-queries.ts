import type { Database } from "bun:sqlite";
import {
	TV_EXCLUDED_GENRES,
	TV_MIN_IMDB_RATING,
	TV_MIN_IMDB_VOTES,
} from "../config";

export function getShowLastUpdate(
	db: Database,
	showId: number,
): { last_updated: number } | undefined {
	return db
		.query("SELECT last_updated FROM shows_raw WHERE id = ?")
		.get(showId) as { last_updated: number } | undefined;
}

export function insertOrUpdateShow(
	db: Database,
	showId: number,
	show: any,
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
    INSERT OR REPLACE INTO shows_raw 
    (id, tmdb_data, imdb_id, imdb_rating, imdb_votes, crew_data, 
     last_updated, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
		[
			showId,
			JSON.stringify(show),
			imdbId,
			imdbData?.rating ?? null,
			imdbData?.votes ?? null,
			JSON.stringify(imdbData?.creators),
			JSON.stringify(crew),
			now,
			now,
		],
	);
}

export function updateLastSeen(
	db: Database,
	showId: number,
	timestamp: number,
): void {
	db.run(
		`UPDATE shows_raw 
     SET last_seen = ? 
     WHERE id = ?
    `,
		[timestamp, showId],
	);
}

export function getQualifiedShows(db: Database): any[] {
	return db
		.query(
			`
      SELECT * FROM shows_raw 
      WHERE imdb_rating > ${TV_MIN_IMDB_RATING}
      AND imdb_votes > ${TV_MIN_IMDB_VOTES}
      AND NOT EXISTS (
        SELECT 1 FROM json_each(shows_raw.tmdb_data, '$.genres')
        WHERE json_each.value->>'name' = '${TV_EXCLUDED_GENRES[0]}'
      )
    `,
		)
		.all();
}

export function getUnseenShows(
	db: Database,
	now: number,
	updateInterval: number,
): number[] {
	return db
		.query(
			`SELECT id
      FROM shows_raw
      WHERE last_seen < ?
      AND last_updated < ?
    `,
		)
		.all(now, now - updateInterval * 1000)
		.map((row: any) => row.id);
}
