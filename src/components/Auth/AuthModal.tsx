import { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetPasswordForm } from './ResetPasswordForm';

export type AuthModalMode = 'login' | 'signup' | 'forgot' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: AuthModalMode;
  message?: string;
  loading?: boolean;
  signIn: (email: string, password: string) => Promise<{ user: unknown; session: unknown; error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ user: unknown; session: unknown; error: string | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (newPassword: string) => Promise<{ error: string | null }>;
  user: unknown;
  session: unknown;
  isPasswordRecovery: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  message,
  loading = false,
  signIn,
  signUp,
  sendPasswordResetEmail,
  resetPassword,
  user,
  session,
  isPasswordRecovery,
}: AuthModalProps) {
  const [authMode, setAuthMode] = useState<AuthModalMode>(initialMode);

  // Sync internal mode with initialMode when modal opens or initialMode changes (e.g. recovery)
  useEffect(() => {
    if (isOpen) {
      setAuthMode(isPasswordRecovery ? 'reset' : initialMode);
    }
  }, [isOpen, initialMode, isPasswordRecovery]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLoginSuccess = (result: { error: string | null }) => {
    if (!result.error) {
      onSuccess?.();
      onClose();
    }
  };

  const handleSignupSuccess = (result: { error: string | null }) => {
    if (!result.error) {
      onSuccess?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col items-center max-w-md w-full">
        {message && (
          <p className="text-gray-200 text-center mb-4 text-sm">{message}</p>
        )}
        {authMode === 'login' && (
          <LoginForm
            onLogin={async (email, password) => {
              const result = await signIn(email, password);
              handleLoginSuccess(result);
              return result;
            }}
            onSwitchToSignup={() => setAuthMode('signup')}
            onSwitchToForgotPassword={() => setAuthMode('forgot')}
            loading={loading}
          />
        )}
        {authMode === 'signup' && (
          <SignupForm
            onSignup={async (email, password) => {
              const result = await signUp(email, password);
              handleSignupSuccess(result);
              return result;
            }}
            onSwitchToLogin={() => setAuthMode('login')}
            loading={loading}
          />
        )}
        {authMode === 'forgot' && (
          <ForgotPasswordForm
            onSendResetEmail={sendPasswordResetEmail}
            onSwitchToLogin={() => setAuthMode('login')}
            loading={loading}
          />
        )}
        {authMode === 'reset' && (
          <ResetPasswordForm
            onResetPassword={resetPassword}
            onSwitchToLogin={() => {
              setAuthMode('login');
              onClose();
            }}
            loading={loading}
            hasSession={!!user && !!session}
          />
        )}
      </div>
    </div>
  );
}
