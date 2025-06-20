export type MusicStyle = 'Bollywood' | 'Classical' | 'Devotional';

export interface Song {
  id: string;
  title: string;
  prompt: string;
  lyrics: string;
  style: MusicStyle;
  musicDataUri: string; // This is a placeholder URI as per AI flow
  musicDescription: string;
  createdAt: string; // ISO date string
}
