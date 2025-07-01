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
});
export type GenerateHindiLyricsInput = z.infer<
  typeof GenerateHindiLyricsInputSchema
>;

const GenerateHindiLyricsOutputSchema = z.object({
  lyrics: z.string().describe('The generated Hindi song lyrics, including structural markers and production notes.'),
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
  prompt: `You are an expert Hindi songwriter and music producer. Your task is to write a complete song based on a user's prompt. The song must have a clear structure including an Intro, multiple Verses, a recurring Chorus, a Bridge, and an Outro.

You must also include production notes in parentheses, like (Soft Piano) or (Whisper tone), to suggest the musical arrangement and mood for each section.

Here is a perfect example of the structure and quality I expect. Use this as your guide:

**Example Song:**

🕰️ Intro (Soft Piano + Ambient Pads)

(Whisper tone)
तू जब आई, रुका सा वक्त था,
तेरी मुस्कान में... एक पूरी दास्ताँ थी।
🎶 Verse 1

पहली नज़र में कुछ तो था,
दिल ने कहा — ये वही है शायद।
तेरे बिना जो अधूरा था,
आज वो पल भी पूरा सा लगा।

चलते-चलते जब तुझसे टकराया,
सांसें जैसे रुक सी गईं।
तेरे होने का जो असर था,
वो रूह तक उतर गई।
🌅 Chorus (Golden Hook, full melody)

    वो पल, जब तू मेरे साथ थी,
    जैसे वक्त ठहर गया था वहीं।
    हर रंग उसमें ढलने लगा,
    जब तू सामने मुस्कुरा दी।
    ओओ... वो तेरा साथ था,
    जैसे खुदा की मेहरबानी।

🎶 Verse 2

चाँदनी रात में, तेरे बोल जैसे,
कोई साज बजा हो धीरे-धीरे।
तेरी बातों में वो असर था,
हर ग़म जैसे मिट सा गया।

तू मिली जैसे कविता अधूरी को,
मिल गया कोई पूरा शेर।
तेरे आने से हर ख्वाब मेरा,
अब जीने लायक हो गया।
🌅 Chorus (Repeat with Harmony)

    वो पल, जब तू मेरे साथ थी,
    जैसे वक्त ठहर गया था वहीं।
    हर रंग उसमें ढलने लगा,
    जब तू सामने मुस्कुरा दी।
    ओओ... वो तेरा साथ था,
    जैसे खुदा की मेहरबानी।

🌌 Bridge (Softly sung, rising emotion)

तेरा नाम मेरे हर साँस में,
तेरी बात हर खामोशी में।
तू है तो है रोशनी भी,
तेरे बिना सब अधूरी सी।
🌅 Final Chorus (Epic + Reverb layers)

    वो पल, जब तू मेरे साथ थी,
    जैसे वक्त ठहर गया था वहीं।
    तू हँसी और मैं खो गया,
    तेरे प्यार में ही मैं ढल गया।
    ओओ... तेरा साथ था,
    जैसे खुदा की मेहरबानी।

🎧 Outro (Piano fading out)

(Spoken whisper)
"कुछ लम्हें... हमेशा के लिए होते हैं।"

**Your Task:**

Now, write a new, original song in Hindi (using the Roman script) based on the following user prompt. Follow the exact same structure and style as the example above. Return only the generated song lyrics and nothing else.

**User Prompt:** {{{prompt}}}
`,
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
