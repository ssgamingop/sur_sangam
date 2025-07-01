
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { generateHindiLyrics } from "@/ai/flows/generate-hindi-lyrics";
import { composeMusic } from "@/ai/flows/compose-music-from-lyrics";
import { suggestLyricImprovements } from "@/ai/flows/suggest-lyric-improvements";
import { suggestMusicStyle } from "@/ai/flows/suggest-music-style";
import { suggestViralIdeas } from "@/ai/flows/suggest-viral-ideas";
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
import { Sparkles, Music, FileText, Download, Lightbulb, Copy } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(5, { message: "Prompt must be at least 5 characters." }).max(200),
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
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isLoadingMusic, setIsLoadingMusic] = useState(false);
  const [isImprovingLyrics, setIsImprovingLyrics] = useState(false);
  const [improvementRequest, setImprovementRequest] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentStyle, setCurrentStyle] = useState("");
  const [viralIdeas, setViralIdeas] = useState<string[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLyrics(null);
    setCurrentPrompt(values.prompt);
    setCurrentStyle("");
    setImprovementRequest("");
    setViralIdeas([]);

    setIsLoadingLyrics(true);
    try {
      const lyricsOutput = await generateHindiLyrics({ prompt: values.prompt });
      setLyrics(lyricsOutput.lyrics);
      toast({ title: "Lyrics Generated!", description: "AI has crafted your song's lyrics. Review them and compose the music!" });
    } catch (lyricsError) {
      console.error("Lyrics generation error:", lyricsError);
      toast({ variant: "destructive", title: "Lyrics Error", description: getAiErrorDescription(lyricsError) });
    } finally {
      setIsLoadingLyrics(false);
    }
  }

  const handleComposeMusic = async () => {
    if (!lyrics) {
        toast({ variant: "destructive", title: "Missing Lyrics", description: "Cannot compose music without lyrics." });
        return;
    }
    setIsLoadingMusic(true);
    try {
      toast({ title: "Finding the perfect style..." });
      const styleOutput = await suggestMusicStyle({ lyrics });
      const suggestedStyle = styleOutput.style;
      setCurrentStyle(suggestedStyle);
      toast({ title: "Style Found!", description: `Composing in style: ${suggestedStyle}` });

      const musicOutput = await composeMusic({ lyrics, style: suggestedStyle, title: currentPrompt });
      
      const newSong: Song = {
        id: crypto.randomUUID(),
        title: currentPrompt,
        prompt: currentPrompt,
        lyrics,
        style: suggestedStyle,
        musicDataUri: musicOutput.musicDataUri,
        musicDescription: musicOutput.description,
        createdAt: new Date().toISOString(),
      };
      onSongSaved(newSong);

      toast({ title: "Music Composed & Saved!", description: "Your new song is in your library." });
    } catch (musicError) {
      console.error("Music composition error:", musicError);
      toast({ variant: "destructive", title: "Music Error", description: getAiErrorDescription(musicError) });
    } finally {
      setIsLoadingMusic(false);
    }
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
    if (!lyrics || !currentPrompt.trim()) {
      toast({ variant: "destructive", title: "Cannot Download", description: "Missing lyrics or a song title." });
      return;
    }
    const blob = new Blob([lyrics], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentPrompt.trim().replace(/ /g, '_')}-lyrics.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Lyrics Download Started", description: "Check your downloads folder." });
  };

  const handleSuggestImprovements = async () => {
    if (!lyrics || !improvementRequest.trim()) {
      toast({ variant: "destructive", title: "Cannot Improve", description: "Lyrics or improvement request is missing." });
      return;
    }
    setIsImprovingLyrics(true);
    try {
      const result = await suggestLyricImprovements({
        lyrics,
        improvementRequest,
      });
      setLyrics(result.improvedLyrics);
      toast({ title: "Lyrics Improved!", description: "The AI has revised your lyrics. You can now compose music with them." });
    } catch (error) {
      console.error("Lyric improvement error:", error);
      toast({ variant: "destructive", title: "Improvement Error", description: getAiErrorDescription(error) });
    } finally {
      setIsImprovingLyrics(false);
    }
  };

  const handleSuggestIdeas = async () => {
    setIsLoadingIdeas(true);
    setViralIdeas([]);
    try {
      const result = await suggestViralIdeas();
      setViralIdeas(result.ideas);
    } catch (error) {
      console.error("Viral idea suggestion error:", error);
      toast({ variant: "destructive", title: "Suggestion Error", description: getAiErrorDescription(error) });
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const handleUseIdea = (idea: string) => {
    form.setValue('prompt', idea);
    setViralIdeas([]); // Hide suggestions after one is chosen
  };

  const isBusy = isLoadingLyrics || isLoadingMusic || isImprovingLyrics || isLoadingIdeas;

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-2"><Sparkles className="text-primary" /> Create Your Song</CardTitle>
        <CardDescription>Enter a few words, and let AI create a Hindi song for you in two simple steps!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-lg">Step 1: Your Song Idea (Prompt)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., बारिश में एक कप चाय" {...field} className="text-base" disabled={isBusy} />
                    </FormControl>
                    <FormDescription>
                        Enter a short phrase or sentence in Hindi or English.
                    </FormDescription>

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSuggestIdeas}
                        disabled={isLoadingIdeas || isLoadingLyrics}
                      >
                        {isLoadingIdeas ? <LoadingSpinner size={16} className="mr-2" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                        {isLoadingIdeas ? 'Getting Ideas...' : 'Need inspiration? Suggest ideas'}
                      </Button>
                      {viralIdeas.length > 0 && (
                        <div className="mt-4 space-y-2 p-4 border rounded-md bg-background/50">
                          <p className="text-sm font-medium text-muted-foreground">Click an idea to use it:</p>
                          <div className="flex flex-wrap gap-2">
                            {viralIdeas.map((idea, index) => (
                              <Button
                                key={index}
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => handleUseIdea(idea)}
                              >
                                {idea}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <FormMessage />
                    </FormItem>
                )}
                />
            <Button type="submit" size="lg" className="w-full text-lg" disabled={isBusy}>
              {isLoadingLyrics && <LoadingSpinner size={20} className="mr-2" />}
              {isLoadingLyrics ? "Generating Lyrics..." : "Generate Lyrics"}
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
                <CardDescription>Review your lyrics below. You can edit them or ask the AI to improve them.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} rows={10} className="text-base font-body whitespace-pre-wrap bg-background/80" />
              </CardContent>
              <CardFooter className="flex-wrap gap-2">
                <Button onClick={handleCopyLyrics} variant="outline" disabled={!lyrics}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Lyrics
                </Button>
                <Button onClick={handleDownloadLyrics} variant="outline" disabled={!lyrics || !currentPrompt.trim()}>
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
                  Suggest Improvements
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-8 border-primary border-2 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2"><Music className="text-primary" /> Step 2: Compose Music & Save</CardTitle>
                    <CardDescription>Happy with the lyrics? Let Suno AI compose the music. The song will be saved to your library automatically!</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleComposeMusic} size="lg" className="w-full text-lg" disabled={isBusy || !lyrics}>
                        {isLoadingMusic && <LoadingSpinner size={20} className="mr-2" />}
                        {isLoadingMusic ? "Composing & Saving..." : "Compose & Save to Library"}
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
                  {currentStyle && <p className="mt-2 text-sm text-primary font-bold">Style: {currentStyle}</p>}
                </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
