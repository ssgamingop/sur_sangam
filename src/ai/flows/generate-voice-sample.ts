'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a voice sample.
 *
 * It takes a voice name and sample text and returns the audio data.
 * - `GenerateVoiceSampleInput`: The input type for the generateVoiceSample function.
 * - `GenerateVoiceSampleOutput`: The output type for the generateVoiceSample function.
 * - `generateVoiceSample`: The function to call to generate a voice sample.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateVoiceSampleInputSchema = z.object({
  voice: z
    .enum(['Vega', 'Sirius', 'Spica'])
    .describe('The voice for the text-to-speech model.'),
  text: z.string().describe('The sample text to be spoken.'),
});
export type GenerateVoiceSampleInput = z.infer<
  typeof GenerateVoiceSampleInputSchema
>;

const GenerateVoiceSampleOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A data URI containing the voice sample, including MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateVoiceSampleOutput = z.infer<
  typeof GenerateVoiceSampleOutputSchema
>;

export async function generateVoiceSample(
  input: GenerateVoiceSampleInput
): Promise<GenerateVoiceSampleOutput> {
  return generateVoiceSampleFlow(input);
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

const generateVoiceSampleFlow = ai.defineFlow(
  {
    name: 'generateVoiceSampleFlow',
    inputSchema: GenerateVoiceSampleInputSchema,
    outputSchema: GenerateVoiceSampleOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: input.voice},
          },
        },
      },
      prompt: input.text,
    });

    if (!media) {
      throw new Error('No audio media was returned from the TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    const audioDataUri = `data:audio/wav;base64,${wavBase64}`;

    return {
      audioDataUri,
    };
  }
);
