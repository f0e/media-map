import type { Database } from "bun:sqlite";
import type { IArtist } from "musicbrainz-api";

export function getArtistLastUpdate(
	db: Database,
	artistId: string,
): { last_updated: number } | undefined {
	return db
		.query("SELECT last_updated FROM music_artists_raw WHERE id = ?")
		.get(artistId) as { last_updated: number } | undefined;
}

export function getArtistCollaborators(
	db: Database,
	artistId: string,
): string[] {
	const collaborators = db
		.query(
			`
      SELECT collaborator_id 
      FROM music_collaborations 
      WHERE artist_id = ?
    `,
		)
		.all(artistId) as { collaborator_id: string }[];

	return collaborators.map((row) => row.collaborator_id);
}

export function insertOrUpdateArtist(
	db: Database,
	musicbrainzData: IArtist,
	collaborators: string[],
): void {
	const now = Date.now();

	// Begin a transaction to ensure all operations complete together
	db.exec("BEGIN TRANSACTION");

	try {
		// Insert or update the artist record
		db.run(
			`
      INSERT OR REPLACE INTO music_artists_raw 
      (id, musicbrainz_data, last_updated, last_seen)
      VALUES (?, ?, ?, ?)
      `,
			[musicbrainzData.id, JSON.stringify(musicbrainzData), now, now],
		);

		// First, remove existing collaborations for this artist
		// to avoid duplicates when we re-add them
		db.run("DELETE FROM music_collaborations WHERE artist_id = ?", [
			musicbrainzData.id,
		]);

		// Insert all collaborations
		if (collaborators.length > 0) {
			// Prepare the statement once for efficiency
			const stmt = db.prepare(
				"INSERT INTO music_collaborations (artist_id, collaborator_id) VALUES (?, ?)",
			);

			for (const collaboratorId of collaborators) {
				// Fix: Pass parameters directly, not as an array
				stmt.run(musicbrainzData.id, collaboratorId);
			}

			// Finalize the prepared statement
			stmt.finalize();
		}

		// Commit the transaction
		db.exec("COMMIT");
	} catch (error) {
		// If anything fails, roll back the entire transaction
		db.exec("ROLLBACK");
		throw error;
	}
}

export function updateMusicLastSeen(
	db: Database,
	musicId: number,
	timestamp: number,
): void {
	db.run(
		`UPDATE musics_raw 
     SET last_seen = ? 
     WHERE id = ?
    `,
		[timestamp, musicId],
	);
}

export function getQualifiedArtists(db: Database): any[] {
	return db
		.query(
			`
      SELECT * FROM music_artists
    `,
		)
		.all();
}

export function getUnseenMusics(
	db: Database,
	now: number,
	updateInterval: number,
): number[] {
	return db
		.query(
			`SELECT id
      FROM musics_raw
      WHERE last_seen < ?
      AND last_updated < ?
    `,
		)
		.all(now, now - updateInterval * 1000)
		.map((row: any) => row.id);
}
