export type DrumSound = 'kick' | 'snare' | 'hihat-closed' | 'hihat-open' | 'clap';

export interface DrumTrack {
  name: string;
  sound: DrumSound;
  color: string;
}

export type SequencerState = boolean[][]; // [trackIndex][stepIndex]

export const DRUM_TRACKS: DrumTrack[] = [
  { name: 'Kick', sound: 'kick', color: 'bg-red-500' },
  { name: 'Snare', sound: 'snare', color: 'bg-blue-500' },
  { name: 'Open Hi-Hat', sound: 'hihat-open', color: 'bg-purple-500' },
  { name: 'Closed Hi-Hat', sound: 'hihat-closed', color: 'bg-yellow-500' },
  { name: 'Clap', sound: 'clap', color: 'bg-green-500' },
];

export const STEPS_PER_BAR = 16;
export const DEFAULT_BPM = 120;
export const MIN_BPM = 60;
export const MAX_BPM = 180;
