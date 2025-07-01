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

/**
 * Cleans raw lyrics text to remove structural markers and production notes,
 * preparing it for the Suno API.
 * @param rawLyrics The original lyrics string with markers.
 * @returns A cleaned string containing only lyrics.
 */
const cleanLyricsForSuno = (rawLyrics: string): string => {
  if (!rawLyrics) return '';
  const lines = rawLyrics.split('\n');
  return lines
    .map(line => line.trim())
    // Filter out section headers like "Verse 1", "Chorus", etc.
    .filter(line => !/^(Verse|Chorus|Intro|Outro|Bridge|Final Chorus)/i.test(line))
    // Filter out lines that are only production notes like "(Soft Piano)"
    .filter(line => !/^\(.*\)$/.test(line))
    .filter(line => line.length > 0)
    .join('\n');
};


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

    const cleanedLyrics = cleanLyricsForSuno(input.lyrics);
    if (!cleanedLyrics) {
        throw new Error("The provided lyrics were empty after removing structural markers. Please provide valid lyrics.");
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
        "prompt": cleanedLyrics,
        "customMode": true,
        "instrumental": false,
        "title": input.title,
        "tags": input.style,
        "model": "V4",
        "callBackUrl": "https://example.com/suno-webhook"
      }),
    });

    const generateResult = await generateResponse.json();

    if (generateResult.code !== 200) {
        throw new Error(`Suno API generation failed: ${generateResult.msg || generateResponse.statusText}`);
    }
    
    const taskId = generateResult.data?.taskId;

    if (!taskId) {
        const errorDetails = generateResult.data ? JSON.stringify(generateResult.data) : 'no data';
        throw new Error(`Suno API did not return a taskId. Response data: ${errorDetails}`);
    }
    
    // Step 2: Poll for completion using the taskId
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 5 seconds = 150 seconds max wait time
    let audioUrl: string | null = null;
    let completedClipData: any = null;

    while (attempts < maxAttempts && !audioUrl) {
      await sleep(5000); // Wait 5 seconds between polls
      attempts++;

      const feedResponse = await fetch(`${BASE_URL}/api/v1/feed/${taskId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      
      if (!feedResponse.ok) {
        console.warn(`Suno API polling for task ${taskId} failed: ${feedResponse.status}`);
        continue;
      }
      
      const feedResult = await feedResponse.json();

      if (feedResult.code !== 200) {
          console.warn(`Suno API polling error for task ${taskId}: ${feedResult.msg}`);
          continue;
      }
      
      // The poll response can contain one or more clips. We find the first completed one.
      const clips = [].concat(feedResult.data || []);

      for (const clipData of clips) {
          if (clipData && clipData.status === 'complete') {
            audioUrl = clipData.audio_url;
            completedClipData = clipData;
            break; // Exit the inner loop once a completed clip is found
          }

          if (clipData && clipData.status === 'error') {
              throw new Error(`Suno song generation failed for clip ${clipData.id}: ${clipData.error_message || 'Unknown error'}`);
          }
      }

      if (audioUrl) break; // Exit the while loop
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
