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
  prompt: `You are an expert music producer with a keen sense of what makes a song go viral.
  Your task is to analyze the following Hindi song lyrics and suggest a detailed musical style description for the Suno API.
  The style should be a detailed, comma-separated list of tags between 15 and 200 characters.
  It should capture the mood, genre, instrumentation, and vocal style.
  For example: "A soulful ghazal with tabla and sitar, melancholic male vocals, slow tempo" or "High-energy Bollywood dance track, dhol beats, synth melody, powerful female singer, celebratory mood".

  Lyrics:
  {{{lyrics}}}

  Based on these lyrics, provide the best musical style description.
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
