import type { Database } from "bun:sqlite";
import { SERVER_PORT } from "../config";
import {
  fetchAlbumsByLabel,
  fetchAlbumsByFeaturedArtist,
} from "../services/music-service";
import { processMovieData } from "../services/movie-service";
import { processShowData } from "../services/show-service";
import {
  processArtistsData,
  getArtistCollaborationNetwork,
} from "../services/music-service";

export function startServer(db: Database) {
  Bun.serve({
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
          const artists = await getArtistCollaborationNetwork(db, "Ecco2K");

          res = new Response(JSON.stringify(artists));
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
        "GET, POST, PUT, DELETE, OPTIONS"
      );

      return res;
    },
  });

  console.log(`Server running at http://localhost:${SERVER_PORT}`);
}
