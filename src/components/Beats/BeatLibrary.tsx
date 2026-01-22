import { useState, useEffect } from 'react';
import { Beat } from '../../types/beat';

interface BeatLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadBeat: (beat: Beat) => void;
  onDeleteBeat: (beatId: string) => Promise<void>;
  listBeats: () => Promise<{ beats: Beat[]; error: string | null }>;
  loading?: boolean;
}

export function BeatLibrary({
  isOpen,
  onClose,
  onLoadBeat,
  onDeleteBeat,
  listBeats,
  loading = false,
}: BeatLibraryProps) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBeats();
    }
  }, [isOpen]);

  const loadBeats = async () => {
    setIsLoading(true);
    setError(null);
    const result = await listBeats();
    if (result.error) {
      setError(result.error);
    } else {
      setBeats(result.beats);
    }
    setIsLoading(false);
  };

  const handleLoadBeat = (beat: Beat) => {
    onLoadBeat(beat);
    onClose();
  };

  const handleDeleteBeat = async (beatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading the beat when clicking delete
    if (!confirm('Are you sure you want to delete this beat? This action cannot be undone.')) {
      return;
    }
    
    setDeletingId(beatId);
    try {
      await onDeleteBeat(beatId);
      // Reload the list after deletion
      await loadBeats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete beat');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">My Beats</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {isLoading || loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-xl">Loading beats...</div>
          </div>
        ) : beats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="text-4xl mb-4">🎵</div>
            <p className="text-lg">No saved beats yet</p>
            <p className="text-sm mt-2">Create a beat and save it to see it here</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {beats.map((beat) => (
                <div
                  key={beat.id}
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors"
                  onClick={() => handleLoadBeat(beat)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{beat.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <span>BPM: {beat.bpm}</span>
                        <span>•</span>
                        <span>{formatDate(beat.created_at)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteBeat(beat.id, e)}
                      disabled={deletingId === beat.id}
                      className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Delete ${beat.name}`}
                    >
                      {deletingId === beat.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
