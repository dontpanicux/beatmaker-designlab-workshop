import { useState, FormEvent } from 'react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<{ error: string | null }>;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  loading?: boolean;
}

export function LoginForm({ onLogin, onSwitchToSignup, onSwitchToForgotPassword, loading = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await onLogin(email, password);
    
    if (result.error) {
      setError(result.error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting || loading}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              disabled={isSubmitting || loading}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
            >
              Forgot Password?
            </button>
          </div>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting || loading}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">Login Failed</p>
            <p>{error}</p>
            {error.includes('email') && (
              <p className="mt-2 text-xs text-red-300">
                💡 Tip: Check your Supabase dashboard to verify your account exists and email confirmation status.
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting || loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onSwitchToSignup}
          disabled={isSubmitting || loading}
          className="text-blue-400 hover:text-blue-300 text-sm transition-colors disabled:opacity-50"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
}
