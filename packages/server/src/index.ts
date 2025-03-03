import "dotenv/config";

import { initDatabase } from "./database/init";
import { startServer } from "./server/server";
import { getTMDBTopShows, updateDatabase } from "./services/show-service";
import { getTMDBTopMovies } from "./services/movie-service";
import { musicTest } from "./services/music-service";

const db = initDatabase();

startServer(db);

// getTMDBTopMovies(db);
// updateDatabase(db);
// musicTest(db);
