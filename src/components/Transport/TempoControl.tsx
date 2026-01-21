import { MIN_BPM, MAX_BPM } from '../../types/sequencer';

interface TempoControlProps {
  bpm: number;
  onBPMChange: (bpm: number) => void;
}

export function TempoControl({ bpm, onBPMChange }: TempoControlProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <label htmlFor="tempo-slider" className="text-sm font-semibold text-gray-300">
        Tempo (BPM)
      </label>
      <div className="flex items-center gap-4">
        <input
          id="tempo-slider"
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpm}
          onChange={(e) => onBPMChange(Number(e.target.value))}
          className="w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-2xl font-bold text-white w-16 text-center">
          {Math.round(bpm)}
        </span>
      </div>
    </div>
  );
}
