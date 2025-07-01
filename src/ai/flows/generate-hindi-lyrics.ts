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
  prompt: `You are an expert Hindi songwriter and music producer. Your task is to write a complete song based on a user's prompt.

**Instructions:**
1.  The song must have a clear structure: Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Final Chorus, and Outro.
2.  Write the lyrics in Hindi using the Roman script (Hinglish).
3.  Include production notes in parentheses on their own lines, like \`(Soft Piano)\` or \`(Whisper tone)\`. **These notes are for musical direction ONLY and are not part of the sung lyrics.** The AI that will sing this song will ignore anything inside parentheses.
4.  Do NOT include any emojis in your response.

Here is a perfect example of the structure and quality I expect. Use this as your guide:

**Example Song:**

Intro
(Soft Piano + Ambient Pads)
(Whisper tone)
Tu jab aayi, ruka sa waqt tha,
Teri muskaan mein... ek poori dastaan thi.

Verse 1
(Music builds slightly)
Pehli nazar mein kuch toh tha,
Dil ne kaha — yeh wahi hai shayad.
Tere bina jo adhoora tha,
Aaj woh pal bhi poora sa laga.

Chalte-chalte jab tujhse takraya,
Saansein jaise ruk si gayin.
Tere hone ka jo asar tha,
Woh rooh tak utar gayi.

Chorus
(Golden Hook, full melody)
Woh pal, jab tu mere saath thi,
Jaise waqt theher gaya tha wahin.
Har rang usmein dhalne laga,
Jab tu saamne muskura di.
Ooo... woh tera saath tha,
Jaise Khuda ki meharbaani.

Verse 2
(Music softens again)
Chandni raat mein, tere bol jaise,
Koi saaz baja ho dheere-dheere.
Teri baaton mein woh asar tha,
Har gham jaise mit sa gaya.

Tu mili jaise kavita adhoori ko,
Mil gaya koi poora sher.
Tere aane se har khwab mera,
Ab jeene layak ho gaya.

Chorus
(Repeat with Harmony)
Woh pal, jab tu mere saath thi,
Jaise waqt theher gaya tha wahin.
Har rang usmein dhalne laga,
Jab tu saamne muskura di.
Ooo... woh tera saath tha,
Jaise Khuda ki meharbaani.

Bridge
(Softly sung, rising emotion)
Tera naam mere har saans mein,
Teri baat har khamoshi mein.
Tu hai toh hai roshni bhi,
Tere bina sab adhoori si.

Final Chorus
(Epic + Reverb layers)
Woh pal, jab tu mere saath thi,
Jaise waqt theher gaya tha wahin.
Tu hansi aur main kho gaya,
Tere pyaar mein hi main dhal gaya.
Ooo... tera saath tha,
Jaise Khuda ki meharbaani.

Outro
(Piano fading out)
(Spoken whisper)
"Kuch lamhein... hamesha ke liye hote hain."

**Your Task:**

Now, write a new, original song in Hindi (using the Roman script) based on the following user prompt. Follow the exact same structure and style as the example above. Return ONLY the generated song lyrics and nothing else.

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
