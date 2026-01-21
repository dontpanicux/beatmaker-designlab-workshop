import { SequencerState, DRUM_TRACKS } from '../../types/sequencer';
import { StepButton } from './StepButton';

interface SequencerGridProps {
  sequencerState: SequencerState;
  currentStep: number | null;
  onStepToggle: (trackIndex: number, stepIndex: number) => void;
}

export function SequencerGrid({ sequencerState, currentStep, onStepToggle }: SequencerGridProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-2xl">
      <div className="grid grid-cols-[120px_repeat(16,1fr)] gap-2">
        {/* Header row */}
        <div className="flex items-center justify-center font-bold text-gray-300">
          Track
        </div>
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-sm font-semibold text-gray-400"
          >
            {i + 1}
          </div>
        ))}

        {/* Track rows */}
        {DRUM_TRACKS.map((track, trackIndex) => (
          <div key={track.sound} className="contents">
            {/* Track label */}
            <div className="flex items-center justify-center font-semibold text-white">
              {track.name}
            </div>
            {/* Steps */}
            {Array.from({ length: 16 }, (_, stepIndex) => (
              <StepButton
                key={stepIndex}
                isActive={sequencerState[trackIndex][stepIndex]}
                isCurrent={currentStep === stepIndex}
                onClick={() => onStepToggle(trackIndex, stepIndex)}
                track={track}
                stepIndex={stepIndex}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
