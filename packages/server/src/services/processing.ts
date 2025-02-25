import type { Database } from "bun:sqlite";
import type { Person, Show } from "@show-graph/shared";
import { getQualifiedShows } from "../database/queries";

export function processShowData(db: Database): Show[] {
	const shows: Show[] = [];
	const rows: any[] = getQualifiedShows(db);

	for (const row of rows) {
		try {
			const tmdbData = JSON.parse(row.tmdb_data);
			const crewData = JSON.parse(row.crew_data);

			const people: Person[] = [];

			// const people =
			//     JSON.parse(row.imdb_creators)
			//         .map((person) => ({id: person, name: person, role:
			//         'Creator'}));

			// const relevantRoles = [
			// 	"Writer",
			// 	"Showrunner",
			// 	"Creator",
			// 	"Executive Producer",
			// ];

			// people.push(
			// 	...crewData.crew
			// 		.filter((person) => relevantRoles.includes(person.job))
			// 		.map((person) => ({
			// 			id: person.name,
			// 			name: person.name,
			// 			role: person.job.toLowerCase(),
			// 		})),
			// );

			if (tmdbData.created_by) {
				for (const creator of tmdbData.created_by) {
					if (!people.find((p) => p.id === creator.name)) {
						people.push({
							id: creator.name,
							name: creator.name,
							role: "creator",
						});
					}
				}
			}

			shows.push({
				id: tmdbData.id.toString(),
				title: tmdbData.name,
				year: new Date(tmdbData.first_air_date).getFullYear(),
				rating: row.imdb_rating,
				votes: row.imdb_votes,
				people: [...new Map(people.map((p) => [p.id, p])).values()],
				networks: tmdbData.networks.map((network: any) => network.name),
			});
		} catch (error) {
			console.error(`Error processing show data for ID ${row.id}:`, error);
		}
	}

	return filterShows(shows);
}

export function filterShows(shows: Show[]): Show[] {
	// filter shows to only include those with creators who have multiple shows
	const creatorsMap = new Map<string, Set<string>>();

	for (const show of shows) {
		for (const person of show.people) {
			if (!creatorsMap.has(person.id)) {
				creatorsMap.set(person.id, new Set());
			}

			creatorsMap.get(person.id)?.add(show.id);
		}
	}

	const filteredShows = shows.filter((show) => {
		return show.people.some((person) => {
			const creatorShows = creatorsMap.get(person.id);
			return creatorShows && creatorShows.size > 1;
		});
	});

	return filteredShows;
}
