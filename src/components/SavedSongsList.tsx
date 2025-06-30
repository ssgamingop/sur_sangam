"use client";

import type { Song } from '@/types/song';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, FileText, Music, Search, Download, Copy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";


interface SavedSongsListProps {
  songs: Song[];
  totalSongs: number;
  onDeleteSong: (songId: string) => void;
}

export function SavedSongsList({ songs, totalSongs, onDeleteSong }: SavedSongsListProps) {
  const { toast } = useToast();

  const handleCopyLyrics = (song: Song) => {
    if (!song.lyrics) {
      toast({ variant: "destructive", title: "Cannot Copy", description: "No lyrics available to copy." });
      return;
    }
    navigator.clipboard.writeText(song.lyrics).then(() => {
      toast({ title: "Lyrics Copied!", description: `Lyrics for "${song.title}" have been copied.` });
    }).catch(err => {
      console.error("Could not copy lyrics: ", err);
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy lyrics to clipboard." });
    });
  };

  const handleDownloadLyrics = (song: Song) => {
    if (!song.lyrics || !song.title.trim()) {
      toast({ variant: "destructive", title: "Cannot Download", description: "Missing lyrics or a song title." });
      return;
    }
    const blob = new Blob([song.lyrics], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${song.title.trim().replace(/ /g, '_')}-lyrics.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Lyrics Download Started", description: "Check your downloads folder." });
  };


  if (totalSongs === 0) {
    return (
      <div className="text-center py-10 border rounded-lg bg-card/50">
        <Music className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-xl font-headline text-muted-foreground">No Saved Songs Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground font-body">Create some music and it will appear here!</p>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
       <div className="text-center py-10 border rounded-lg bg-card/50">
        <Search className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-xl font-headline text-muted-foreground">No Songs Found</h3>
        <p className="mt-1 text-sm text-muted-foreground font-body">Your search returned no results. Try another keyword.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <h2 className="text-3xl font-headline text-primary mb-6">My Song Library</h2>
      <Accordion type="single" collapsible className="w-full">
        {songs.map((song) => (
          <AccordionItem value={song.id} key={song.id} className="border-b-0 mb-4">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <AccordionTrigger className="w-full px-6 py-4 hover:no-underline">
                <div className="flex justify-between items-center w-full">
                  <div className="text-left">
                    <CardTitle className="text-2xl font-headline text-primary">{song.title}</CardTitle>
                    <CardDescription className="text-sm font-body text-muted-foreground">
                      Style: {song.style} &bull; Created: {format(parseISO(song.createdAt), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0 pb-6 px-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                         <h4 className="text-lg font-headline text-primary flex items-center gap-2"><FileText size={20} /> Lyrics</h4>
                         <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCopyLyrics(song); }}>
                              <Copy size={16} className="mr-2" /> Copy
                            </Button>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadLyrics(song); }}>
                              <Download size={16} className="mr-2" /> Download
                            </Button>
                         </div>
                      </div>
                      <ScrollArea className="h-40 mt-1 rounded-md border p-3 bg-background/80">
                        <pre className="text-sm font-body whitespace-pre-wrap">{song.lyrics}</pre>
                      </ScrollArea>
                    </div>
                    <div>
                      <h4 className="text-lg font-headline text-primary flex items-center gap-2"><Music size={20} /> Music Description</h4>
                      <p className="text-sm font-body mt-1 text-muted-foreground">{song.musicDescription}</p>
                    </div>
                     <p className="text-xs font-body text-muted-foreground/70">Prompt: "{song.prompt}"</p>
                  </div>
                </CardContent>
                <CardFooter className="px-6 pb-6">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent accordion toggle
                      onDeleteSong(song.id);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Delete Song
                  </Button>
                </CardFooter>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
