import type { Database } from "bun:sqlite";
import { SERVER_PORT } from "../config";
import {
	fetchAlbumsByLabel,
	fetchAlbumsByFeaturedArtist,
	getAllArtists,
} from "../services/music-service";
import { processMovieData } from "../services/movie-service";
import { processShowData } from "../services/show-service";
import {
	processArtistsData,
	getArtistCollaborationNetwork,
} from "../services/music-service";

export function startServer(db: Database) {
	Bun.serve({
		idleTimeout: 255,
		port: SERVER_PORT,
		async fetch(req) {
			const url = new URL(req.url);
			const path = url.pathname;

			// CORS preflight handling
			if (req.method === "OPTIONS") {
				return new Response(null, {
					status: 204,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type",
					},
				});
			}

			let res: Response;

			try {
				if (path === "/api/shows") {
					const shows = processShowData(db);
					res = new Response(JSON.stringify(shows));
				} else if (path === "/api/movies") {
					const movies = processMovieData(db);
					res = new Response(JSON.stringify(movies));
				} else if (path === "/api/music/artists") {
					const artistsTemp = await getArtistCollaborationNetwork(db, "Bladee");

					const artists = {
						nodes: artistsTemp.nodes.map((node) => ({
							...node,
							id: node.id.toString(),
						})),

						links: artistsTemp.links.map((node) => ({
							...node,
							source: node.source.toString(),
							target: node.target.toString(),
						})),
					};

					const positionsRes = await fetch(
						"http://localhost:8000/api/generate",
						{
							method: "POST",
							body: JSON.stringify(artists),
						},
					);

					const positionsData = await positionsRes.json();

					for (const node of artists.nodes) {
						node.x = positionsData.positions[node.id].x * 50;
						node.y = positionsData.positions[node.id].y * 50;
					}

					res = new Response(
						JSON.stringify({
							...artists,
						}),
					);
				}
				// // Music endpoints
				// else if (path.startsWith("/api/music/label/")) {
				//   const labelName = decodeURIComponent(
				//     path.replace("/api/music/label/", "")
				//   );
				//   const albums = await fetchAlbumsByLabel(db, labelName);
				//   res = new Response(JSON.stringify(albums));
				// } else if (path.startsWith("/api/music/featured-artist/")) {
				//   const artistName = decodeURIComponent(
				//     path.replace("/api/music/featured-artist/", "")
				//   );
				//   const albums = await fetchAlbumsByFeaturedArtist(db, artistName);
				//   res = new Response(JSON.stringify(albums));
				else {
					res = new Response(JSON.stringify({ error: "Not found" }), {
						status: 404,
					});
				}
			} catch (error) {
				console.error("API Error:", error);
				res = new Response(JSON.stringify({ error: "Internal server error" }), {
					status: 500,
				});
			}

			// Set common headers
			res.headers.set("Content-Type", "application/json");
			res.headers.set("Access-Control-Allow-Origin", "*");
			res.headers.set(
				"Access-Control-Allow-Methods",
				"GET, POST, PUT, DELETE, OPTIONS",
			);

			return res;
		},
	});

	console.log(`Server running at http://localhost:${SERVER_PORT}`);
}
