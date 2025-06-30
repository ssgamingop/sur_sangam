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
    .describe(
      'A comma-separated list of musical style tags suitable for Suno, e.g., "Bollywood, pop, male singer, upbeat".'
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
  Your task is to analyze the following Hindi song lyrics and suggest the perfect musical style for it.
  The style should be a short, comma-separated list of tags that the Suno API can understand.
  Consider the mood, theme, and rhythm of the lyrics. Suggest a style that would sound best and have the potential to be a hit.
  For example: "Bollywood pop, upbeat, male singer" or "Sad ballad, acoustic, female singer" or "Sufi rock, powerful vocals".

  Lyrics:
  {{{lyrics}}}

  Based on these lyrics, provide the best musical style.
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
