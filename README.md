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

🔄 **Phase 2 Planned**: Supabase integration for saving beats
- See `PROJECT_PLAN.md` for detailed implementation plan

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Add drum samples:
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

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (typically `http://localhost:5173`)

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
│   └── Transport/      # Play/pause and tempo controls
├── hooks/              # React hooks for sequencer and audio
├── services/           # Audio engine using Tone.js
└── types/              # TypeScript type definitions
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tone.js** - Audio synthesis and sequencing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling

## Future Features (Phase 2)

- Supabase integration for user authentication
- Save and load beats
- Beat library
- More drum sounds and instruments
- Export beats as audio files

## License

ISC
