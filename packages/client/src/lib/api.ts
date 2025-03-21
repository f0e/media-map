import type { GraphData, MediaType } from "@music-map/shared";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

export const useMediaData = (mediaType: MediaType) => {
	const endpoints: Record<MediaType, string> = {
		shows: "http://localhost:3001/api/shows",
		movies: "http://localhost:3001/api/movies",
		"music-artists": "http://localhost:3001/api/music/artists",
	};

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
