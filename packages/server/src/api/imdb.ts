import * as cheerio from "cheerio";
import numbro from "numbro";
import { IMDB_BASE_URL } from "../config";

export interface IMDBData {
	rating: number;
	votes: number;
	creators: string[];
}

export async function getIMDBData(imdbId: string): Promise<IMDBData> {
	const response = await fetch(`${IMDB_BASE_URL}/title/${imdbId}`);

	if (response.status !== 200) throw new Error("fail");

	const $ = cheerio.load(await response.text());

	// todo: do these classes change? if so, make this more robust
	const ratingRaw = $(".sc-d541859f-1.imUuxf").first().text();
	const rating = Number.parseFloat(ratingRaw);

	const votesRaw = $(".sc-d541859f-3.dwhNqC").first().text();
	const votes = numbro.unformat(votesRaw.toLowerCase());

	const creators = [
		...new Set(
			$(
				'li[data-testid="title-pc-principal-credit"]:has(a:contains("Creator")) li a',
			)
				.map((i, e) => $(e).text())
				.get(),
		),
	];

	return {
		rating,
		votes,
		creators,
	};
}
