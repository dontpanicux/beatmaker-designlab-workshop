# Beatmaker Project - Development Context

This document captures the development work completed for the Beatmaker web application, specifically Phase 2: Supabase Integration and related features.

## Project Overview

The Beatmaker is a web-based music creation tool that allows users to create, save, and manage drum beats online. Built with React, TypeScript, Tone.js, Vite, and Supabase.

## Phase 2 Implementation Summary

### Authentication System
- **Status**: ✅ Complete
- **Components**: 
  - `src/components/Auth/LoginForm.tsx` - Email/password login
  - `src/components/Auth/SignupForm.tsx` - User registration with password confirmation
- **Hook**: `src/hooks/useSupabase.ts` - Manages authentication state, sign in/up/out
- **Service**: `src/services/supabase.ts` - Supabase client configuration
- **Features**:
  - Email/password authentication
  - Session persistence
  - Auth state management with React hooks
  - Error handling with user-friendly messages
  - Email confirmation support (handled by Supabase)

### Database Schema & Security
- **Status**: ✅ Complete
- **Migration File**: `supabase/migrations/001_create_beats_table.sql`
- **Table**: `beats`
  - Columns: `id`, `user_id`, `name`, `bpm`, `sequencer_data` (JSONB), `created_at`, `updated_at`
  - Indexes on `user_id` and `created_at`
- **Row Level Security (RLS)**:
  - ✅ Enabled on `beats` table
  - ✅ Policies for SELECT, INSERT, UPDATE, DELETE
  - ✅ All policies enforce `auth.uid() = user_id`
  - ✅ Automatic `updated_at` timestamp via trigger
- **Security Documentation**: `SECURITY.md` - Comprehensive guide on RLS, API keys, best practices

### Beat Management Features
- **Status**: ✅ Complete
- **Save Beat**:
  - Modal: `src/components/Beats/SaveBeatModal.tsx`
  - Creates new beats with name, BPM, and sequencer state
  - Validates input and shows success/error messages
- **Beat Library**:
  - Component: `src/components/Beats/BeatLibrary.tsx`
  - Lists all user's saved beats
  - Shows beat name, BPM, creation date
  - Click to load beat into sequencer
  - Delete functionality with confirmation
- **Update Beat**:
  - Tracks currently loaded beat
  - "Update Beat" button appears when beat is loaded
  - Saves immediately without modal (uses existing name)
  - Updates sequencer state and BPM
- **Start New Beat**:
  - Component: `src/components/Beats/StartNewBeatModal.tsx`
  - Replaces "Reset Sequencer" button
  - Detects unsaved changes
  - Prompts user before clearing sequencer
  - Offers "Save First" option when editing saved beats
  - Prevents accidental data loss

### Unsaved Changes Detection
- **Status**: ✅ Complete
- **Implementation**:
  - Tracks `originalBeatState` when beat is loaded or saved
  - Compares current sequencer state and BPM with original
  - `compareSequencerStates()` helper function for deep comparison
  - `hasUnsavedChanges()` function checks for modifications
- **User Experience**:
  - Warns before starting new beat if changes exist
  - Different messages for saved beats vs. unsaved work
  - "Save First" button when editing saved beats

### State Management
- **Current Beat Tracking**: 
  - `currentBeat` state: `{ id: string; name: string } | null`
  - Tracks which beat is currently loaded
  - Cleared on logout, reset, or starting new beat
- **Original State Tracking**:
  - `originalBeatState`: `{ sequencerState: boolean[][]; bpm: number } | null`
  - Deep copied when beat is loaded or saved
  - Used to detect unsaved changes
- **User Session Isolation**:
  - Sequencer resets when user logs out
  - Sequencer resets when different user logs in
  - Each user session starts with empty sequencer

## Key Technical Decisions

### Security
1. **Anon Key is Public**: The `VITE_SUPABASE_ANON_KEY` is safe to expose in frontend code. Security comes from RLS policies, not key secrecy.
2. **Service Role Key**: Never used in frontend - only for server-side operations.
3. **RLS First**: All data access controlled by database-level policies.
4. **Code-Level Validation**: Additional `.eq('user_id', user.id)` checks in update/delete operations for defense in depth.

### State Management
1. **React Hooks**: Using `useState` and `useEffect` for state management (no external state library).
2. **Deep Copying**: Using `JSON.parse(JSON.stringify())` for sequencer state comparisons to avoid reference issues.
3. **State Isolation**: Each user session maintains separate sequencer state.

### User Experience
1. **Immediate Updates**: Update button saves immediately without modal for better UX.
2. **Data Loss Prevention**: Multiple confirmation dialogs prevent accidental loss of work.
3. **Clear Feedback**: Success/error messages for all operations.
4. **Smart Button Labels**: Button text changes based on context ("Save Beat" vs "Update Beat").

## File Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.tsx          # Login UI
│   │   └── SignupForm.tsx         # Registration UI
│   ├── Beats/
│   │   ├── SaveBeatModal.tsx      # Save/update beat modal
│   │   ├── BeatLibrary.tsx        # List and manage beats
│   │   └── StartNewBeatModal.tsx  # Confirmation for new beat
│   ├── Sequencer/
│   │   ├── SequencerGrid.tsx     # Main sequencer UI
│   │   └── StepButton.tsx         # Individual step cells
│   └── Transport/
│       ├── PlayButton.tsx
│       ├── TempoControl.tsx
│       └── TransportControls.tsx
├── hooks/
│   ├── useAudioEngine.ts          # Audio initialization
│   ├── useBeats.ts                # Beat CRUD operations
│   ├── useSequencer.ts            # Sequencer state & playback
│   └── useSupabase.ts             # Authentication
├── services/
│   ├── audioEngine.ts             # Tone.js audio engine
│   └── supabase.ts                # Supabase client
├── types/
│   ├── beat.ts                    # Beat type definitions
│   └── sequencer.ts               # Sequencer type definitions
└── App.tsx                        # Main application component

supabase/
└── migrations/
    └── 001_create_beats_table.sql # Database schema & RLS policies
```

## Environment Variables

Required in `.env` file:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Important**: 
- These are safe to expose in frontend code
- Never commit `.env` file (already in `.gitignore`)
- See `.env.example` for template

## Key Functions & Workflows

### Loading a Beat
1. User clicks beat in library
2. `handleLoadBeat()` called with beat data
3. Sequencer state and BPM updated via `loadBeatIntoSequencer()`
4. `currentBeat` and `originalBeatState` tracked
5. Success message displayed

### Saving a New Beat
1. User clicks "Save Beat" (no beat loaded)
2. Modal opens for beat name
3. `handleSaveBeat()` creates new beat
4. `currentBeat` and `originalBeatState` updated
5. Success message displayed

### Updating a Beat
1. User loads beat and makes edits
2. User clicks "Update Beat" (beat is loaded)
3. `handleUpdateBeat()` saves immediately (no modal)
4. `originalBeatState` updated to reflect saved state
5. Success message displayed

### Starting New Beat
1. User clicks "Start New Beat"
2. `hasUnsavedChanges()` checks for modifications
3. Modal shows appropriate warning:
   - If editing saved beat with changes: "Save First" or "Discard & Start New"
   - If unsaved work: "Start New Beat" or "Cancel"
   - If no changes: Simple confirmation
4. On confirm: Sequencer resets, `currentBeat` and `originalBeatState` cleared

## Security Features

1. **Row Level Security (RLS)**: All database operations protected by policies
2. **User Isolation**: Users can only access their own beats
3. **Authentication Required**: All beat operations require valid session
4. **Input Validation**: Beat names validated (max 100 chars, required)
5. **Error Handling**: Graceful error messages without exposing sensitive info

## Testing Checklist

- ✅ User can create account and log in
- ✅ User can save beats
- ✅ User can view their saved beats
- ✅ User can load beats into sequencer
- ✅ User can edit and update beats
- ✅ User can delete beats
- ✅ RLS prevents users from accessing other users' beats
- ✅ Sequencer resets on logout/login
- ✅ Unsaved changes detection works
- ✅ "Start New Beat" warns about unsaved work
- ✅ "Save First" option works when editing saved beats

## Known Behaviors

1. **Email Confirmation**: Supabase may require email confirmation by default. Users need to check email and confirm before first login.
2. **State Persistence**: Sequencer state persists in React state until page refresh or explicit reset.
3. **Deep Copying**: Using JSON serialization for state comparison (works but not the most performant for very large states).

## Future Enhancements (Not Implemented)

- Beat renaming functionality
- Beat duplication
- Beat sharing between users
- Export beats as audio files
- Pattern presets
- More drum sounds
- Real-time collaboration
- MIDI export

## Documentation Files

- `SECURITY.md` - Comprehensive security guide
- `TROUBLESHOOTING.md` - Common issues and solutions
- `supabase/README.md` - Supabase setup instructions
- `PROJECT_PLAN.md` - Original project plan
- `README.md` - Project overview and setup

## Dependencies

Key packages:
- `@supabase/supabase-js`: ^2.91.0 - Backend and auth
- `react`: ^19.2.3 - UI framework
- `tone`: ^15.1.22 - Audio synthesis
- `tailwindcss`: ^4.1.18 - Styling

## Development Notes

- All TypeScript types are defined in `src/types/`
- Error handling is consistent across all async operations
- Loading states are managed per operation
- Success messages auto-dismiss after 3 seconds
- Modals can be closed by clicking backdrop or cancel button

## Last Updated

This context file was created after completing Phase 2: Supabase Integration, including authentication, beat saving/loading, beat library, beat editing, and unsaved changes protection.
