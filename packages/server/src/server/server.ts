import type { Database } from "bun:sqlite";
import { SERVER_PORT } from "../config";
import { processMovieData as getMovieNetwork } from "../services/movie-service";
import { getShowNetwork } from "../services/show-service";
import { getArtistCollaborationNetwork } from "../services/music-service";
import { processGraph } from "../services/graph";
import type { Graph } from "../types";

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
				let graphData: GraphData | null = null;

				if (path === "/api/shows") {
					graphData = getShowNetwork(db);
				} else if (path === "/api/movies") {
					graphData = getMovieNetwork(db);
				} else if (path === "/api/music/artists") {
					graphData = await getArtistCollaborationNetwork(db, "Bladee");
				} else {
					res = new Response(JSON.stringify({ error: "Not found" }), {
						status: 404,
					});
				}

				if (graphData) {
					graphData = await processGraph(graphData);
					res = new Response(JSON.stringify(graphData));
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
