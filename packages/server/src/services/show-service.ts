import type { Database } from "bun:sqlite";
import { getIMDBData } from "../api/imdb";
import {
	getShowCredits,
	getShowDetails,
	getShowExternalIds,
	getTopRatedShows,
} from "../api/tmdb";
import { MAX_PAGES, UPDATE_INTERVAL_SECS } from "../config";
import {
	getQualifiedShows,
	getShowLastUpdate,
	getUnseenShows,
	insertOrUpdateShow,
	updateLastSeen,
} from "../database/show-queries";
import type { GraphNode, Link } from "../types";

export async function addOrUpdateShow(db: Database, showId: number) {
	// check if show exists and needs update
	const showLastUpdate = getShowLastUpdate(db, showId);
	const now = Date.now();

	if (
		!showLastUpdate ||
		now - showLastUpdate.last_updated > UPDATE_INTERVAL_SECS * 1000
	) {
		const show = await getShowDetails(showId);
		const crew = await getShowCredits(showId);
		const { imdb_id: imdbId } = await getShowExternalIds(showId);

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

		console.log(`Updated ${showId} last seen`);
	}
}

export async function addOrUpdateShows(db: Database, shows: any[]) {
	const batchSize = 5;

	for (let i = 0; i < shows.length; i += batchSize) {
		const batch = shows.slice(i, i + batchSize);

		await Promise.all(
			batch.map(async (show: any) => {
				await addOrUpdateShow(db, show.id);
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

export function getShowNetwork(db: Database): {
	nodes: GraphNode[];
	links: Link[];
} {
	const rows: any[] = getQualifiedShows(db);
	const nodes: Map<string, GraphNode> = new Map();
	const links: Link[] = [];

	// Process all shows first
	for (const row of rows) {
		try {
			const tmdbData = JSON.parse(row.tmdb_data);
			const crewData = JSON.parse(row.crew_data);

			const showKey = `show-${tmdbData.id}`;

			nodes.set(showKey, {
				id: showKey,
				label: tmdbData.name,
				year: new Date(tmdbData.first_air_date).getFullYear(),
				topText: [
					...tmdbData.networks.map((network: any) => network.name),
					`IMDb: ${row.imdb_rating} (${row.imdb_votes})`,
				],
				type: "show",
				val: 2,
				groupLinks: 0,
			});

			const showNode = nodes.get(showKey);
			if (!showNode) continue; // typescript

			// Creator nodes and links
			if (tmdbData.created_by) {
				for (const creator of tmdbData.created_by) {
					const personKey = `person-${creator.id}`;

					if (!nodes.has(personKey)) {
						nodes.set(personKey, {
							id: personKey,
							label: creator.name,
							type: "person",
							val: 1,
							groupLinks: 0,
						});
					}

					const personNode = nodes.get(personKey);
					if (!personNode) continue; // typescript

					links.push({
						source: personNode.id,
						target: showNode.id,
						type: "creator",
					});
				}
			}
		} catch (error) {
			console.error(`Error processing show data for ID ${row.id}:`, error);
		}
	}

	return { nodes: Array.from(nodes.values()), links };
}
