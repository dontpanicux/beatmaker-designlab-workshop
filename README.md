# 🎵 Beatmaker - Online Music Creator

A web-based beatmaker that allows users to create music online for free. Built with React, TypeScript, Tone.js, and Vite.

## Features

- **16-Step Drum Sequencer**: Create beats with 5 drum sounds (Kick, Snare, Open Hi-Hat, Closed Hi-Hat, Clap)
- **Real-time Playback**: Play your beats with precise timing using Tone.js
- **Tempo Control**: Adjust BPM from 60-180
- **Visual Feedback**: See which step is currently playing
- **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Current Status

✅ **Phase 1 Complete**: Core sequencer is fully functional
- All 5 drum tracks working
- Real-time playback with visual feedback
- Tempo control
- User interaction-based audio initialization

✅ **Phase 2 In Progress**: Supabase integration
- ✅ Authentication setup (login/signup)
- 🔄 Beat saving and loading (coming next)
- See `PROJECT_PLAN.md` for detailed implementation plan

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure Supabase (for authentication):
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Copy `.env.example` to `.env`
   - Add your Supabase project URL and anon key to `.env`:
     ```
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```
   - You can find these values in your Supabase project settings under "API"
   - **Security Note**: The anon key is safe to use in frontend code. It's protected by Row Level Security (RLS) policies. See `SECURITY.md` for details.
   
3. Set up the database:
   - Run the migration SQL in `supabase/migrations/001_create_beats_table.sql`
   - This creates the `beats` table with Row Level Security enabled
   - You can run it in the Supabase SQL Editor or via Supabase CLI

4. Add drum samples:
   - Download 5 drum samples:
     - `kick.wav`
     - `snare.wav`
     - `hihat-closed.wav`
     - `hihat-open.wav`
     - `clap.wav`
   - Place them in the `public/samples/` directory
   - Recommended sources:
     - [Freesound.org](https://freesound.org) (search for CC0/CC-BY licensed samples)
     - [Zapsplat](https://zapsplat.com) (free with attribution)

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to the URL shown (typically `http://localhost:5173`)

**Note**: If you haven't configured Supabase, you'll see a warning message. The app will still work, but authentication features won't be available.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── Sequencer/      # Sequencer grid and step buttons
│   ├── Transport/      # Play/pause and tempo controls
│   └── Auth/           # Login and signup forms
├── hooks/              # React hooks for sequencer, audio, and Supabase
├── services/           # Audio engine and Supabase client
└── types/              # TypeScript type definitions
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tone.js** - Audio synthesis and sequencing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Supabase** - Backend (authentication, database)

## Features (Phase 2)

- ✅ User authentication (login/signup)
- ✅ Row Level Security (RLS) for data protection
- 🔄 Save and load beats (in progress)
- 🔄 Beat library (planned)
- 🔄 More drum sounds and instruments (planned)
- 🔄 Export beats as audio files (planned)

## Security

This application is built with security best practices:

- **Row Level Security (RLS)**: Database policies ensure users can only access their own data
- **Secure Authentication**: Supabase handles authentication with industry-standard security
- **Environment Variables**: Sensitive keys are stored in `.env` files (never committed)
- **Public Anon Key**: The anon key is designed to be public and is protected by RLS policies

**Important**: 
- The `VITE_SUPABASE_ANON_KEY` is **safe to expose** in frontend code
- **Never** use the service role key in frontend code
- See [`SECURITY.md`](./SECURITY.md) for comprehensive security documentation

## License

ISC
