import { PlayButton } from './PlayButton';
import { TempoControl } from './TempoControl';

interface TransportControlsProps {
  isPlaying: boolean;
  bpm: number;
  onPlay: () => void;
  onStop: () => void;
  onBPMChange: (bpm: number) => void;
  disabled?: boolean;
}

export function TransportControls({
  isPlaying,
  bpm,
  onPlay,
  onStop,
  onBPMChange,
  disabled,
}: TransportControlsProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl flex items-center justify-center gap-8">
      <PlayButton
        isPlaying={isPlaying}
        onPlay={onPlay}
        onStop={onStop}
        disabled={disabled}
      />
      <TempoControl bpm={bpm} onBPMChange={onBPMChange} />
    </div>
  );
}
