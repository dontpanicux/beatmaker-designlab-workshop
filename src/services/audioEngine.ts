import * as Tone from 'tone';
import { DrumSound, DRUM_TRACKS, STEPS_PER_BAR } from '../types/sequencer';

class AudioEngine {
  private players: Map<DrumSound, Tone.Player> = new Map();
  private isInitialized = false;
  private scheduledId: number | null = null;
  private sequencerCallback: ((step: number) => void) | null = null;
  private currentSequencerState: boolean[][] | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Tone.js context (requires user interaction)
      // In Tone.js v15+, use getContext().resume() instead of start()
      const context = Tone.getContext();
      if (context.state !== 'running') {
        await context.resume();
      }
    } catch (error) {
      throw new Error(`Failed to initialize audio context: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure you interact with the page first (click, tap, etc.)`);
    }

    // Load samples for each drum sound
    // Map expected sounds to actual file names (handle file name variations)
    const getSampleUrl = (sound: DrumSound): string => {
      // Handle file name variations
      if (sound === 'hihat-closed') {
        return '/samples/hihat-closed.wav';
      }
      if (sound === 'hihat-open') {
        return '/samples/hihat-open.wav';
      }
      return `/samples/${sound}.wav`;
    };

    const loadErrors: string[] = [];
    
    for (const track of DRUM_TRACKS) {
      try {
        const url = getSampleUrl(track.sound);
        
        const player = new Tone.Player({
          url: url,
          volume: -5, // Slight volume reduction to prevent clipping
        }).toDestination();

        // Wait for the player to load
        // In Tone.js v15, Player automatically loads when URL is provided in constructor
        // But we need to wait for it to complete
        await new Promise<void>((resolve, reject) => {
          // Check if already loaded
          if (player.loaded) {
            resolve();
            return;
          }

          let resolved = false;
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              reject(new Error(`Timeout loading ${track.sound}.wav (15s). File may be missing or invalid.`));
            }
          }, 15000);

          // Poll for loaded state (most reliable method)
          const pollInterval = setInterval(() => {
            if (player.loaded) {
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                clearInterval(pollInterval);
                resolve();
              }
            }
          }, 50); // Check every 50ms

          // Also try explicit load as fallback
          player.load(url).catch((error: any) => {
            // Only reject if we haven't resolved yet
            if (!resolved && !player.loaded) {
              resolved = true;
              clearTimeout(timeout);
              clearInterval(pollInterval);
              reject(new Error(`Failed to load ${track.sound}.wav: ${error?.message || 'Unknown error'}`));
            }
          });
        });

        this.players.set(track.sound, player);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Unknown error loading ${track.sound}`;
        loadErrors.push(`  - ${track.sound}.wav: ${errorMessage}`);
        console.error(`Error loading ${track.sound}:`, error);
        // Continue loading other samples even if one fails
      }
    }

    if (loadErrors.length > 0) {
      const missingFiles = loadErrors.map(e => e.split(':')[0].trim()).join(', ');
      throw new Error(
        `Failed to load audio samples:\n${loadErrors.join('\n')}\n\n` +
        `Required files in /public/samples/:\n` +
        `- kick.wav\n` +
        `- snare.wav\n` +
        `- hihat-closed.wav (for Hi-Hat track)\n` +
        `- hihat-open.wav (for Tom track)\n` +
        `- clap.wav\n\n` +
        `Missing or invalid: ${missingFiles}\n\n` +
        `Make sure files are valid WAV or MP3 format and not corrupted.`
      );
    }

    if (this.players.size === 0) {
      throw new Error('No audio samples were loaded successfully. Please check your sample files.');
    }

    this.isInitialized = true;
  }

  start(sequencerState: boolean[][]): void {
    if (!this.isInitialized) {
      console.warn('Audio engine not initialized');
      return;
    }

    // Store the sequencer state
    this.currentSequencerState = sequencerState;

    // Stop any existing sequence
    this.stop();

    // Reset transport to beginning
    Tone.Transport.cancel(0);
    Tone.Transport.position = 0;

    // Track current step manually
    let currentStep = 0;

    // Verify players are loaded
    const loadedPlayers = Array.from(this.players.entries()).filter(([_, player]) => player.loaded);
    console.log(`Starting sequencer with ${loadedPlayers.length}/${this.players.size} players loaded`);

    // Start the transport
    Tone.Transport.start();

    // Schedule the sequencer loop - trigger every 16th note
    this.scheduledId = Tone.Transport.scheduleRepeat((time) => {
      // Use the stored sequencer state
      const state = this.currentSequencerState || sequencerState;

      // Trigger sounds for active steps
      DRUM_TRACKS.forEach((track, trackIndex) => {
        if (state[trackIndex] && state[trackIndex][currentStep]) {
          const player = this.players.get(track.sound);
          if (player && player.loaded) {
            try {
              // Start the player at the scheduled time
              player.start(time);
            } catch (error) {
              console.error(`Error starting ${track.sound}:`, error);
            }
          }
        }
      });

      // Call callback if provided
      if (this.sequencerCallback) {
        this.sequencerCallback(currentStep);
      }

      // Move to next step (0-15, then loop)
      currentStep = (currentStep + 1) % STEPS_PER_BAR;
    }, '16n'); // Every 16th note (1 step)
  }

  updateSequencerState(sequencerState: boolean[][]): void {
    this.currentSequencerState = sequencerState;
  }

  stop(): void {
    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    
    if (this.scheduledId !== null) {
      Tone.Transport.clear(this.scheduledId);
      this.scheduledId = null;
    }
  }

  setBPM(bpm: number): void {
    Tone.Transport.bpm.value = bpm;
  }

  getBPM(): number {
    return Tone.Transport.bpm.value;
  }

  setSequencerCallback(callback: (step: number) => void): void {
    this.sequencerCallback = callback;
  }

  // Removed getCurrentStep - we now track step manually in start()

  setVolume(sound: DrumSound, volume: number): void {
    const player = this.players.get(sound);
    if (player) {
      player.volume.value = volume;
    }
  }

  getInitialized(): boolean {
    return this.isInitialized;
  }
}

export const audioEngine = new AudioEngine();
