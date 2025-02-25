import type { Database } from "bun:sqlite";
import { getIMDBData } from "../api/imdb";
import {
	getExternalIds,
	getShowCredits,
	getShowDetails,
	getTopRatedShows,
} from "../api/tmdb";
import {
	getShowLastUpdate,
	getUnseenShows,
	insertOrUpdateShow,
	updateLastSeen,
} from "../database/queries";
import { MAX_PAGES, UPDATE_INTERVAL_SECS } from "../config";

export async function addShow(db: Database, showId: number) {
	// check if show exists and needs update
	const showLastUpdate = getShowLastUpdate(db, showId);
	const now = Date.now();

	if (
		!showLastUpdate ||
		now - showLastUpdate.last_updated > UPDATE_INTERVAL_SECS * 1000
	) {
		const show = await getShowDetails(showId);
		const crew = await getShowCredits(showId);
		const { imdb_id: imdbId } = await getExternalIds(showId);

		let imdbData = null;
		if (imdbId) {
			imdbData = await getIMDBData(imdbId);
		}

		insertOrUpdateShow(db, showId, show, imdbId, imdbData, crew, now);

		console.log(
			`Added ${show.name}. ${
				show.created_by.length
					? `Created by ${show.created_by.map((p: any) => p.name).join(", ")}. `
					: ""
			}IMDb ${imdbData?.rating} (${imdbData?.votes})`,
		);
	} else {
		// show doesn't need updating, just update last seen
		updateLastSeen(db, showId, now);

		console.log(
			`Updated ${showId} last seen`,
		);
	}
}

export async function addOrUpdateShows(db: Database, shows: any[]) {
	const batchSize = 5;

	for (let i = 0; i < shows.length; i += batchSize) {
		const batch = shows.slice(i, i + batchSize);

		await Promise.all(
			batch.map(async (show: any) => {
				await addShow(db, show.id);
			}),
		);
	}
}

export async function getTMDBTopShows(db: Database) {
	console.log("Fetching top shows...");
	const currentTopShows = new Set();

	for (let page = 1; page <= MAX_PAGES; page++) {
		try {
			console.log(`Fetching top rated shows page ${page} of ${MAX_PAGES}...`);
			const data = await getTopRatedShows(page);
			const shows = data.results;

			await addOrUpdateShows(db, shows);

			for (const show of shows) currentTopShows.add(show.id);
		} catch (error) {
			console.error(`Error fetching page ${page}:`, error);
			break;
		}
	}
}

export async function updateDatabase(db: Database) {
	// update unseen shows
	const now = Date.now();
	const unseenIds = getUnseenShows(db, now, UPDATE_INTERVAL_SECS);

	await addOrUpdateShows(
		db,
		unseenIds.map((id) => ({ id })),
	);
}
