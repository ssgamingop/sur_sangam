
# Sur Sangam - AI-Powered Hindi Song Creation Platform

Create beautiful Hindi songs with the power of AI. Sur Sangam is a modern web application that helps you generate original Hindi lyrics, compose music, and refine your creations with intelligent suggestions.

## 🎵 Features

- **Hindi Lyrics Generation**: Generate original Hindi lyrics based on your creative prompts
- **Music Composition**: Transform lyrics into complete musical compositions
- **Lyric Improvement**: Get AI-powered suggestions to enhance your lyrics
- **Music Style Customization**: Choose and customize music styles to match your vision
- **Viral Content Ideas**: Receive suggestions for making your songs more engaging
- **Local Storage**: Save all your creations locally in your browser
- **Dark Mode Support**: Comfortable theme switching for extended sessions
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🚀 Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **UI Components**: Radix UI + Shadcn/ui
- **AI Integration**: Google Genkit for LLM capabilities
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form with Zod validation
- **Storage**: Browser localStorage for persistent song storage
- **State Management**: React hooks

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Environment variables configured (see setup below)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sur_sangam
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
GOOGLE_GENKIT_API_KEY=your_genkit_api_key
SUNO_API_KEY=your_suno_api_key
```

## 🏃 Getting Started

### Development Server

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Genkit AI Development

To develop and test the AI flows:
```bash
npm run genkit:dev
# or with file watching
npm run genkit:watch
```

### Production Build

Build for production:
```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main application page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── ai/                    # AI integration layer
│   ├── dev.ts             # Development entry point for flows
│   ├── genkit.ts          # Genkit configuration
│   └── flows/             # AI processing flows
│       ├── generate-hindi-lyrics.ts
│       ├── suggest-lyric-improvements.ts
│       ├── compose-music-from-lyrics.ts
│       ├── suggest-music-style.ts
│       └── suggest-viral-ideas.ts
├── components/            # React components
│   ├── SongCreationForm.tsx    # Main form for song creation
│   ├── SavedSongsList.tsx      # Display user's saved songs
│   ├── AppHeader.tsx           # Application header
│   ├── LoadingSpinner.tsx      # Loading state component
│   └── ui/                     # Reusable UI components
├── lib/                   # Utility functions
│   ├── songsStorage.ts    # LocalStorage operations for songs
│   └── utils.ts           # General utilities
├── hooks/                 # Custom React hooks
│   └── use-toast.ts       # Toast notification hook
├── types/                 # TypeScript type definitions
│   └── song.ts           # Song interface definition
```

## 🎯 Core Features Explained

### Song Creation Flow

1. **Generate Lyrics**: Input a prompt to create original Hindi lyrics using Google Genkit
2. **Refine Lyrics**: Request AI-powered improvements on specific aspects
3. **Compose Music**: Convert your lyrics into musical compositions
4. **Customize Style**: Select and customize the music style
5. **Get Ideas**: Receive suggestions for improving virality and engagement
6. **Save**: Store your creation locally for future reference

### Data Persistence

Songs are stored in the browser's localStorage with the following structure:
- Unique ID
- Title
- Original prompt
- Generated lyrics
- Music style
- Music data URI
- Creation timestamp

## 🔧 Configuration

### Tailwind CSS

Customization available in `tailwind.config.ts`. The project includes:
- Custom color schemes with dark mode support
- Typography utilities
- Custom animations

### Next.js Configuration

See `next.config.ts` for advanced Next.js settings and Genkit integration.

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run genkit:dev` | Start Genkit development environment |
| `npm run genkit:watch` | Start Genkit with file watching |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature suggestions.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created by **Somyajeet Singh**

Crafted with ❤️ and AI

## 🙏 Acknowledgments

- Google Genkit for AI capabilities
- Radix UI and Shadcn/ui for component libraries
- Next.js team for the amazing framework
- Tailwind CSS for styling utilities

---

**Made with ❤️ and powered by AI**
