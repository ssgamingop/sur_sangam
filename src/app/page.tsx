"use client";

import { useState, useEffect } from 'react';
import type { Song } from '@/types/song';
import { getSongsFromLocalStorage, saveSongToLocalStorage, deleteSongFromLocalStorage } from '@/lib/songsStorage';
import { AppHeader } from '@/components/AppHeader';
import { SongCreationForm } from '@/components/SongCreationForm';
import { SavedSongsList } from '@/components/SavedSongsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function HomePage() {
  const [savedSongs, setSavedSongs] = useState<Song[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setSavedSongs(getSongsFromLocalStorage());
    }
  }, []);

  const handleSongSaved = (song: Song) => {
    saveSongToLocalStorage(song);
    const updatedSongs = getSongsFromLocalStorage();
    setSavedSongs(updatedSongs);
    setActiveTab('library');
  };

  const handleDeleteSong = (songId: string) => {
    deleteSongFromLocalStorage(songId);
    setSavedSongs(getSongsFromLocalStorage());
  };

  const filteredSongs = savedSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-primary/5">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px] mx-auto">
            <TabsTrigger value="create">Create Song</TabsTrigger>
            <TabsTrigger value="library">My Library</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="mt-8">
            <div className="max-w-4xl mx-auto">
              <SongCreationForm onSongSaved={handleSongSaved} />
            </div>
          </TabsContent>
          <TabsContent value="library" className="mt-8">
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search your library by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-base"
                />
              </div>
              {isClient ? (
                <SavedSongsList 
                  songs={filteredSongs} 
                  totalSongs={savedSongs.length} 
                  onDeleteSong={handleDeleteSong} 
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Loading saved songs...</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground font-body border-t">
        <p>&copy; {new Date().getFullYear()} Sur Sangam. AI-powered Hindi song creation.</p>
        <p>Made by Somyajeet Singh</p>
        <p>Crafted with <span className="text-primary">&hearts;</span> and AI.</p>
      </footer>
    </div>
  );
}
