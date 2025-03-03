// music-service.ts
import type { Database } from "bun:sqlite";
import * as musicQueries from "../database/music-queries";
import { MAX_PAGES, UPDATE_INTERVAL_SECS } from "../config";
import type {
	Artist,
	GraphData,
	GraphNode,
	Link,
	Music,
	Person,
} from "../types";
import mb from "../api/musicbrainz";
import { getMonthlyListeners } from "../api/lastfm";

// export async function addOrUpdateMusic(db: Database, musicId: number) {
//   // check if music exists and needs update
//   const musicLastUpdate = musicQueries.getMusicLastUpdate(db, musicId);
//   const now = Date.now();

//   if (
//     !musicLastUpdate ||
//     now - musicLastUpdate.last_updated > UPDATE_INTERVAL_SECS * 1000
//   ) {
//     const music = await getMusicDetails(musicId);
//     const crew = await getMusicCredits(musicId);
//     const { imdb_id: imdbId } = await getMusicExternalIds(musicId);

//     let imdbData = null;
//     if (imdbId) {
//       imdbData = await getIMDBData(imdbId);
//     }

//     musicQueries.insertOrUpdateMusic(
//       db,
//       musicId,
//       music,
//       imdbId,
//       imdbData,
//       crew,
//       now
//     );

//     console.log(
//       `Added ${music.title}. ${
//         music.directors?.length
//           ? `Directed by ${music.directors
//               .map((p: any) => p.name)
//               .join(", ")}. `
//           : ""
//       }IMDb ${imdbData?.rating} (${imdbData?.votes})`
//     );
//   } else {
//     // music doesn't need updating, just update last seen
//     musicQueries.updateMusicLastSeen(db, musicId, now);

//     console.log(`Updated ${musicId} last seen`);
//   }
// }

// export async function addOrUpdateMusics(db: Database, musics: any[]) {
//   const batchSize = 5;

//   for (let i = 0; i < musics.length; i += batchSize) {
//     const batch = musics.slice(i, i + batchSize);

//     await Promise.all(
//       batch.map(async (music: any) => {
//         await addOrUpdateMusic(db, music.id);
//       })
//     );
//   }
// }

// export async function getTMDBTopMusics(db: Database) {
//   console.log("Fetching top musics...");
//   const currentTopMusics = new Set();

//   for (let page = 1; page <= MAX_PAGES; page++) {
//     try {
//       console.log(`Fetching top rated musics page ${page} of ${MAX_PAGES}...`);
//       const data = await getTopRatedMusics(page);
//       const musics = data.results;

//       await addOrUpdateMusics(db, musics);

//       for (const music of musics) currentTopMusics.add(music.id);
//     } catch (error) {
//       console.error(`Error fetching page ${page}:`, error);
//       break;
//     }
//   }
// }

// export async function updateMusicDatabase(db: Database) {
//   // update unseen musics
//   const now = Date.now();
//   const unseenIds = musicQueries.getUnseenMusics(db, now, UPDATE_INTERVAL_SECS);

//   await addOrUpdateMusics(
//     db,
//     unseenIds.map((id: any) => ({ id }))
//   );
// }

// export function processMusicData(db: Database): Music[] {
//   const musics: Music[] = [];
//   const rows: any[] = getQualifiedMusics(db);

//   for (const row of rows) {
//     try {
//       const tmdbData = JSON.parse(row.tmdb_data);
//       const crewData = JSON.parse(row.crew_data);

//       const people: Person[] = [];

//       const relevantRoles = ["Screenplay", "Writer"];

//       people.push(
//         ...crewData.crew
//           .filter((person: any) => relevantRoles.includes(person.job))
//           .map((person: any) => ({
//             id: person.name,
//             name: person.name,
//             role: person.job.toLowerCase(),
//           }))
//       );

//       musics.push({
//         id: tmdbData.id.toString(),
//         title: tmdbData.title,
//         year: new Date(tmdbData.release_date).getFullYear(),
//         rating: row.imdb_rating,
//         votes: row.imdb_votes,
//         people: [...new Map(people.map((p) => [p.id, p])).values()],
//         production_companies: tmdbData.production_companies.map(
//           (company: any) => company.name
//         ),
//       });
//     } catch (error) {
//       console.error(`Error processing music data for ID ${row.id}:`, error);
//     }
//   }

//   return filterMusics(musics);
// }

// export function filterMusics(musics: Music[]): Music[] {
//   // filter musics to only include those with creators who have multiple musics
//   const creatorsMap = new Map<string, Set<string>>();

//   for (const music of musics) {
//     for (const person of music.people) {
//       if (!creatorsMap.has(person.id)) {
//         creatorsMap.set(person.id, new Set());
//       }

//       creatorsMap.get(person.id)?.add(music.id);
//     }
//   }

//   const filteredMusics = musics.filter((music) => {
//     return music.people.some((person) => {
//       const creatorMusics = creatorsMap.get(person.id);
//       return creatorMusics && creatorMusics.size > 1;
//     });
//   });

//   return filteredMusics;
// }

export async function getArtistCollaboratorIds(
	artistId: string,
): Promise<Set<string>> {
	const query = `arid:${artistId} AND creditname:*`;

	const collaborators = new Set<string>();
	let offset = 0;

	while (true) {
		const searchResults = await mb.search("recording", { query, offset });
		console.log(searchResults);

		if (!searchResults.recordings) {
			console.log(artistId, "has no collaborators?");

			return collaborators;
		}

		for (const res of searchResults.recordings) {
			const releaseArtists = res["artist-credit"];
			if (!releaseArtists) continue;

			for (const releaseArtist of releaseArtists) {
				if (releaseArtist.artist.id === artistId) continue;
				if (collaborators.has(releaseArtist.artist.id)) continue;

				collaborators.add(releaseArtist.artist.id);
				console.log(`\t${releaseArtist.name}`);
			}
		}

		offset += searchResults.recordings.length;

		if (offset === searchResults.count) return collaborators;
	}
}

export async function musicTest(db: Database) {
	const queue = ["cd689e77-dfdd-4f81-b50c-5e5a3f5e38a4"];
	const been = new Set<string>();

	while (queue.length > 0) {
		const entry = queue.shift();
		if (!entry) break; // dumb typescript

		been.add(entry);

		let collaboratorIds = [];

		const lastSeen = musicQueries.getArtistLastUpdate(db, entry);
		if (lastSeen) {
			// todo
			collaboratorIds = musicQueries.getArtistCollaborators(db, entry);
			console.log("seen");
		} else {
			const musicbrainzData = await mb.lookup("artist", entry);
			console.log("getting", musicbrainzData.name, "collaborators");

			collaboratorIds = [...(await getArtistCollaboratorIds(entry))];

			console.log("new");

			musicQueries.insertOrUpdateArtist(db, musicbrainzData, collaboratorIds);
		}

		console.log(collaboratorIds);

		for (const collaboratorId of collaboratorIds) {
			if (queue.includes(collaboratorId)) continue;
			if (been.has(collaboratorId)) continue;

			queue.push(collaboratorId);
		}
	}

	console.log("queue done?");
}

export async function getArtistCollaborationNetwork(
	db: Database,
	artistName: string,
	maxDepth = 1,
) {
	const nodes: Map<string, GraphNode> = new Map();
	const links: Link[] = [];
	// Using a more efficient Set for tracking processed pairs
	const processedLinks: Set<string> = new Set();

	// Find the starting artist
	const startingArtist: any = db
		.query("SELECT id, name FROM music_artists WHERE name = $name LIMIT 1")
		.get({ $name: artistName });

	if (!startingArtist) {
		return { nodes: [], links: [] };
	}

	// Add starting artist to nodes
	nodes.set(startingArtist.id.toString(), {
		id: startingArtist.id.toString(),
		label: startingArtist.name,
		year: startingArtist.year,
		topText: ["depth: 0"],
		val: 1,
		type: "music-artist",
		groupLinks: 0,
	});

	// Queue for BFS
	const queue: Array<{ id: number; depth: number }> = [
		{ id: startingArtist.id, depth: 0 },
	];
	const visited = new Set<string>([startingArtist.id.toString()]);

	const lastfmListeners = new Map<number, number>();

	// BFS to find all artists up to maxDepth
	while (queue.length > 0) {
		const current = queue.shift()!;

		// Skip if we've reached max depth
		if (current.depth >= maxDepth) {
			continue;
		}

		// Get all collaborators
		const collaborations: any[] = db
			.query(
				`
      SELECT 
        c.artist1_id, 
        c.artist2_id, 
        c.collaboration_count,
        a1.name as artist1_name,
        a2.name as artist2_name,
				NULLIF(a1.begin_date_year, 'NULL') AS artist1_year, -- todo, fix in db. the nulls are strings lol
				NULLIF(a2.begin_date_year, 'NULL') AS artist2_year
      FROM music_collaborations c
      JOIN music_artists a1 ON c.artist1_id = a1.id
      JOIN music_artists a2 ON c.artist2_id = a2.id
      WHERE c.artist1_id = $id OR c.artist2_id = $id
    `,
			)
			.all({ $id: current.id });

		for (const collab of collaborations) {
			// let listeners = lastfmListeners.get(collab.artist2_id);
			// if (!listeners) {
			//   listeners = await getMonthlyListeners(collab.artist2_name);
			//   lastfmListeners.set(collab.artist2_id, listeners);
			// }
			// if (listeners < 10000 || listeners > 1000000) {
			//   console.log(collab.artist2_name, "under 100k/over 1m, skipping");
			//   continue;
			// }

			const otherArtistId =
				collab.artist1_id === current.id
					? collab.artist2_id.toString()
					: collab.artist1_id.toString();
			const otherArtistName =
				collab.artist1_id === current.id
					? collab.artist2_name
					: collab.artist1_name;
			const otherArtistYear =
				collab.artist1_id === current.id
					? collab.artist2_year
					: collab.artist1_year;

			// Create a hash for the link - more efficient than string concatenation
			// Use a cantor pairing function for unique mapping of two integers to one
			const a = Math.min(current.id, otherArtistId);
			const b = Math.max(current.id, otherArtistId);
			const pairHash = `${a}-${b}`; // ((a + b) * (a + b + 1)) / 2 + b;

			if (!processedLinks.has(pairHash)) {
				processedLinks.add(pairHash);

				// Add link
				links.push({
					source: current.id.toString(),
					target: otherArtistId.toString(),
					type: "collaborator",
					value: collab.collaboration_count,
				});
			}

			// Add node if not visited
			if (!visited.has(otherArtistId)) {
				visited.add(otherArtistId);

				// Add to queue for next depth
				queue.push({ id: otherArtistId, depth: current.depth + 1 });

				// Add to nodes
				nodes.set(otherArtistId, {
					id: otherArtistId,
					label: otherArtistName,
					year: otherArtistYear,
					topText: [`depth: ${current.depth + 1}`],
					val: 1,
					type: "music-artist",
					groupLinks: 0,
				});
			}
		}
	}

	// Convert nodes Map to array
	const nodeArray = Array.from(nodes.values());

	return {
		nodes: nodeArray,
		links: links,
	};
}

export function getAllArtists(db: Database): GraphData {
	const artists: any[] = db
		.query(
			`SELECT ma.*
FROM music_artists ma
`,
		)
		.all();

	// Fetch all collaborations
	const collaborations: any[] = db
		.query(
			"SELECT artist1_id, artist2_id, collaboration_count FROM music_collaborations",
		)
		.all();

	// Convert artists to nodes
	const nodes: GraphNode[] = artists.map(
		(artist): GraphNode => ({
			id: artist.id,
			label: artist.name,
			val: 1,
			type: "music-artist",
			groupLinks: 0,
		}),
	);

	const artistIds = new Set<string>(nodes.map((node) => node.id));

	// Convert collaborations to links
	const links: Link[] = collaborations
		.filter(
			(collab) =>
				artistIds.has(collab.artist1_id) && artistIds.has(collab.artist2_id),
		)
		.map(
			(collab): Link => ({
				source: collab.artist1_id,
				target: collab.artist2_id,
				type: "collaborator",
				// weight: collab.collaboration_count,
			}),
		);

	return { nodes, links };
}
