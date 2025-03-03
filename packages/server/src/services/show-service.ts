import type { Database } from "bun:sqlite";
import { getIMDBData } from "../api/imdb";
import {
  getShowExternalIds,
  getShowCredits,
  getShowDetails,
  getTopRatedShows,
} from "../api/tmdb";
import {
  getShowLastUpdate,
  getUnseenShows,
  insertOrUpdateShow,
  updateLastSeen,
  getQualifiedShows,
} from "../database/show-queries";
import { MAX_PAGES, UPDATE_INTERVAL_SECS } from "../config";
import type { Person, Show } from "../types";

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
      }IMDb ${imdbData?.rating} (${imdbData?.votes})`
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
      })
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
    unseenIds.map((id) => ({ id }))
  );
}
export function processShowData(db: Database): Show[] {
  const shows: Show[] = [];
  const rows: any[] = getQualifiedShows(db);

  for (const row of rows) {
    try {
      const tmdbData = JSON.parse(row.tmdb_data);
      const crewData = JSON.parse(row.crew_data);

      const people: Person[] = [];

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
              id: creator.id.toString(),
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
    return show.people.some((person: any) => {
      const creatorShows = creatorsMap.get(person.id);
      return creatorShows && creatorShows.size > 1;
    });
  });

  return filteredShows;
}
