"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { generateHindiLyrics } from "@/ai/flows/generate-hindi-lyrics";
import { composeMusic } from "@/ai/flows/compose-music-from-lyrics";
import type { MusicStyle, Song } from "@/types/song";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./LoadingSpinner";
import { Sparkles, Music, Save, FileText, AlertTriangle } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(5, { message: "Prompt must be at least 5 characters." }).max(200),
  style: z.enum(['Bollywood', 'Classical', 'Devotional']),
});

const musicStyles: MusicStyle[] = ['Bollywood', 'Classical', 'Devotional'];

interface SongCreationFormProps {
  onSongSaved: (song: Song) => void;
}

export function SongCreationForm({ onSongSaved }: SongCreationFormProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [musicDescription, setMusicDescription] = useState<string | null>(null);
  const [musicDataUri, setMusicDataUri] = useState<string | null>(null); // Placeholder
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const [songTitle, setSongTitle] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentStyle, setCurrentStyle] = useState<MusicStyle>('Bollywood');

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      style: 'Bollywood',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLyrics(null);
    setMusicDescription(null);
    setMusicDataUri(null);
    setSongTitle(values.prompt); // Default title
    setCurrentPrompt(values.prompt);
    setCurrentStyle(values.style);

    setIsLoadingLyrics(true);
    try {
      const lyricsOutput = await generateHindiLyrics({ prompt: values.prompt, style: values.style });
      setLyrics(lyricsOutput.lyrics);
      toast({ title: "Lyrics Generated!", description: "AI has crafted your song's lyrics." });

      setIsLoadingMusic(true);
      try {
        const musicOutput = await composeMusic({ lyrics: lyricsOutput.lyrics, style: values.style });
        setMusicDescription(musicOutput.description);
        setMusicDataUri(musicOutput.musicDataUri); // This is a placeholder
        toast({ title: "Music Composed!", description: "AI has described the music for your song." });
      } catch (musicError) {
        console.error("Music composition error:", musicError);
        toast({ variant: "destructive", title: "Music Error", description: "Failed to compose music. Please try again." });
      } finally {
        setIsLoadingMusic(false);
      }
    } catch (lyricsError) {
      console.error("Lyrics generation error:", lyricsError);
      toast({ variant: "destructive", title: "Lyrics Error", description: "Failed to generate lyrics. Please try again." });
    } finally {
      setIsLoadingLyrics(false);
    }
  }

  const handleSaveSong = () => {
    if (!lyrics || !musicDescription || !currentPrompt || !songTitle) {
      toast({ variant: "destructive", title: "Cannot Save", description: "Missing song details." });
      return;
    }
    const newSong: Song = {
      id: crypto.randomUUID(),
      title: songTitle,
      prompt: currentPrompt,
      lyrics,
      style: currentStyle,
      musicDataUri: musicDataUri || "", // Placeholder
      musicDescription,
      createdAt: new Date().toISOString(),
    };
    onSongSaved(newSong);
    toast({ title: "Song Saved!", description: `"${songTitle}" has been added to your library.` });
    // Optionally reset parts of the form or generated content
    // setLyrics(null);
    // setMusicDescription(null);
    // setMusicDataUri(null);
    // form.reset();
  };
  
  const isSongGenerated = lyrics && musicDescription;

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-2"><Sparkles className="text-primary" /> Create Your Song</CardTitle>
        <CardDescription>Enter a few words, choose a style, and let AI create a Hindi song for you!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Your Song Idea (Prompt)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., बारिश में एक कप चाय (A cup of tea in the rain)" {...field} className="text-base" />
                  </FormControl>
                  <FormDescription>
                    Enter a short phrase or sentence in Hindi or English.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Musical Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="Select a musical style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {musicStyles.map(style => (
                        <SelectItem key={style} value={style} className="text-base">
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the genre for your song.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="w-full text-lg" disabled={isLoadingLyrics || isLoadingMusic}>
              {(isLoadingLyrics || isLoadingMusic) && <LoadingSpinner size={20} className="mr-2" />}
              {isLoadingLyrics ? "Generating Lyrics..." : isLoadingMusic ? "Composing Music..." : "Create Song"}
            </Button>
          </form>
        </Form>

        {isLoadingLyrics && !lyrics && (
          <div className="mt-8 text-center">
            <LoadingSpinner size={48} />
            <p className="mt-2 text-muted-foreground font-body">Crafting your lyrical masterpiece...</p>
          </div>
        )}

        {lyrics && (
          <Card className="mt-8 bg-background/70">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><FileText className="text-primary" /> Generated Lyrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={lyrics} readOnly rows={10} className="text-base font-body whitespace-pre-wrap bg-white" />
            </CardContent>
            {isLoadingMusic && (
              <CardFooter className="flex-col items-center text-center">
                <LoadingSpinner size={36} />
                <p className="mt-2 text-muted-foreground font-body">Composing the perfect tune...</p>
              </CardFooter>
            )}
          </Card>
        )}

        {musicDescription && (
           <Card className="mt-8 bg-background/70">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Music className="text-primary" /> Music Composition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base font-body">{musicDescription}</p>
              {musicDataUri && (
                 <div className="p-4 border border-dashed rounded-md bg-muted/50">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>AI music generation is currently descriptive. Actual audio playback is not available.</span>
                    </p>
                    {/* You could show a disabled audio player or similar placeholder */}
                    {/* <audio controls src={musicDataUri} className="w-full mt-2" disabled /> */}
                 </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {isSongGenerated && (
          <Card className="mt-8 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Save className="text-primary"/> Save Your Song</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormItem>
                <FormLabel htmlFor="songTitle" className="text-lg">Song Title</FormLabel>
                <Input 
                  id="songTitle" 
                  value={songTitle} 
                  onChange={(e) => setSongTitle(e.target.value)} 
                  placeholder="Enter a title for your song"
                  className="text-base"
                />
              </FormItem>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSong} size="lg" className="w-full text-lg" disabled={!songTitle.trim()}>
                Save Song to Library
              </Button>
            </CardFooter>
          </Card>
        )}

      </CardContent>
    </Card>
  );
}
