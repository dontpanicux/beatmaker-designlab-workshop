import { useState, useEffect, useRef } from 'react';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useSequencer } from './hooks/useSequencer';
import { useSupabase } from './hooks/useSupabase';
import { useBeats } from './hooks/useBeats';
import { SequencerGrid } from './components/Sequencer/SequencerGrid';
import { TransportControls } from './components/Transport/TransportControls';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { ForgotPasswordForm } from './components/Auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/Auth/ResetPasswordForm';
import { SaveBeatModal } from './components/Beats/SaveBeatModal';
import { BeatLibrary } from './components/Beats/BeatLibrary';
import { StartNewBeatModal } from './components/Beats/StartNewBeatModal';

function App() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isStartNewModalOpen, setIsStartNewModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [currentBeat, setCurrentBeat] = useState<{ id: string; name: string } | null>(null);
  const [originalBeatState, setOriginalBeatState] = useState<{ sequencerState: boolean[][]; bpm: number } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { user, session, loading: authLoading, signIn, signUp, signOut, isAuthenticated, sendPasswordResetEmail, resetPassword, isPasswordRecovery } = useSupabase();
  const { isInitialized, isLoading, error, needsInteraction, initializeAudio } = useAudioEngine();
  const { saveBeat, updateBeat, listBeats, deleteBeat, loading: saveLoading, error: saveError, clearError } = useBeats();
  
  // Check if Supabase is configured
  const isSupabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'your-project-url' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY && 
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-anon-key';
  const {
    sequencerState,
    isPlaying,
    bpm,
    currentStep,
    toggleStep,
    start,
    stop,
    reset,
    loadBeat: loadBeatIntoSequencer,
    setBPM,
  } = useSequencer();

  // Track the previous user ID to detect user changes
  const previousUserIdRef = useRef<string | undefined>(user?.id);

  // Check for password recovery token in URL on mount
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    // If we have a recovery token in the URL, switch to reset mode
    if (type === 'recovery' && accessToken) {
      setAuthMode('reset');
      // Don't clear the hash immediately - let Supabase process it first
      // The hash will be cleared after successful password reset
    } else if (isPasswordRecovery) {
      // If Supabase detected password recovery event, switch to reset mode
      setAuthMode('reset');
    }
  }, [isPasswordRecovery]);

  // Reset sequencer when user changes (login/logout)
  useEffect(() => {
    const currentUserId = user?.id;
    const previousUserId = previousUserIdRef.current;

    // If user changed (logged in as different user or logged out)
    if (currentUserId !== previousUserId) {
      // Stop any playing audio
      if (isPlaying) {
        stop();
      }
      // Reset sequencer to empty state
      reset();
      // Clear any success messages
      setSaveSuccess(null);
      // Clear current beat tracking
      setCurrentBeat(null);
      setOriginalBeatState(null);
      // Update the ref
      previousUserIdRef.current = currentUserId;
    }
  }, [user?.id, isPlaying, stop, reset]);

  const handleSaveBeat = async (name: string) => {
    const result = await saveBeat({
      name,
      bpm,
      sequencer_data: sequencerState,
    });

    if (result.beat) {
      setCurrentBeat({ id: result.beat.id, name: result.beat.name });
      // Store the original state after saving (so we can detect future changes)
      setOriginalBeatState({
        sequencerState: JSON.parse(JSON.stringify(sequencerState)), // Deep copy
        bpm,
      });
      setSaveSuccess(`Beat "${name}" saved successfully!`);
      setIsSaveModalOpen(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
    }
    // Error is handled by the modal via saveError
  };

  const handleUpdateBeat = async () => {
    if (!currentBeat) return;

    setIsUpdating(true);
    setSaveSuccess(null);

    const result = await updateBeat(currentBeat.id, {
      name: currentBeat.name, // Keep the existing name
      bpm,
      sequencer_data: sequencerState,
    });

    if (result.beat) {
      // Update original state to reflect the saved state
      setOriginalBeatState({
        sequencerState: JSON.parse(JSON.stringify(sequencerState)), // Deep copy
        bpm,
      });
      setSaveSuccess(`Beat "${currentBeat.name}" updated successfully!`);
      setTimeout(() => setSaveSuccess(null), 3000);
    } else if (result.error) {
      setSaveSuccess(`Error: ${result.error}`);
      setTimeout(() => setSaveSuccess(null), 5000);
    }

    setIsUpdating(false);
  };

  const handleStartNewBeat = () => {
    // Stop any playing audio
    if (isPlaying) {
      stop();
    }
    // Reset sequencer to empty state
    reset();
    // Clear current beat tracking
    setCurrentBeat(null);
    setOriginalBeatState(null);
    setSaveSuccess('Started new beat');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Helper function to compare sequencer states
  const compareSequencerStates = (state1: boolean[][], state2: boolean[][]): boolean => {
    if (state1.length !== state2.length) return false;
    return state1.every((track, trackIndex) => {
      if (!state2[trackIndex] || track.length !== state2[trackIndex].length) return false;
      return track.every((step, stepIndex) => step === state2[trackIndex][stepIndex]);
    });
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = (): boolean => {
    if (!currentBeat || !originalBeatState) {
      // If no beat is loaded, check if sequencer has any active steps
      const hasActiveSteps = sequencerState.some(track => track.some(step => step));
      return hasActiveSteps;
    }
    
    // Compare current state with original loaded state
    const stateChanged = !compareSequencerStates(sequencerState, originalBeatState.sequencerState);
    const bpmChanged = bpm !== originalBeatState.bpm;
    
    return stateChanged || bpmChanged;
  };

  const handleLoadBeat = (beat: { id: string; sequencer_data: boolean[][]; bpm: number; name: string }) => {
    // Stop any playing audio
    if (isPlaying) {
      stop();
    }
    // Load the beat into the sequencer
    loadBeatIntoSequencer(beat.sequencer_data, beat.bpm);
    // Track the loaded beat so we can update it later
    setCurrentBeat({ id: beat.id, name: beat.name });
    // Store the original state to detect unsaved changes
    setOriginalBeatState({
      sequencerState: JSON.parse(JSON.stringify(beat.sequencer_data)), // Deep copy
      bpm: beat.bpm,
    });
    setSaveSuccess(`Beat "${beat.name}" loaded successfully!`);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleDeleteBeat = async (beatId: string) => {
    const result = await deleteBeat(beatId);
    if (result.error) {
      throw new Error(result.error);
    }
  };

  // Handle Supabase configuration error
  if (error && error.includes('Supabase')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-900 text-white p-6 rounded-lg shadow-xl max-w-md">
          <h2 className="text-xl font-bold mb-2">Configuration Required</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-yellow-200">
            Please create a <code className="bg-yellow-800 px-2 py-1 rounded">.env</code> file with your Supabase credentials.
            See <code className="bg-yellow-800 px-2 py-1 rounded">.env.example</code> for reference.
          </p>
        </div>
      </div>
    );
  }

  // Handle audio error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-900 text-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold mb-2">Audio Error</h2>
          <p>{error}</p>
          <p className="mt-4 text-sm">Make sure you have audio samples in /public/samples/</p>
        </div>
      </div>
    );
  }

  // Show authentication UI if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
              🎵 Beatmaker
            </h1>
            <p className="text-gray-200 text-lg">Create beats online for free</p>
          </div>
          
          {!isSupabaseConfigured && (
            <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg text-sm mb-4">
              <p className="font-semibold mb-1">Supabase not configured</p>
              <p className="text-xs">
                Create a <code className="bg-yellow-800 px-1 py-0.5 rounded">.env</code> file with your Supabase credentials.
                See <code className="bg-yellow-800 px-1 py-0.5 rounded">.env.example</code> for reference.
              </p>
            </div>
          )}
          
          {authLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-white text-xl">Loading...</div>
            </div>
          ) : authMode === 'login' ? (
            <LoginForm
              onLogin={signIn}
              onSwitchToSignup={() => setAuthMode('signup')}
              onSwitchToForgotPassword={() => setAuthMode('forgot')}
              loading={authLoading}
            />
          ) : authMode === 'signup' ? (
            <SignupForm
              onSignup={signUp}
              onSwitchToLogin={() => setAuthMode('login')}
              loading={authLoading}
            />
          ) : authMode === 'forgot' ? (
            <ForgotPasswordForm
              onSendResetEmail={sendPasswordResetEmail}
              onSwitchToLogin={() => setAuthMode('login')}
              loading={authLoading}
            />
          ) : (
            <ResetPasswordForm
              onResetPassword={resetPassword}
              onSwitchToLogin={() => setAuthMode('login')}
              loading={authLoading}
              hasSession={!!user && !!session}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
                🎵 Beatmaker
              </h1>
              <p className="text-gray-200 text-lg">Create beats online for free</p>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-4">
                <span className="text-gray-300 text-sm">{user?.email}</span>
                <button
                  onClick={async () => {
                    // Stop any playing audio before logging out
                    if (isPlaying) {
                      stop();
                    }
                    // Reset sequencer before logging out
                    reset();
                    // Clear success messages
                    setSaveSuccess(null);
                    // Sign out
                    await signOut();
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {needsInteraction && !isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="text-white text-xl text-center">
              Click anywhere to start the audio engine
            </div>
            <button
              onClick={initializeAudio}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400"
            >
              Initialize Audio
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white text-xl">Loading audio engine...</div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <TransportControls
                isPlaying={isPlaying}
                bpm={bpm}
                onPlay={start}
                onStop={stop}
                onBPMChange={setBPM}
                disabled={!isInitialized}
              />
            </div>

            <div className="mb-6">
              <SequencerGrid
                sequencerState={sequencerState}
                currentStep={currentStep}
                onStepToggle={toggleStep}
              />
            </div>

            {saveSuccess && (
              <div className="mb-4 flex justify-center">
                <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg text-sm">
                  {saveSuccess}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-400"
              >
                📚 My Beats
              </button>
              <button
                onClick={() => {
                  if (currentBeat) {
                    // If a beat is loaded, update it immediately
                    handleUpdateBeat();
                  } else {
                    // If no beat is loaded, open modal to name and save new beat
                    setIsSaveModalOpen(true);
                  }
                }}
                disabled={isUpdating || saveLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating 
                  ? 'Updating...' 
                  : currentBeat 
                    ? '💾 Update Beat' 
                    : '💾 Save Beat'
                }
              </button>
              <button
                onClick={() => setIsStartNewModalOpen(true)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400"
              >
                Start New Beat
              </button>
            </div>

            <SaveBeatModal
              isOpen={isSaveModalOpen}
              onClose={() => {
                setIsSaveModalOpen(false);
                clearError();
              }}
              onSave={handleSaveBeat}
              isLoading={saveLoading}
              error={saveError}
              initialName={currentBeat?.name || ''}
              isUpdateMode={!!currentBeat}
            />

            <BeatLibrary
              isOpen={isLibraryOpen}
              onClose={() => {
                setIsLibraryOpen(false);
                clearError();
              }}
              onLoadBeat={handleLoadBeat}
              onDeleteBeat={handleDeleteBeat}
              listBeats={listBeats}
              loading={saveLoading}
            />

            <StartNewBeatModal
              isOpen={isStartNewModalOpen}
              onClose={() => setIsStartNewModalOpen(false)}
              onConfirm={handleStartNewBeat}
              onSaveFirst={currentBeat ? handleUpdateBeat : undefined}
              hasUnsavedChanges={hasUnsavedChanges()}
              currentBeat={currentBeat}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
