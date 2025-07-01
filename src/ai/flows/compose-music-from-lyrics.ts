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
    const generateResponse = await fetch('https://suno-api-sigma.vercel.app/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        "prompt": input.lyrics,
        "make_instrumental": false,
        "wait_audio": false,
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
    const clipIds = generateData.map((clip: any) => clip.id);

    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 24; // 24 attempts * 5 seconds = 120 seconds max wait time
    let audioUrl: string | null = null;

    while (attempts < maxAttempts && !audioUrl) {
      await sleep(5000); // Wait 5 seconds between polls
      attempts++;

      for (const clipId of clipIds) {
          const feedResponse = await fetch(`https://suno-api-sigma.vercel.app/api/feed/${clipId}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
          });

          if (!feedResponse.ok) {
            console.warn(`Suno API polling for clip ${clipId} failed: ${feedResponse.status}`);
            continue; // Try the next clip
          }
          
          const feedData = await feedResponse.json(); // This is now a single clip object

          if (Array.isArray(feedData) && feedData.some(clip => clip.status === 'complete')) {
             const completedClip = feedData.find(clip => clip.status === 'complete');
             if(completedClip) {
                audioUrl = completedClip.audio_url;
                break;
             }
          }

          if (feedData.status === 'complete') {
            audioUrl = feedData.audio_url;
            break; // Exit the inner for loop
          }

          if (feedData.status === 'error') {
              throw new Error(`Suno song generation failed for clip ${feedData.id}.`);
          }
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
