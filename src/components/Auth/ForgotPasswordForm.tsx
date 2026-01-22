import { useState, FormEvent } from 'react';

interface ForgotPasswordFormProps {
  onSendResetEmail: (email: string) => Promise<{ error: string | null }>;
  onSwitchToLogin: () => void;
  loading?: boolean;
}

export function ForgotPasswordForm({ onSendResetEmail, onSwitchToLogin, loading = false }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await onSendResetEmail(email);
    
    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      setEmailSent(true);
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Check Your Email</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">Password reset email sent!</p>
            <p>
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and click the link to reset your password.
            </p>
            <p className="mt-2 text-xs text-blue-300">
              💡 Don't see the email? Check your spam folder.
            </p>
          </div>

          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Forgot Password</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting || loading}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="your@email.com"
          />
          <p className="mt-1 text-xs text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
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
          {isSubmitting || loading ? 'Sending...' : 'Send Reset Link'}
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
