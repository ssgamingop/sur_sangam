'use server';

/**
 * @fileOverview This file defines a Genkit flow for composing music from Hindi lyrics.
 *
 * The flow takes Hindi lyrics and a music style as input and generates music in that style.
 * It exports:
 * - `ComposeMusicInput`: The input type for the composeMusic function.
 * - `ComposeMusicOutput`: The output type for the composeMusic function.
 * - `composeMusic`: The function to call to compose music from lyrics.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComposeMusicInputSchema = z.object({
  lyrics: z.string().describe('The Hindi lyrics to compose music for.'),
  style: z
    .enum(['Bollywood', 'Classical', 'Devotional'])
    .describe('The musical style to compose in.'),
});
export type ComposeMusicInput = z.infer<typeof ComposeMusicInputSchema>;

const ComposeMusicOutputSchema = z.object({
  musicDataUri: z
    .string()
    .describe(
      'A data URI containing the composed music, including MIME type and Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // keeping it as string, as we don't generate music, but rather a description
    ),
  description: z.string().describe('A description of the composed music.'),
});
export type ComposeMusicOutput = z.infer<typeof ComposeMusicOutputSchema>;

export async function composeMusic(input: ComposeMusicInput): Promise<ComposeMusicOutput> {
  return composeMusicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'composeMusicPrompt',
  input: {schema: ComposeMusicInputSchema},
  output: {schema: ComposeMusicOutputSchema},
  prompt: `You are an AI music composer specializing in Hindi music.

You will receive Hindi lyrics and a desired musical style.  You will then generate music that complements the lyrics in the specified style.

Lyrics: {{{lyrics}}}
Style: {{{style}}}

Return a description of the musical composition, and a data URI for the music itself. Since you can't actually compose music, create a placeholder data URI.

`,
});

const composeMusicFlow = ai.defineFlow(
  {
    name: 'composeMusicFlow',
    inputSchema: ComposeMusicInputSchema,
    outputSchema: ComposeMusicOutputSchema,
  },
  async input => {
    // Call the prompt to generate music details
    const {output} = await prompt(input);
    return output!;
  }
);
