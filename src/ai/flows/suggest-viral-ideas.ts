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
  prompt: `You are a creative director for a music label, known for spotting viral trends.
  Generate a list of 3 to 5 short, catchy, and unique song ideas or prompts.
  These prompts should be in a mix of Hindi and English (Hinglish) and cover a range of moods like romantic, funny, energetic, or melancholic.
  The ideas should be relatable and primed for social media success.

  For example:
  - "Last slice of pizza"
  - "My dog is my only friend"
  - "Running into my ex at a wedding"
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
