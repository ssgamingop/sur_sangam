import { config } from 'dotenv';
config();

import '@/ai/flows/generate-hindi-lyrics.ts';
import '@/ai/flows/suggest-lyric-improvements.ts';
import '@/ai/flows/compose-music-from-lyrics.ts';
import '@/ai/flows/suggest-music-style.ts';
import '@/ai/flows/suggest-viral-ideas.ts';
