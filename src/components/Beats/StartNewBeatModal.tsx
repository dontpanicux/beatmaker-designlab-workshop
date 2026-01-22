interface StartNewBeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSaveFirst?: () => Promise<void>;
  hasUnsavedChanges: boolean;
  currentBeat: { id: string; name: string } | null;
}

export function StartNewBeatModal({
  isOpen,
  onClose,
  onConfirm,
  onSaveFirst,
  hasUnsavedChanges,
  currentBeat,
}: StartNewBeatModalProps) {
  if (!isOpen) return null;

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
        <h2 className="text-2xl font-bold text-white mb-4">Start New Beat</h2>
        
        <div className="space-y-4">
          {hasUnsavedChanges && currentBeat ? (
            <>
              <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">⚠️ Unsaved Changes Detected</p>
                <p>
                  You have unsaved changes to <strong>"{currentBeat.name}"</strong>. 
                  Starting a new beat will discard these changes.
                </p>
              </div>
              <p className="text-gray-300">
                Would you like to save your changes first, or discard them and start a new beat?
              </p>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">⚠️ Unsaved Work</p>
                <p>You have unsaved changes. Starting a new beat will discard your current work.</p>
              </div>
              <p className="text-gray-300">
                Are you sure you want to start a new beat? This action cannot be undone.
              </p>
            </>
          ) : currentBeat ? (
            <p className="text-gray-300">
              Are you sure you want to start a new beat? This will clear the current sequencer.
            </p>
          ) : (
            <p className="text-gray-300">
              Are you sure you want to start a new beat? This will clear the current sequencer.
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
            {hasUnsavedChanges && currentBeat && onSaveFirst && (
              <button
                type="button"
                onClick={async () => {
                  await onSaveFirst();
                  // Wait a moment for the save to complete, then start new beat
                  setTimeout(() => {
                    onConfirm();
                    onClose();
                  }, 500);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400"
              >
                Save First
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-400"
            >
              {hasUnsavedChanges && currentBeat ? 'Discard & Start New' : 'Start New Beat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
