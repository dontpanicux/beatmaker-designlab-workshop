import { useState, useCallback } from 'react';
import { SequencerState, DRUM_TRACKS, STEPS_PER_BAR, DEFAULT_BPM } from '../types/sequencer';
import { audioEngine } from '../services/audioEngine';

export function useSequencer() {
  const [sequencerState, setSequencerState] = useState<SequencerState>(() => {
    // Initialize with all steps inactive
    return Array(DRUM_TRACKS.length).fill(null).map(() => 
      Array(STEPS_PER_BAR).fill(false)
    );
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [currentStep, setCurrentStep] = useState<number | null>(null);


  const start = useCallback(() => {
    if (isPlaying) return;

    // Set callback to update current step
    audioEngine.setSequencerCallback((step: number) => {
      setCurrentStep(step);
    });

    audioEngine.setBPM(bpm);
    // Start with current sequencer state and update it in the engine
    audioEngine.start(sequencerState);
    audioEngine.updateSequencerState(sequencerState);
    setIsPlaying(true);
  }, [sequencerState, bpm, isPlaying]);

  // Update sequencer state in audio engine when it changes (if playing)
  const toggleStep = useCallback((trackIndex: number, stepIndex: number) => {
    setSequencerState(prev => {
      const newState = prev.map((track, tIdx) => {
        if (tIdx === trackIndex) {
          return track.map((step, sIdx) => 
            sIdx === stepIndex ? !step : step
          );
        }
        return track;
      });
      // Update audio engine with new state if playing
      if (isPlaying) {
        audioEngine.updateSequencerState(newState);
      }
      return newState;
    });
  }, [isPlaying]);

  const stop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentStep(null);
  }, []);

  const reset = useCallback(() => {
    setSequencerState(() => {
      return Array(DRUM_TRACKS.length).fill(null).map(() => 
        Array(STEPS_PER_BAR).fill(false)
      );
    });
    setCurrentStep(null);
  }, []);

  const loadBeat = useCallback((sequencerData: boolean[][], beatBPM: number) => {
    // Stop any playing audio
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentStep(null);
    }
    
    // Validate and load the sequencer data
    // Ensure it matches expected dimensions (5 tracks × 16 steps)
    const validatedData = sequencerData.map((track, trackIndex) => {
      if (trackIndex >= DRUM_TRACKS.length) return Array(STEPS_PER_BAR).fill(false);
      return track.slice(0, STEPS_PER_BAR).map(step => Boolean(step));
    });
    
    // Pad if needed
    while (validatedData.length < DRUM_TRACKS.length) {
      validatedData.push(Array(STEPS_PER_BAR).fill(false));
    }
    
    setSequencerState(validatedData);
    setBpm(beatBPM);
    setCurrentStep(null);
    
    // Update audio engine if initialized
    if (audioEngine) {
      audioEngine.updateSequencerState(validatedData);
    }
  }, [isPlaying]);

  const handleBPMChange = useCallback((newBPM: number) => {
    setBpm(newBPM);
    if (isPlaying) {
      audioEngine.setBPM(newBPM);
    }
  }, [isPlaying]);

  return {
    sequencerState,
    isPlaying,
    bpm,
    currentStep,
    toggleStep,
    start,
    stop,
    reset,
    loadBeat,
    setBPM: handleBPMChange,
  };
}
