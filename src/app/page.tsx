"use client";

import { useState, useEffect } from 'react';
import type { Song } from '@/types/song';
import { getSongsFromLocalStorage, saveSongToLocalStorage, deleteSongFromLocalStorage } from '@/lib/songsStorage';
import { AppHeader } from '@/components/AppHeader';
import { SongCreationForm } from '@/components/SongCreationForm';
import { SavedSongsList } from '@/components/SavedSongsList';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

export default function HomePage() {
  const [savedSongs, setSavedSongs] = useState<Song[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setSavedSongs(getSongsFromLocalStorage());
    }
  }, []);

  const handleSongSaved = (song: Song) => {
    saveSongToLocalStorage(song);
    setSavedSongs(getSongsFromLocalStorage());
  };

  const handleDeleteSong = (songId: string) => {
    deleteSongFromLocalStorage(songId);
    setSavedSongs(getSongsFromLocalStorage());
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-primary/5">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2">
            <SongCreationForm onSongSaved={handleSongSaved} />
          </div>
          <aside className="lg:col-span-1 space-y-8">
            {isClient ? (
              <SavedSongsList songs={savedSongs} onDeleteSong={handleDeleteSong} />
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading saved songs...</p>
              </div>
            )}
          </aside>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t font-body">
        <p>&copy; {new Date().getFullYear()} Sur Sangam. AI-powered Hindi song creation.</p>
        <p>Crafted with <span className="text-primary">&hearts;</span> and AI.</p>
      </footer>
    </div>
  );
}
