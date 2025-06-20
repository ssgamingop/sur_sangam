// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview AI-powered Hindi song lyric generator.
 *
 * - generateHindiLyrics - A function that generates Hindi song lyrics based on a user-provided prompt.
 * - GenerateHindiLyricsInput - The input type for the generateHindiLyrics function.
 * - GenerateHindiLyricsOutput - The return type for the generateHindiLyrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHindiLyricsInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A short phrase or sentence in Hindi or English to generate lyrics from.'
    ),
  style: z
    .enum(['Bollywood', 'Classical', 'Devotional'])
    .describe('The style of music for the song.')
    .optional(),
});
export type GenerateHindiLyricsInput = z.infer<
  typeof GenerateHindiLyricsInputSchema
>;

const GenerateHindiLyricsOutputSchema = z.object({
  lyrics: z.string().describe('The generated Hindi song lyrics.'),
});
export type GenerateHindiLyricsOutput = z.infer<
  typeof GenerateHindiLyricsOutputSchema
>;

export async function generateHindiLyrics(
  input: GenerateHindiLyricsInput
): Promise<GenerateHindiLyricsOutput> {
  return generateHindiLyricsFlow(input);
}

const generateHindiLyricsPrompt = ai.definePrompt({
  name: 'generateHindiLyricsPrompt',
  input: {schema: GenerateHindiLyricsInputSchema},
  output: {schema: GenerateHindiLyricsOutputSchema},
  prompt: `You are a professional Hindi songwriter. Compose a set of coherent and thematically relevant Hindi song lyrics based on the user provided prompt. The song should be written in the style of {{{style}}}, if a style is given. Pay attention to rhyme and meter, and create a song that is appropriate to be sung. Use traditional poetic devices such as similes, metaphors, alliteration and assonance to elevate the song.

  Prompt: {{{prompt}}}`,
});

const generateHindiLyricsFlow = ai.defineFlow(
  {
    name: 'generateHindiLyricsFlow',
    inputSchema: GenerateHindiLyricsInputSchema,
    outputSchema: GenerateHindiLyricsOutputSchema,
  },
  async input => {
    const {output} = await generateHindiLyricsPrompt(input);
    return output!;
  }
);
