import type { GraphData, MediaType } from "@music-map/shared";
import { useQuery } from "@tanstack/react-query";

const isDev = false; // import.meta.env.DEV;

const endpoints: Record<MediaType, string> = isDev
	? {
			shows: "http://localhost:3001/api/shows",
			movies: "http://localhost:3001/api/movies",
			// "music-artists": "http://localhost:3001/api/music/artists",
		}
	: {
			shows: "/data/shows.json",
			movies: "/data/movies.json",
			// "music-artists": "/data/music-artists.json",
		};

export const useMediaData = (mediaType: MediaType) => {
	if (!endpoints[mediaType]) return null;

	return useQuery({
		queryKey: [mediaType],
		queryFn: async () => {
			const response = await fetch(endpoints[mediaType]);
			if (!response.ok)
				throw new Error(`Failed to fetch ${mediaType}: ${response.status}`);
			return (await response.json()) as GraphData;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
