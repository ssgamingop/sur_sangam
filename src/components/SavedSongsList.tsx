"use client";

import type { Song } from '@/types/song';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, FileText, Music, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format, parseISO } from 'date-fns';

interface SavedSongsListProps {
  songs: Song[];
  onDeleteSong: (songId: string) => void;
}

export function SavedSongsList({ songs, onDeleteSong }: SavedSongsListProps) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-10">
        <Music className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-xl font-headline text-muted-foreground">No Saved Songs Yet</h3>
        <p className="mt-1 text-sm text-muted-foreground font-body">Create some music and it will appear here!</p>
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
                      Style: {song.style} - Created: {format(parseISO(song.createdAt), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  {/* Chevron is part of AccordionTrigger already */}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="pt-0 pb-6 px-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-headline text-primary flex items-center gap-2"><FileText size={20} /> Lyrics</h4>
                      <ScrollArea className="h-40 mt-1 rounded-md border p-3 bg-white">
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
