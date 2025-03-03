import { LASTFM_API_KEY } from "../config";

const API_URL = "http://ws.audioscrobbler.com/2.0/";

async function getTopTracks(artistName: string) {
  try {
    const url = `${API_URL}?method=artist.getTopTracks&artist=${encodeURIComponent(
      artistName
    )}&api_key=${LASTFM_API_KEY}&format=json&period=1month&limit=10`;
    const response = await fetch(url);
    const data = await response.json();

    return data?.toptracks?.track || [];
  } catch (error) {
    console.error(
      `Error fetching top tracks for ${artistName}:`,
      error.message
    );
    return [];
  }
}

export async function getMonthlyListeners(artistName: string) {
  const topTracks = await getTopTracks(artistName);

  // Sum up the listener counts of the top 10 tracks
  const totalListeners = topTracks.reduce(
    (sum: number, track: { listeners: string }) => {
      return sum + (Number.parseInt(track.listeners, 10) || 0);
    },
    0
  );

  return totalListeners;
}
