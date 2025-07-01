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
    // Add or update existing song by ID, now including the musicDataUri
    const updatedSongs = [song, ...songs.filter(s => s.id !== song.id)];
    localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(updatedSongs));
  } catch (error) {
    console.error("Error saving song to localStorage:", error);
     if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert("Could not save song. Your browser's local storage is full. Please clear some space or delete older songs.");
    }
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
