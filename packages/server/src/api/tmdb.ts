import { TMDB_API_KEY, TMDB_BASE_URL } from "../config";

export async function tmdbFetch(url: string) {
	const response = await fetch(`${TMDB_BASE_URL}${url}`, {
		headers: {
			Authorization: `Bearer ${TMDB_API_KEY}`,
			"Content-Type": "application/json",
		},
	});

	if (response.status !== 200) throw new Error("fail");

	if (!response.ok) {
		throw new Error(
			`TMDB API error: ${response.status} ${response.statusText}`,
		);
	}

	return response.json();
}

export async function getShowDetails(showId: number) {
	return await tmdbFetch(`/tv/${showId}`);
}

export async function getShowCredits(showId: number) {
	return await tmdbFetch(`/tv/${showId}/credits`);
}

export async function getShowExternalIds(showId: number) {
	return await tmdbFetch(`/tv/${showId}/external_ids`);
}

export async function getTopRatedShows(page: number) {
	return await tmdbFetch(`/tv/top_rated?page=${page}`);
}

export async function getMovieDetails(movieId: number) {
	return await tmdbFetch(`/movie/${movieId}`);
}

export async function getMovieCredits(movieId: number) {
	return await tmdbFetch(`/movie/${movieId}/credits`);
}

export async function getMovieExternalIds(movieId: number) {
	return await tmdbFetch(`/movie/${movieId}/external_ids`);
}

export async function getTopRatedMovies(page: number) {
	return await tmdbFetch(`/movie/top_rated?page=${page}`);
}
