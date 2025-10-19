import "dotenv/config";

import { initDatabase } from "./database/init";
import { startServer } from "./server/server";
import { getTMDBTopMovies } from "./services/movie-service";
import { musicTest } from "./services/music-service";
import { getTMDBTopShows, updateDatabase } from "./services/show-service";

const db = initDatabase();

startServer(db);

// background tasks
// await getTMDBTopShows(db);
// await getTMDBTopMovies(db);
// await updateDatabase(db);
