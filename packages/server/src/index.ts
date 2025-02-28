import "dotenv/config";

import { initDatabase } from "./database/init";
import { startServer } from "./server/server";
import { getTMDBTopShows, updateDatabase } from "./services/show-service";
import { getTMDBTopMovies } from "./services/movie-service";

const db = initDatabase();

startServer(db);

// getTMDBTopMovies(db);
updateDatabase(db);
