import { useAudioEngine } from './hooks/useAudioEngine';
import { useSequencer } from './hooks/useSequencer';
import { SequencerGrid } from './components/Sequencer/SequencerGrid';
import { TransportControls } from './components/Transport/TransportControls';

function App() {
  const { isInitialized, isLoading, error, needsInteraction, initializeAudio } = useAudioEngine();
  const {
    sequencerState,
    isPlaying,
    bpm,
    currentStep,
    toggleStep,
    start,
    stop,
    reset,
    setBPM,
  } = useSequencer();

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

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            🎵 Beatmaker
          </h1>
          <p className="text-gray-200 text-lg">Create beats online for free</p>
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

            <div className="flex justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400"
              >
                Reset Sequencer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
