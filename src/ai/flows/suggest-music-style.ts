'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a musical style for given lyrics.
 *
 * It analyzes the lyrics and suggests a style that would be suitable and potentially go viral.
 * - `SuggestMusicStyleInput`: The input type for the suggestMusicStyle function.
 * - `SuggestMusicStyleOutput`: The output type for the suggestMusicStyle function.
 * - `suggestMusicStyle`: The function to call to get a style suggestion.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMusicStyleInputSchema = z.object({
  lyrics: z.string().describe('The Hindi song lyrics.'),
});
export type SuggestMusicStyleInput = z.infer<typeof SuggestMusicStyleInputSchema>;

const SuggestMusicStyleOutputSchema = z.object({
  style: z
    .string()
    .min(15)
    .max(200)
    .describe(
      'A detailed, comma-separated list of musical style tags for Suno, between 15 and 200 characters. e.g., "High-energy Bollywood dance track, synth melody, powerful female singer".'
    ),
});
export type SuggestMusicStyleOutput = z.infer<typeof SuggestMusicStyleOutputSchema>;

export async function suggestMusicStyle(input: SuggestMusicStyleInput): Promise<SuggestMusicStyleOutput> {
  return suggestMusicStyleFlow(input);
}

const suggestMusicStylePrompt = ai.definePrompt({
  name: 'suggestMusicStylePrompt',
  input: {schema: SuggestMusicStyleInputSchema},
  output: {schema: SuggestMusicStyleOutputSchema},
  prompt: `You are an innovative music producer and A&R expert, known for creating groundbreaking fusion tracks that go viral. Your task is to analyze the provided Hindi lyrics and craft a highly detailed, imaginative, and specific musical style description for the Suno API.

The style description MUST be a comma-separated list of tags, between 15 and 200 characters.

**Your Goal:** Go beyond generic genre labels. Think about creating a unique sonic identity for the song. Combine genres, specify moods, describe unique instrumentation, and define the vocal character.

**Consider these elements:**
-   **Genre Fusion:** Don't just say "Pop". Say "Indie pop with lo-fi hip hop beats" or "Traditional folk melody with electronic undertones".
-   **Instrumentation:** Be specific. Instead of "guitar", say "clean electric guitar riff" or "distorted bassline". Mention specific Indian instruments like "sarangi drone", "dholak loop", or "bansuri melody".
-   **Vocal Style:** Go beyond "male singer". Describe the delivery: "soulful, breathy male vocals", "energetic, anthemic female chorus", or "introspective, raw rap flow".
-   **Mood & Atmosphere:** Use evocative words: "rainy day cafe vibe", "late-night drive atmosphere", "epic cinematic build-up", "intimate and melancholic".

**Example of High-Quality Output:**
-   For sad lyrics: "Lo-fi beat, melancholic piano, gentle rain sounds, soft female vocals, introspective mood"
-   For energetic lyrics: "Energetic Bhangra dhol beat, synth bass, epic shehnai hook, powerful male vocalist, celebratory anthem"

**Lyrics to Analyze:**
{{{lyrics}}}

Based on these lyrics, create the most creative and effective musical style description possible.
  `,
});

const suggestMusicStyleFlow = ai.defineFlow(
  {
    name: 'suggestMusicStyleFlow',
    inputSchema: SuggestMusicStyleInputSchema,
    outputSchema: SuggestMusicStyleOutputSchema,
  },
  async input => {
    const {output} = await suggestMusicStylePrompt(input);
    return output!;
  }
);
