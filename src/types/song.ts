export interface Song {
  id: string;
  title: string;
  prompt: string;
  lyrics: string;
  style: string;
  musicDataUri?: string; // This is a placeholder URI as per AI flow
  musicDescription: string;
  createdAt: string; // ISO date string
}
