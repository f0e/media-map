import type { Database } from "bun:sqlite";
import {
  searchAlbums,
  getAlbumDetails,
  getArtistDetails,
  getLabelDetails,
  getArtistAlbums,
  getLabelArtists,
} from "../api/music";
import {
  insertOrUpdateAlbum,
  insertOrUpdateArtist,
  insertOrUpdateLabel,
  getAlbumsByLabel,
  getAlbumsByFeaturedArtist,
  getArtistsByLabel,
} from "../database/music-queries";
import { UPDATE_INTERVAL_SECS } from "../config";

export async function fetchAndStoreAlbum(db: Database, albumId: string) {
  const now = Date.now();
  try {
    const albumData = await getAlbumDetails(albumId);

    // Extract featured artists from tracks
    const featuredArtists = new Set<string>();
    if (albumData.tracks) {
      for (const track of albumData.tracks) {
        if (track.featured_artists) {
          for (const artist of track.featured_artists) {
            featuredArtists.add(artist);
          }
        }
      }
    }

    // Store the album
    insertOrUpdateAlbum(
      db,
      albumData.id,
      albumData.title,
      albumData.artist,
      albumData.label,
      albumData.release_year,
      albumData.genre,
      Array.from(featuredArtists),
      albumData.rating,
      albumData.votes,
      now
    );

    // If we have a label, make sure to store that too
    if (albumData.label) {
      try {
        const labelData = await getLabelDetails(albumData.label);
        insertOrUpdateLabel(
          db,
          labelData.id,
          labelData.name,
          labelData.founded_year,
          labelData.headquarters,
          labelData.parent_company,
          now
        );
      } catch (error) {
        console.error(
          `Error fetching label data for ${albumData.label}:`,
          error
        );
      }
    }

    // Store the main artist
    try {
      const artistData = await getArtistDetails(albumData.artist);
      insertOrUpdateArtist(
        db,
        artistData.id,
        artistData.name,
        artistData.bio,
        artistData.genre,
        artistData.formed_year,
        artistData.label,
        artistData.rating,
        now
      );
    } catch (error) {
      console.error(
        `Error fetching artist data for ${albumData.artist}:`,
        error
      );
    }

    // Store featured artists
    for (const artist of featuredArtists) {
      try {
        const artistData = await getArtistDetails(artist);
        insertOrUpdateArtist(
          db,
          artistData.id,
          artistData.name,
          artistData.bio,
          artistData.genre,
          artistData.formed_year,
          artistData.label,
          artistData.rating,
          now
        );
      } catch (error) {
        console.error(
          `Error fetching featured artist data for ${artist}:`,
          error
        );
      }
    }

    console.log(`Added album: ${albumData.title} by ${albumData.artist}`);
    return albumData;
  } catch (error) {
    console.error(`Error fetching album data for ${albumId}:`, error);
    return null;
  }
}

export async function fetchAlbumsByLabel(db: Database, labelName: string) {
  try {
    // First, ensure we have the label stored
    const labelData = await getLabelDetails(labelName);
    const now = Date.now();

    insertOrUpdateLabel(
      db,
      labelData.id,
      labelData.name,
      labelData.founded_year,
      labelData.headquarters,
      labelData.parent_company,
      now
    );

    // Fetch artists signed to this label
    const artistsData = await getLabelArtists(labelName);

    // Store each artist and their albums
    for (const artist of artistsData.artists) {
      // Store artist
      insertOrUpdateArtist(
        db,
        artist.id,
        artist.name,
        artist.bio,
        artist.genre,
        artist.formed_year,
        labelName,
        artist.rating,
        now
      );

      // Fetch and store their albums
      const albumsData = await getArtistAlbums(artist.id);
      for (const album of albumsData.albums) {
        await fetchAndStoreAlbum(db, album.id);
      }
    }

    return getAlbumsByLabel(db, labelName);
  } catch (error) {
    console.error(`Error fetching albums for label ${labelName}:`, error);
    return [];
  }
}

export async function fetchAlbumsByFeaturedArtist(
  db: Database,
  artistName: string
) {
  try {
    // First, ensure we have the artist stored
    const artistData = await getArtistDetails(artistName);
    const now = Date.now();

    insertOrUpdateArtist(
      db,
      artistData.id,
      artistData.name,
      artistData.bio,
      artistData.genre,
      artistData.formed_year,
      artistData.label,
      artistData.rating,
      now
    );

    // For featured artists, we need to search for albums they've been featured on
    // This would typically be a specific API endpoint, but we'll simulate with a search
    const searchResults = await searchAlbums(`featured:${artistName}`);

    // Store each album
    for (const album of searchResults.albums) {
      await fetchAndStoreAlbum(db, album.id);
    }

    return getAlbumsByFeaturedArtist(db, artistName);
  } catch (error) {
    console.error(`Error fetching albums featuring ${artistName}:`, error);
    return [];
  }
}
