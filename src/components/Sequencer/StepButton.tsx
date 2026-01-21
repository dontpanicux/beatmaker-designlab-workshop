import { DrumTrack } from '../../types/sequencer';

interface StepButtonProps {
  isActive: boolean;
  isCurrent: boolean;
  onClick: () => void;
  track: DrumTrack;
  stepIndex: number;
}

export function StepButton({ isActive, isCurrent, onClick, track, stepIndex }: StepButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-12 h-12 rounded-lg border-2 transition-all duration-75
        ${isActive 
          ? `${track.color} border-white shadow-lg scale-105` 
          : 'bg-gray-700 border-gray-600 hover:border-gray-500'
        }
        ${isCurrent ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-400
      `}
      aria-label={`${track.name} step ${stepIndex + 1}`}
    >
      <span className="sr-only">{stepIndex + 1}</span>
    </button>
  );
}
