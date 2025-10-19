import fs from "fs-extra";
import path from "node:path";

const outputDir = path.join(__dirname, "out");

if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

const endpoints = {
	shows: "http://localhost:3001/api/shows",
	movies: "http://localhost:3001/api/movies",
	"music-artists": "http://localhost:3001/api/music/artists",
};

async function exportData() {
	for (const [name, url] of Object.entries(endpoints)) {
		console.log(`exporting ${name}...`);

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch ${name}: ${response.status}`);
		}

		const data = await response.json();
		const filename = `${name}.json`;

		await fs.writeJSON(path.join(outputDir, filename), data);

		console.log(`exported ${name}`);
	}

	console.log("exported everything");
}

exportData();
