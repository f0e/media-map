import type { Database } from "bun:sqlite";
import { getIMDBData } from "../api/imdb";
import {
	getMovieExternalIds,
	getMovieCredits,
	getMovieDetails,
	getTopRatedMovies,
} from "../api/tmdb";
import * as movieQueries from "../database/movie-queries";
import { MAX_PAGES, UPDATE_INTERVAL_SECS } from "../config";
import type { GraphData, GraphNode, Link, Movie, Person } from "../types";

export async function addOrUpdateMovie(db: Database, movieId: number) {
	// check if movie exists and needs update
	const movieLastUpdate = movieQueries.getMovieLastUpdate(db, movieId);
	const now = Date.now();

	if (
		!movieLastUpdate ||
		now - movieLastUpdate.last_updated > UPDATE_INTERVAL_SECS * 1000
	) {
		const movie = await getMovieDetails(movieId);
		const crew = await getMovieCredits(movieId);
		const { imdb_id: imdbId } = await getMovieExternalIds(movieId);

		let imdbData = null;
		if (imdbId) {
			imdbData = await getIMDBData(imdbId);
		}

		movieQueries.insertOrUpdateMovie(
			db,
			movieId,
			movie,
			imdbId,
			imdbData,
			crew,
			now,
		);

		console.log(
			`Added ${movie.title}. ${
				movie.directors?.length
					? `Directed by ${movie.directors
							.map((p: any) => p.name)
							.join(", ")}. `
					: ""
			}IMDb ${imdbData?.rating} (${imdbData?.votes})`,
		);
	} else {
		// movie doesn't need updating, just update last seen
		movieQueries.updateMovieLastSeen(db, movieId, now);

		console.log(`Updated ${movieId} last seen`);
	}
}

export async function addOrUpdateMovies(db: Database, movies: any[]) {
	const batchSize = 5;

	for (let i = 0; i < movies.length; i += batchSize) {
		const batch = movies.slice(i, i + batchSize);

		await Promise.all(
			batch.map(async (movie: any) => {
				await addOrUpdateMovie(db, movie.id);
			}),
		);
	}
}

export async function getTMDBTopMovies(db: Database) {
	console.log("Fetching top movies...");
	const currentTopMovies = new Set();

	for (let page = 1; page <= MAX_PAGES; page++) {
		try {
			console.log(`Fetching top rated movies page ${page} of ${MAX_PAGES}...`);
			const data = await getTopRatedMovies(page);
			const movies = data.results;

			await addOrUpdateMovies(db, movies);

			for (const movie of movies) currentTopMovies.add(movie.id);
		} catch (error) {
			console.error(`Error fetching page ${page}:`, error);
			break;
		}
	}
}

export async function updateMovieDatabase(db: Database) {
	// update unseen movies
	const now = Date.now();
	const unseenIds = movieQueries.getUnseenMovies(db, now, UPDATE_INTERVAL_SECS);

	await addOrUpdateMovies(
		db,
		unseenIds.map((id: any) => ({ id })),
	);
}

export function filterMovies(movies: Movie[]): Movie[] {
	// filter movies to only include those with creators who have multiple movies
	const creatorsMap = new Map<string, Set<string>>();

	for (const movie of movies) {
		for (const person of movie.people) {
			if (!creatorsMap.has(person.id)) {
				creatorsMap.set(person.id, new Set());
			}

			creatorsMap.get(person.id)?.add(movie.id);
		}
	}

	const filteredMovies = movies.filter((movie) => {
		return movie.people.some((person) => {
			const creatorMovies = creatorsMap.get(person.id);
			return creatorMovies && creatorMovies.size > 1;
		});
	});

	return filteredMovies;
}

export function processMovieData(db: Database): GraphData {
	const rows: any[] = movieQueries.getQualifiedMovies(db);
	const nodes: Map<string, GraphNode> = new Map();
	const links: Link[] = [];

	const relevantRoles = ["Screenplay", "Writer"];

	for (const row of rows) {
		try {
			const tmdbData = JSON.parse(row.tmdb_data);
			const crewData = JSON.parse(row.crew_data);

			// Movie node
			const movieKey = `movie-${tmdbData.id}`;
			if (!nodes.has(movieKey)) {
				nodes.set(movieKey, {
					id: movieKey,
					label: tmdbData.title,
					type: "movie",
					year: new Date(tmdbData.release_date).getFullYear(),
					topText: [
						...tmdbData.production_companies.map(
							(company: any) => company.name,
						),
						`IMDb: ${row.imdb_rating} (${row.imdb_votes})`,
					],
					val: 1,
					groupLinks: 0,
				});
			}

			const movieNode = nodes.get(movieKey);
			if (!movieNode) continue; // typescript

			// Writer nodes and links
			for (const person of crewData.crew) {
				if (relevantRoles.includes(person.job)) {
					const personId = person.id || person.name;
					const personKey = `person-${personId}`;
					if (!nodes.has(personKey)) {
						nodes.set(personKey, {
							id: personKey,
							label: person.name,
							type: "person",
							val: 1,
							groupLinks: 0,
						});
					}

					const personNode = nodes.get(personKey);
					if (!personNode) continue; // typescript

					links.push({
						source: personNode.id,
						target: movieNode.id,
						type: person.job.toLowerCase(),
					});
				}
			}
		} catch (error) {
			console.error(`Error processing movie data for ID ${row.id}:`, error);
		}
	}

	return { nodes: Array.from(nodes.values()), links };
}
