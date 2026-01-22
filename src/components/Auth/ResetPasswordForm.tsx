import { useState, FormEvent } from 'react';

interface ResetPasswordFormProps {
  onResetPassword: (newPassword: string) => Promise<{ error: string | null }>;
  onSwitchToLogin: () => void;
  loading?: boolean;
}

export function ResetPasswordForm({ onResetPassword, onSwitchToLogin, loading = false }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    const result = await onResetPassword(password);
    
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      setIsSubmitting(false);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Password Reset Successful</h2>
        
        <div className="space-y-4">
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">✓ Password updated!</p>
            <p>Your password has been successfully reset. Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-password" className="block text-sm font-medium text-gray-300 mb-2">
            New Password
          </label>
          <input
            id="reset-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting || loading}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
            minLength={6}
          />
          <p className="mt-1 text-xs text-gray-400">Must be at least 6 characters</p>
        </div>

        <div>
          <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm New Password
          </label>
          <input
            id="reset-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isSubmitting || loading}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">Error</p>
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          disabled={isSubmitting || loading}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors disabled:opacity-50"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
