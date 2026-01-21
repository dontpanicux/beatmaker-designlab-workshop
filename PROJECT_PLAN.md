# Beatmaker Project Plan

## Project Overview
Web-based beatmaker that allows users to create music online for free. Built with React, TypeScript, Tone.js, and Vite.

## Technology Stack

### Frontend Framework: React + TypeScript
- **Why React**: Largest ecosystem, excellent for interactive UIs, strong WebAudio integration support
- **Why TypeScript**: Type safety for audio timing, sequencer state, and API calls prevents bugs
- **Build Tool: Vite** - Fast development server, instant HMR, optimized production builds

### Audio Library: Tone.js
- **Why Tone.js**: 
  - WebAudio API is powerful but low-level and verbose
  - Tone.js provides `Transport` (global timeline), `Sequence` (pattern playback), and `Part` (scheduled events)
  - Built-in timing precision critical for sequencers
  - Handles audio context initialization, scheduling, and cleanup

### Styling: Tailwind CSS
- Rapid UI development, modern design system, responsive utilities

### State Management: React Hooks (useState/useReducer)
- Start simple with built-in hooks
- Can migrate to Zustand/Redux later if complexity grows

### Backend: Supabase (Phase 2)
- PostgreSQL database with real-time capabilities
- Built-in authentication (email, OAuth)
- Row Level Security for user data
- RESTful API auto-generated from schema

## Implementation Phases

### ✅ Phase 1: Core Sequencer (COMPLETED)

**1.1 Project Setup** ✅
- Vite + React + TypeScript project initialized
- Tailwind CSS configured
- Project structure created

**1.2 Audio Engine** ✅
- Tone.js Transport and Player instances for each drum sound
- Audio context initialization with user interaction requirement
- Sample loading with error handling

**1.3 Sequencer State** ✅
- 5 tracks × 16 steps grid state management
- Step toggle functionality
- BPM control (60-180)
- Play/stop controls

**1.4 UI Components** ✅
- SequencerGrid component with visual feedback
- StepButton cells with active/current step highlighting
- Transport controls (play/pause, tempo slider)
- Responsive design

**1.5 Sequencing Logic** ✅
- Connected sequencer state to Tone.js Transport
- Real-time step tracking and visual feedback
- Precise audio timing

**1.6 Sample Integration** ✅
- 5 drum samples integrated:
  - kick.wav
  - snare.wav
  - hihat-closed.wav (for Closed Hi-Hat track)
  - hihat-open.wav (for Open Hi-Hat track)
  - clap.wav

**Current Track Configuration:**
- Kick (red)
- Snare (blue)
- Open Hi-Hat (purple) - uses `hihat-open.wav`
- Closed Hi-Hat (yellow) - uses `hihat-closed.wav`
- Clap (green)

### 🔄 Phase 2: Supabase Integration (PLANNED)

**2.1 Supabase Setup**
- Create Supabase project
- Install `@supabase/supabase-js` (already in dependencies)
- Configure environment variables
- Set up Supabase client

**2.2 Database Schema**
```sql
-- Beats table
CREATE TABLE beats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  bpm INTEGER,
  sequencer_data JSONB, -- Store 5×16 grid state
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own beats" ON beats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own beats" ON beats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own beats" ON beats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own beats" ON beats FOR DELETE USING (auth.uid() = user_id);
```

**2.3 Authentication UI**
- LoginForm component: Email/password login
- SignupForm component: User registration
- Auth state management with Supabase session

**2.4 Beat Saving**
- Add "Save Beat" button (only when authenticated)
- Serialize sequencer state + BPM to JSON
- Save to Supabase `beats` table
- Add beat name input modal

**2.5 Beat Loading**
- Fetch user's saved beats
- Display beat list/library
- Load beat into sequencer on click
- Restore BPM and grid state

## Project Structure

```
beatmaker-designlab-workshop/
├── public/
│   └── samples/
│       ├── kick.wav
│       ├── snare.wav
│       ├── hihat-closed.wav
│       ├── hihat-open.wav
│       └── clap.wav
├── src/
│   ├── components/
│   │   ├── Sequencer/
│   │   │   ├── SequencerGrid.tsx       # Main 16-step grid
│   │   │   └── StepButton.tsx          # Individual step cell
│   │   ├── Transport/
│   │   │   ├── PlayButton.tsx
│   │   │   ├── TempoControl.tsx
│   │   │   └── TransportControls.tsx
│   │   └── Auth/                      # Phase 2
│   │       ├── LoginForm.tsx
│   │       └── SignupForm.tsx
│   ├── hooks/
│   │   ├── useSequencer.ts             # Core sequencer logic
│   │   ├── useAudioEngine.ts           # Tone.js initialization
│   │   └── useSupabase.ts              # Phase 2: Supabase client
│   ├── services/
│   │   ├── audioEngine.ts              # Tone.js Transport & scheduling
│   │   └── supabase.ts                 # Phase 2: Supabase client setup
│   ├── types/
│   │   └── sequencer.ts                # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Key Implementation Details

### Audio Timing with Tone.js
- Use `Tone.Transport.scheduleRepeat()` to loop every 16th note
- Track step manually (0-15) instead of parsing transport position
- Trigger `player.start(time)` for active steps with precise timing

### Sequencer State Structure
```typescript
type SequencerState = boolean[][]; // [trackIndex][stepIndex]
// Example: sequencerState[0][3] = true means kick is active on step 4
```

### Sound Identifiers
- `'kick'` → `kick.wav`
- `'snare'` → `snare.wav`
- `'hihat-closed'` → `hihat-closed.wav`
- `'hihat-open'` → `hihat-open.wav`
- `'clap'` → `clap.wav`

## Next Steps After Phase 2
- Add more drum sounds
- Pattern presets
- Export beats as audio files
- Share beats via URL
- Real-time collaboration (Supabase real-time)
- MIDI export
- Effects (reverb, delay) per track

## Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "tone": "^15.1.22",
    "@supabase/supabase-js": "^2.91.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.9",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.2",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "tailwindcss": "^4.1.18",
    "@tailwindcss/postcss": "^4.1.18",
    "autoprefixer": "^10.4.23",
    "postcss": "^8.5.6"
  }
}
```

## Notes
- Audio context requires user interaction (browser security requirement)
- Node.js 22+ required for Vite 7
- All audio samples must be valid WAV or MP3 format
