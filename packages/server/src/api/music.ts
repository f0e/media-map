import { MUSIC_API_KEY, MUSIC_BASE_URL } from "../config";

export async function musicApiFetch(endpoint: string) {
  const response = await fetch(`${MUSIC_BASE_URL}${endpoint}`, {
    headers: {
      "x-api-key": MUSIC_API_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Music API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function searchAlbums(query: string, page = 1) {
  return await musicApiFetch(
    `/albums/search?q=${encodeURIComponent(query)}&page=${page}`
  );
}

export async function getAlbumDetails(albumId: string) {
  return await musicApiFetch(`/albums/${albumId}`);
}

export async function searchArtists(query: string, page = 1) {
  return await musicApiFetch(
    `/artists/search?q=${encodeURIComponent(query)}&page=${page}`
  );
}

export async function getArtistDetails(artistId: string) {
  return await musicApiFetch(`/artists/${artistId}`);
}

export async function getArtistAlbums(artistId: string, page = 1) {
  return await musicApiFetch(`/artists/${artistId}/albums?page=${page}`);
}

export async function getLabelDetails(labelId: string) {
  return await musicApiFetch(`/labels/${labelId}`);
}

export async function getLabelArtists(labelId: string, page = 1) {
  return await musicApiFetch(`/labels/${labelId}/artists?page=${page}`);
}
