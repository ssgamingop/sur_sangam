'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting improvements to Hindi song lyrics.
 *
 * The flow takes user-provided lyrics and a request for improvements, then leverages an AI model
 * to suggest alternative phrasings or enhancements while preserving the original theme and sentiment.
 *
 * @interface SuggestLyricImprovementsInput - Input for the suggestLyricImprovements function, including the original lyrics and improvement requests.
 * @interface SuggestLyricImprovementsOutput - Output of the suggestLyricImprovements function, providing the improved lyrics.
 * @function suggestLyricImprovements - A function that calls the suggestLyricImprovementsFlow to generate improved lyrics.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const SuggestLyricImprovementsInputSchema = z.object({
  lyrics: z.string().describe('The original Hindi song lyrics to be improved.'),
  improvementRequest: z
    .string()
    .describe('Specific requests for improving the lyrics, such as rhyming, theme, or sentiment.'),
});
export type SuggestLyricImprovementsInput = z.infer<typeof SuggestLyricImprovementsInputSchema>;

// Define the output schema for the flow
const SuggestLyricImprovementsOutputSchema = z.object({
  improvedLyrics: z.string().describe('The improved Hindi song lyrics.'),
});
export type SuggestLyricImprovementsOutput = z.infer<typeof SuggestLyricImprovementsOutputSchema>;

// Exported function to call the flow
export async function suggestLyricImprovements(input: SuggestLyricImprovementsInput): Promise<SuggestLyricImprovementsOutput> {
  return suggestLyricImprovementsFlow(input);
}

// Define the prompt for lyric improvement
const suggestLyricImprovementsPrompt = ai.definePrompt({
  name: 'suggestLyricImprovementsPrompt',
  input: {schema: SuggestLyricImprovementsInputSchema},
  output: {schema: SuggestLyricImprovementsOutputSchema},
  prompt: `You are a professional Hindi songwriter tasked with improving existing song lyrics.

        Original Lyrics: {{{lyrics}}}
        Improvement Request: {{{improvementRequest}}}

        Please suggest improved lyrics that maintain the original theme and sentiment while addressing the specific improvement request. The improved lyrics should still be in Hindi. Return only the lyrics, with no extra formatting or commentary.

        Improved Lyrics:`,
});

// Define the Genkit flow for suggesting lyric improvements
const suggestLyricImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestLyricImprovementsFlow',
    inputSchema: SuggestLyricImprovementsInputSchema,
    outputSchema: SuggestLyricImprovementsOutputSchema,
  },
  async input => {
    const {output} = await suggestLyricImprovementsPrompt(input);
    return output!;
  }
);
