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

    const BASE_URL = "https://apibox.erweima.ai";

    // Step 1: Initiate song generation
    const generateResponse = await fetch(`${BASE_URL}/api/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        "prompt": input.lyrics,
        "customMode": true,
        "instrumental": false,
        "model": "V3_5",
        "title": input.title,
        "tags": input.style,
        "callBackUrl": "https://example.com/suno-webhook"
      }),
    });

    const generateResult = await generateResponse.json();

    if (generateResult.code !== 200) {
        throw new Error(`Suno API generation failed: ${generateResult.msg || generateResponse.statusText}`);
    }
    
    // The API might return one or two song clips for the same prompt
    const clipIds = generateResult.data.map((clip: any) => clip.id);
    
    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 5 seconds = 150 seconds max wait time
    let audioUrl: string | null = null;
    let completedClipData: any = null;

    while (attempts < maxAttempts && !audioUrl) {
      await sleep(5000); // Wait 5 seconds between polls
      attempts++;

      for (const clipId of clipIds) {
          const feedResponse = await fetch(`${BASE_URL}/api/v1/feed/${clipId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${apiKey}` },
          });
          
          if (!feedResponse.ok) {
            console.warn(`Suno API polling for clip ${clipId} failed: ${feedResponse.status}`);
            continue;
          }
          
          const feedResult = await feedResponse.json();

          if (feedResult.code !== 200) {
              console.warn(`Suno API polling error for clip ${clipId}: ${feedResult.msg}`);
              continue;
          }
          
          const clipData = feedResult.data;

          if (clipData && clipData.status === 'complete') {
            audioUrl = clipData.audio_url;
            completedClipData = clipData;
            break; 
          }

          if (clipData && clipData.status === 'error') {
              throw new Error(`Suno song generation failed for clip ${clipData.id}: ${clipData.error_message || 'Unknown error'}`);
          }
      }
      if (audioUrl) break;
    }

    if (!audioUrl) {
      throw new Error('Suno song generation timed out after 2.5 minutes.');
    }

    // Step 3: Download the audio and convert to data URI
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
        throw new Error(`Failed to download audio from Suno: ${audioResponse.statusText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const musicDataUri = `data:audio/mpeg;base64,${audioBase64}`;

    return {
      musicDataUri: musicDataUri,
      description: completedClipData?.metadata?.prompt || 'Music composed with the Suno API.',
    };
  }
);
