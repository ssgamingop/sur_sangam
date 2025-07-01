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
  prompt: `You are an expert music producer who creates viral hits. Analyze the provided Hindi lyrics and generate a comma-separated list of musical style tags for the Suno API.

**IMPORTANT:** The entire output string MUST be between 15 and 200 characters. Be descriptive but concise.

Think about genre fusion, instrumentation, vocal style, and mood.

**Good Example:**
"Lo-fi beat, melancholic piano, gentle rain, soft female vocals, introspective mood"

**Bad Example (too long):**
"This song should start with a very sad and lonely sounding piano melody, then bring in some soft, atmospheric pads. The vocals should be breathy and full of emotion, almost like a whisper. For percussion, a simple lo-fi hip hop beat would fit perfectly."

**Lyrics to Analyze:**
{{{lyrics}}}

Generate the style tags now.
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
