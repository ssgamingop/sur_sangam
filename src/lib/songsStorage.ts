import type { Song } from '@/types/song';

const SONGS_STORAGE_KEY = 'surSangamSongs';

export const getSongsFromLocalStorage = (): Song[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const songsJson = localStorage.getItem(SONGS_STORAGE_KEY);
    return songsJson ? JSON.parse(songsJson) : [];
  } catch (error) {
    console.error("Error retrieving songs from localStorage:", error);
    return [];
  }
};

export const saveSongToLocalStorage = (song: Song): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const songs = getSongsFromLocalStorage();
    const updatedSongs = [song, ...songs.filter(s => s.id !== song.id)]; // Add or update existing
    localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(updatedSongs));
  } catch (error) {
    console.error("Error saving song to localStorage:", error);
  }
};

export const deleteSongFromLocalStorage = (songId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const songs = getSongsFromLocalStorage();
    const updatedSongs = songs.filter(song => song.id !== songId);
    localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(updatedSongs));
  } catch (error) {
    console.error("Error deleting song from localStorage:", error);
  }
};
