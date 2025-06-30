'use server';

/**
 * @fileOverview This file defines a Genkit flow for composing music from Hindi lyrics using the Suno API.
 *
 * It exports:
 * - `ComposeMusicInput`: The input type for the composeMusic function.
 * - `ComposeMusicOutput`: The output type for the composeMusic function.
 * - `composeMusic`: The function to call to compose music from lyrics.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Helper function to cause a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ComposeMusicInputSchema = z.object({
  lyrics: z.string().describe('The Hindi lyrics to compose music for.'),
  style: z.string().describe('The musical style tags for Suno, e.g., "Bollywood, pop, male singer".'),
  title: z.string().describe('The title of the song.'),
});
export type ComposeMusicInput = z.infer<typeof ComposeMusicInputSchema>;

const ComposeMusicOutputSchema = z.object({
  musicDataUri: z
    .string()
    .describe(
      'A data URI containing the composed music, including MIME type and Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  description: z.string().describe('A description of the composed music.'),
});
export type ComposeMusicOutput = z.infer<typeof ComposeMusicOutputSchema>;

export async function composeMusic(input: ComposeMusicInput): Promise<ComposeMusicOutput> {
  return composeMusicFlow(input);
}

const composeMusicFlow = ai.defineFlow(
  {
    name: 'composeMusicFlow',
    inputSchema: ComposeMusicInputSchema,
    outputSchema: ComposeMusicOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.SUNO_API_KEY;
    if (!apiKey) {
      throw new Error('SUNO_API_KEY is not set in the environment variables.');
    }

    // Step 1: Initiate song generation
    const generateResponse = await fetch('https://studio-api.suno.ai/api/generate/v2/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        "gpt_description_prompt": input.lyrics,
        "prompt": "", // custom mode takes lyrics from gpt_description_prompt
        "make_instrumental": false,
        "mv": "chirp-v3-0",
        "title": input.title,
        "tags": input.style,
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`Suno API generation failed: ${generateResponse.status} ${errorText}`);
    }

    const generateData = await generateResponse.json();
    const clipIds = generateData.clips.map((clip: any) => clip.id);

    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 24; // 24 attempts * 5 seconds = 120 seconds max wait time
    let audioUrl: string | null = null;

    while (attempts < maxAttempts) {
      await sleep(5000); // Wait 5 seconds between polls
      attempts++;

      const feedResponse = await fetch(`https://studio-api.suno.ai/api/feed/?ids=${clipIds.join(',')}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!feedResponse.ok) {
        // Continue polling even if one check fails, but log it
        console.warn(`Suno API polling failed: ${feedResponse.status}`);
        continue;
      }

      const feedData = await feedResponse.json();
      
      // Find the first completed clip
      const completedClip = feedData.find((clip: any) => clip.status === 'complete');

      if (completedClip) {
        audioUrl = completedClip.audio_url;
        break; // Exit loop once a song is ready
      }

      // Check for errors
      const erroredClip = feedData.find((clip: any) => clip.status === 'error');
      if (erroredClip) {
          throw new Error(`Suno song generation failed for clip ${erroredClip.id}.`);
      }
    }

    if (!audioUrl) {
      throw new Error('Suno song generation timed out after 2 minutes.');
    }

    // Step 3: Download the audio and convert to data URI
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
        throw new Error(`Failed to download audio from Suno: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const musicDataUri = `data:audio/mpeg;base64,${audioBase64}`;

    return {
      musicDataUri: musicDataUri,
      description: 'Music composed with the Suno API.',
    };
  }
);
