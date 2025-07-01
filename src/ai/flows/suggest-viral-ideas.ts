'use server';

/**
 * @fileOverview AI-powered generator for viral song ideas.
 *
 * - suggestViralIdeas - A function that suggests phrases for viral music ideas.
 * - SuggestViralIdeasOutput - The return type for the suggestViralIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestViralIdeasOutputSchema = z.object({
  ideas: z
    .array(z.string())
    .describe('A list of 3-5 short, catchy, and potentially viral song ideas or prompts.'),
});
export type SuggestViralIdeasOutput = z.infer<typeof SuggestViralIdeasOutputSchema>;

export async function suggestViralIdeas(): Promise<SuggestViralIdeasOutput> {
  return suggestViralIdeasFlow();
}

const suggestViralIdeasPrompt = ai.definePrompt({
  name: 'suggestViralIdeasPrompt',
  output: {schema: SuggestViralIdeasOutputSchema},
  prompt: `You are a world-class A&R executive for a major Indian record label, with a golden touch for discovering viral hits for platforms like Instagram Reels and YouTube Shorts. Your task is to generate a list of 3 to 5 highly specific, imaginative, and emotionally resonant song prompts.

These prompts must be:
-   **Catchy and Concise:** No more than 5-7 words.
-   **Culturally Relevant:** A modern mix of Hindi and English (Hinglish) that reflects contemporary Indian youth culture.
-   **Narrative-driven:** Each prompt should hint at a larger story, making listeners curious.
-   **Emotionally Potent:** Tap into powerful, specific feelings like nostalgic melancholy, the bittersweet feeling of a first salary, or the funny frustration of a dead phone battery on a trip. Avoid generic themes like "love" or "sadness".
-   **Primed for Virality:** Think about what makes a sound "loopable" or what would inspire a dance trend or a lip-sync challenge.

Here are examples of the quality I expect:
- "Auto-wala ghosting me" (Humor, Relatability)
- "First salary, empty wallet" (Bittersweet, Relatable)
- "My playlist, her memory" (Nostalgia, Romance)
- "Shaadi season FOMO" (Modern anxiety, Relatable)
- "Airport goodbyes on video call" (Modern long-distance love)

Now, generate a new list of 3 to 5 song ideas following these guidelines.
  `,
});

const suggestViralIdeasFlow = ai.defineFlow(
  {
    name: 'suggestViralIdeasFlow',
    outputSchema: SuggestViralIdeasOutputSchema,
  },
  async () => {
    const {output} = await suggestViralIdeasPrompt({});
    return output!;
  }
);
