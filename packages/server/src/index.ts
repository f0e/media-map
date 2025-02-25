import "dotenv/config";

import { initDatabase } from "./database/init";
import { startServer } from "./server/server";
import { getTMDBTopShows, updateDatabase } from "./services/show-service";

const db = initDatabase();

startServer(db);

// getTMDBTopShows(db);
updateDatabase(db);
