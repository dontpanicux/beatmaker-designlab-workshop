import { useEffect, useState } from 'react';
import { audioEngine } from '../services/audioEngine';

export function useAudioEngine() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsInteraction, setNeedsInteraction] = useState(true);

  const initializeAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await audioEngine.initialize();
      setIsInitialized(true);
      setIsLoading(false);
      setNeedsInteraction(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize audio');
      setIsLoading(false);
    }
  };

  // Try to initialize on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (needsInteraction && !isInitialized && !isLoading) {
        initializeAudio();
      }
    };

    // Listen for any user interaction
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [needsInteraction, isInitialized, isLoading]);

  return { 
    isInitialized, 
    isLoading, 
    error, 
    needsInteraction,
    initializeAudio 
  };
}
