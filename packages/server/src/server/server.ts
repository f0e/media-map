import type { Database } from "bun:sqlite";
import { SERVER_PORT } from "../config";
import { processShowData } from "../services/processing";

export function startServer(db: Database) {
	Bun.serve({
		port: SERVER_PORT,
		routes: {
			"/api/shows": async (req) => {
				let res = null;

				try {
					const shows = processShowData(db);

					res = new Response(JSON.stringify(shows), {
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					res = new Response(
						JSON.stringify({ error: "Failed to fetch shows" }),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}

				res.headers.set("Access-Control-Allow-Origin", "*");
				res.headers.set(
					"Access-Control-Allow-Methods",
					"GET, POST, PUT, DELETE, OPTIONS",
				);

				return res;
			},
		},
	});

	console.log(`Server running at http://localhost:${SERVER_PORT}`);
}
