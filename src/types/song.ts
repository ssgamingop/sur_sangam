export type MusicStyle = 'Bollywood' | 'Classical' | 'Devotional';
export type Voice = 'Vega' | 'Sirius' | 'Spica';

export interface Song {
  id: string;
  title: string;
  prompt: string;
  lyrics: string;
  style: MusicStyle;
  voice: Voice;
  musicDataUri?: string; // This is a placeholder URI as per AI flow
  musicDescription: string;
  createdAt: string; // ISO date string
}
