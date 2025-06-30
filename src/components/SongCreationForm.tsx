"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { generateHindiLyrics } from "@/ai/flows/generate-hindi-lyrics";
import { composeMusic } from "@/ai/flows/compose-music-from-lyrics";
import { suggestLyricImprovements } from "@/ai/flows/suggest-lyric-improvements";
import type { Song } from "@/types/song";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./LoadingSpinner";
import { Sparkles, Music, Save, FileText, Download, Lightbulb, Copy } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(5, { message: "Prompt must be at least 5 characters." }).max(200),
  style: z.string().min(3, { message: "Style must be at least 3 characters." }),
});

interface SongCreationFormProps {
  onSongSaved: (song: Song) => void;
}

function getAiErrorDescription(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('429') || error.message.toLowerCase().includes('quota')) {
      return 'You have exceeded the daily free API limit. Please try again tomorrow.';
    }
    if (error.message.includes('SUNO_API_KEY')) {
        return 'The Suno API key is missing. Please ask the developer to configure it.';
    }
  }
  return 'An unexpected error occurred. Please try again later.';
}

export function SongCreationForm({ onSongSaved }: SongCreationFormProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [musicDescription, setMusicDescription] = useState<string | null>(null);
  const [musicDataUri, setMusicDataUri] = useState<string | null>(null);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const [isImprovingLyrics, setIsImprovingLyrics] = useState(false);
  const [improvementRequest, setImprovementRequest] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentStyle, setCurrentStyle] = useState("");
  
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      style: 'Bollywood pop',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLyrics(null);
    setMusicDescription(null);
    setMusicDataUri(null);
    setSongTitle(values.prompt); // Default title
    setCurrentPrompt(values.prompt);
    setCurrentStyle(values.style);
    setImprovementRequest("");

    setIsLoadingLyrics(true);
    try {
      const lyricsOutput = await generateHindiLyrics({ prompt: values.prompt, style: values.style });
      setLyrics(lyricsOutput.lyrics);
      toast({ title: "Lyrics Generated!", description: "AI has crafted your song's lyrics." });

      setIsLoadingMusic(true);
      try {
        const musicOutput = await composeMusic({ lyrics: lyricsOutput.lyrics, style: values.style, title: values.prompt });
        setMusicDescription(musicOutput.description);
        setMusicDataUri(musicOutput.musicDataUri);
        toast({ title: "Music Composed!", description: "Your song is ready to be played." });
      } catch (musicError) {
        console.error("Music composition error:", musicError);
        toast({ variant: "destructive", title: "Music Error", description: getAiErrorDescription(musicError) });
      } finally {
        setIsLoadingMusic(false);
      }
    } catch (lyricsError) {
      console.error("Lyrics generation error:", lyricsError);
      toast({ variant: "destructive", title: "Lyrics Error", description: getAiErrorDescription(lyricsError) });
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
      musicDataUri: musicDataUri || "",
      musicDescription,
      createdAt: new Date().toISOString(),
    };
    onSongSaved(newSong);
    toast({ title: "Song Saved!", description: `"${songTitle}" has been added to your library.` });
  };
  
  const handleCopyLyrics = () => {
    if (!lyrics) {
      toast({ variant: "destructive", title: "Cannot Copy", description: "No lyrics available to copy." });
      return;
    }
    navigator.clipboard.writeText(lyrics).then(() => {
      toast({ title: "Lyrics Copied!", description: "The lyrics have been copied to your clipboard." });
    }).catch(err => {
      console.error("Could not copy lyrics: ", err);
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy lyrics to clipboard." });
    });
  };

  const handleDownloadLyrics = () => {
    if (!lyrics || !songTitle.trim()) {
      toast({ variant: "destructive", title: "Cannot Download", description: "Missing lyrics or a song title." });
      return;
    }
    const blob = new Blob([lyrics], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${songTitle.trim().replace(/ /g, '_')}-lyrics.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Lyrics Download Started", description: "Check your downloads folder." });
  };

  const handleDownloadMusic = () => {
    if (!musicDataUri || !songTitle.trim()) {
      toast({ variant: "destructive", title: "Cannot Download", description: "Missing music or a song title." });
      return;
    }
    const link = document.createElement('a');
    link.href = musicDataUri;
    link.download = `${songTitle.trim().replace(/ /g, '_')}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Music Download Started", description: "Check your downloads folder." });
  };

  const handleSuggestImprovements = async () => {
    if (!lyrics || !improvementRequest.trim()) {
      toast({ variant: "destructive", title: "Cannot Improve", description: "Lyrics or improvement request is missing." });
      return;
    }
    setIsImprovingLyrics(true);
    // Clear old music
    setMusicDescription(null);
    setMusicDataUri(null);
    try {
      const result = await suggestLyricImprovements({
        lyrics,
        improvementRequest,
      });
      setLyrics(result.improvedLyrics);
      toast({ title: "Lyrics Improved!", description: "The AI has revised your lyrics. Re-composing music..." });

      // Re-compose music with new lyrics
      setIsLoadingMusic(true);
      try {
        const musicOutput = await composeMusic({ lyrics: result.improvedLyrics, style: currentStyle, title: songTitle });
        setMusicDescription(musicOutput.description);
        setMusicDataUri(musicOutput.musicDataUri);
        toast({ title: "Music Re-Composed!", description: "Your song has been updated with the new lyrics." });
      } catch (musicError) {
        console.error("Music re-composition error:", musicError);
        toast({ variant: "destructive", title: "Music Error", description: getAiErrorDescription(musicError) });
      } finally {
        setIsLoadingMusic(false);
      }
    } catch (error) {
      console.error("Lyric improvement error:", error);
      toast({ variant: "destructive", title: "Improvement Error", description: getAiErrorDescription(error) });
    } finally {
      setIsImprovingLyrics(false);
    }
  };

  const isSongGenerated = lyrics && musicDescription;
  const isBusy = isLoadingLyrics || isLoadingMusic || isImprovingLyrics;

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-2"><Sparkles className="text-primary" /> Create Your Song</CardTitle>
        <CardDescription>Enter a few words, choose a style, and let AI create a Hindi song for you!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-lg">Your Song Idea (Prompt)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., बारिश में एक कप चाय" {...field} className="text-base" />
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
                        <FormControl>
                            <Input placeholder="e.g., Bollywood, pop, male singer" {...field} className="text-base" />
                        </FormControl>
                        <FormDescription>
                            Enter style tags for Suno.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <Button type="submit" size="lg" className="w-full text-lg" disabled={isBusy}>
              {isBusy && <LoadingSpinner size={20} className="mr-2" />}
              {isLoadingLyrics ? "Generating Lyrics..." : isLoadingMusic ? "Composing Music..." : isImprovingLyrics ? "Improving Lyrics..." : "Create Song"}
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
          <>
            <Card className="mt-8 bg-background/70">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2"><FileText className="text-primary" /> Generated Lyrics</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={10} className="text-base font-body whitespace-pre-wrap bg-background/80" />
              </CardContent>
              <CardFooter className="flex-wrap gap-2">
                <Button onClick={handleCopyLyrics} variant="outline" disabled={!lyrics}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Lyrics
                </Button>
                <Button onClick={handleDownloadLyrics} variant="outline" disabled={!lyrics || !songTitle.trim()}>
                  <Download className="mr-2 h-4 w-4" /> Download Lyrics (.txt)
                </Button>
              </CardFooter>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2"><Lightbulb className="text-primary" /> Improve Your Lyrics</CardTitle>
                <CardDescription>Not quite right? Give the AI some feedback to revise the lyrics.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="improvementRequest">Your Improvement Request</Label>
                  <Textarea 
                    id="improvementRequest"
                    placeholder="e.g., 'Make the chorus rhyme better' or 'Add a verse about hope'"
                    value={improvementRequest}
                    onChange={(e) => setImprovementRequest(e.target.value)}
                    className="text-base"
                  />
                 </div>
                <Button onClick={handleSuggestImprovements} disabled={isBusy || !improvementRequest.trim()} className="w-full">
                  {isImprovingLyrics && <LoadingSpinner size={20} className="mr-2" />}
                  Suggest & Re-Compose
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {isLoadingMusic && (
          <Card className="mt-8 bg-background/70">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Music className="text-primary" /> Composing Music...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-10">
                <div className="flex flex-col items-center text-center w-full">
                  <LoadingSpinner size={48} />
                  <p className="mt-4 text-muted-foreground font-body">Composing with Suno... this may take a minute.</p>
                </div>
            </CardContent>
          </Card>
        )}

        {isSongGenerated && (
           <Card className="mt-8 bg-background/70">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Music className="text-primary" /> Music Composition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base font-body">{musicDescription}</p>
              {musicDataUri && (
                 <div className="mt-4">
                    <audio controls src={musicDataUri} className="w-full">
                        Your browser does not support the audio element.
                    </audio>
                 </div>
              )}
            </CardContent>
            {musicDataUri && (
              <CardFooter>
                <Button onClick={handleDownloadMusic} variant="outline" disabled={!songTitle.trim()}>
                  <Download className="mr-2 h-4 w-4" /> Download Music (.mp3)
                </Button>
              </CardFooter>
            )}
          </Card>
        )}
        
        {isSongGenerated && (
          <Card className="mt-8 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2"><Save className="text-primary"/> Save Your Song</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="songTitle">Song Title</Label>
                <Input 
                  id="songTitle" 
                  value={songTitle} 
                  onChange={(e) => setSongTitle(e.target.value)} 
                  placeholder="Enter a title for your song"
                  className="text-base"
                />
              </div>
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
