import { useState, FormEvent, useEffect } from 'react';

interface SaveBeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  initialName?: string; // For update mode
  isUpdateMode?: boolean; // Whether we're updating an existing beat
}

export function SaveBeatModal({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading = false, 
  error,
  initialName = '',
  isUpdateMode = false,
}: SaveBeatModalProps) {
  const [beatName, setBeatName] = useState('');

  // Reset form when modal opens/closes or initialName changes
  useEffect(() => {
    if (isOpen) {
      setBeatName(initialName || '');
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (beatName.trim()) {
      await onSave(beatName.trim());
      // Don't close here - let parent handle it after successful save
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">
          {isUpdateMode ? 'Update Beat' : 'Save Beat'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="beat-name" className="block text-sm font-medium text-gray-300 mb-2">
              Beat Name
            </label>
            <input
              id="beat-name"
              type="text"
              value={beatName}
              onChange={(e) => setBeatName(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="My Awesome Beat"
              autoFocus
              maxLength={100}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !beatName.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (isUpdateMode ? 'Updating...' : 'Saving...') 
                : (isUpdateMode ? 'Update Beat' : 'Save Beat')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
