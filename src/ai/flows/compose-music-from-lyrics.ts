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
import wav from 'wav';

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
      'A data URI containing the composed music, including MIME type and Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  description: z.string().describe('A description of the composed music.'),
});
export type ComposeMusicOutput = z.infer<typeof ComposeMusicOutputSchema>;

export async function composeMusic(input: ComposeMusicInput): Promise<ComposeMusicOutput> {
  return composeMusicFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const descriptionPrompt = ai.definePrompt({
  name: 'composeMusicDescriptionPrompt',
  input: { schema: ComposeMusicInputSchema },
  output: { schema: z.object({ description: z.string().describe('A description of the composed music.') }) },
  prompt: `You are an AI music composer specializing in Hindi music.

You will receive Hindi lyrics and a desired musical style. You will then generate a description of music that complements the lyrics in the specified style.

Lyrics: {{{lyrics}}}
Style: {{{style}}}

Return only a description of the musical composition.`,
});

const composeMusicFlow = ai.defineFlow(
  {
    name: 'composeMusicFlow',
    inputSchema: ComposeMusicInputSchema,
    outputSchema: ComposeMusicOutputSchema,
  },
  async (input) => {
    // 1. Generate the music description.
    const { output: descriptionOutput } = await descriptionPrompt(input);
    if (!descriptionOutput) {
      throw new Error('Failed to generate music description.');
    }
    
    // 2. Generate the audio from lyrics using the Text-to-Speech model.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: input.lyrics,
    });

    if (!media) {
      throw new Error('No audio media was returned from the TTS model.');
    }

    // 3. Convert the raw PCM audio data to a WAV file format.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    const musicDataUri = `data:audio/wav;base64,${wavBase64}`;

    // 4. Return both the description and the audio data URI.
    return {
      description: descriptionOutput.description,
      musicDataUri: musicDataUri,
    };
  }
);
