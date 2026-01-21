interface PlayButtonProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function PlayButton({ isPlaying, onPlay, onStop, disabled }: PlayButtonProps) {
  return (
    <button
      onClick={isPlaying ? onStop : onPlay}
      disabled={disabled}
      className={`
        px-8 py-4 rounded-lg font-bold text-lg transition-all
        ${isPlaying
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-green-600 hover:bg-green-700 text-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}
        focus:outline-none focus:ring-4 focus:ring-blue-400
      `}
      aria-label={isPlaying ? 'Stop' : 'Play'}
    >
      {isPlaying ? '⏹ Stop' : '▶ Play'}
    </button>
  );
}
