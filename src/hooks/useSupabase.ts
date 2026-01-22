import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isPasswordRecovery: boolean;
}

export function useSupabase() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isPasswordRecovery: false,
  });

  useEffect(() => {
    // Track if we've detected recovery - persist this so it doesn't get lost
    let recoveryDetected = false;

    // Helper function to check if URL contains recovery token
    const checkForRecoveryToken = (): boolean => {
      const hash = window.location.hash;
      console.log('Checking URL hash:', hash);
      if (!hash || hash.length <= 1) {
        // If hash is empty but we previously detected recovery, keep it
        return recoveryDetected;
      }
      
      const hashParams = new URLSearchParams(hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      console.log('Hash params - type:', type, 'access_token:', accessToken ? 'present' : 'missing');
      
      const isRecovery = type === 'recovery' && !!accessToken;
      if (isRecovery) {
        recoveryDetected = true; // Persist the recovery state
      }
      return isRecovery;
    };

    // Check hash immediately on mount (before Supabase processes it)
    const initialHash = window.location.hash;
    if (initialHash && initialHash.length > 1) {
      const hashParams = new URLSearchParams(initialHash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      if (type === 'recovery' && accessToken) {
        recoveryDetected = true;
        console.log('Recovery detected from initial hash check');
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        hash: window.location.hash,
        recoveryDetected
      });
      
      // Use persisted recovery state
      const isRecovery = recoveryDetected || checkForRecoveryToken();
      console.log('Is recovery from URL check:', isRecovery);
      
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: error?.message ?? null,
        isPasswordRecovery: isRecovery,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', { event, hasSession: !!session, hash: window.location.hash, recoveryDetected });
      
      // Check URL for recovery token OR use persisted recovery state
      // This handles cases where Supabase processes the recovery token and creates a session
      const isRecovery = event === 'PASSWORD_RECOVERY' || recoveryDetected || checkForRecoveryToken();
      console.log('Is recovery:', isRecovery, 'from event:', event === 'PASSWORD_RECOVERY', 'from persisted:', recoveryDetected);
      
      // If PASSWORD_RECOVERY event fires, persist it
      if (event === 'PASSWORD_RECOVERY') {
        recoveryDetected = true;
      }
      
      // Handle password recovery event - keep session for updateUser to work
      // but set flag so user isn't considered "authenticated" for UI purposes
      if (isRecovery) {
        console.log('Setting password recovery state');
        setAuthState({
          user: session?.user ?? null,
          session, // Keep session so updateUser can work
          loading: false,
          error: null,
          isPasswordRecovery: true,
        });
      } else {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
          isPasswordRecovery: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
        isPasswordRecovery: false,
      });

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      const authError = error as AuthError;
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: authError.message,
      }));
      return { user: null, session: null, error: authError.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log the error for debugging
        console.error('Login error:', error);
        throw error;
      }

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
        isPasswordRecovery: false,
      });

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = authError.message;
      
      // Provide more helpful error messages
      if (errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before logging in.';
      } else if (errorMessage.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      }
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { user: null, session: null, error: errorMessage };
    }
  };

  const signOut = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
        isPasswordRecovery: false,
      });

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: authError.message,
      }));
      return { error: authError.message };
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Use the current origin - Supabase will append the recovery token to this URL
      // The redirect URL configured in Supabase dashboard should match this
      const redirectTo = `${window.location.origin}`;
      console.log('Sending password reset email to:', email);
      console.log('Redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo,
      });

      if (error) {
        console.error('Password reset email error:', error);
        throw error;
      }

      console.log('Password reset email sent successfully', data);
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = authError.message;
      const statusCode = authError.status || (error as any)?.status;
      
      console.error('Password reset email failed:', {
        error: authError,
        message: errorMessage,
        statusCode: statusCode,
      });
      
      // Provide more helpful error messages
      if (statusCode === 429 || errorMessage.includes('rate limit') || errorMessage.includes('too many') || errorMessage.includes('429')) {
        errorMessage = 'Too many password reset requests. Please wait 15-30 minutes before requesting another email, or check your spam folder for the previous email.';
      } else if (errorMessage.includes('not found') || errorMessage.includes('user not found')) {
        errorMessage = 'No account found with this email address.';
      } else if (errorMessage.includes('email')) {
        errorMessage = `Email error: ${errorMessage}`;
      } else if (!errorMessage || errorMessage === '') {
        errorMessage = 'Failed to send password reset email. Please try again later.';
      }
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { error: errorMessage };
    }
  };

  const resetPassword = async (newPassword: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Verify we have an active session before attempting to update password
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session) {
        throw new Error('No active session found. Please click the password reset link from your email again.');
      }

      // Update the password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      // Verify the update was successful
      if (!data.user) {
        throw new Error('Password update failed. Please try again.');
      }

      // After successful password reset, sign out the user
      // They should log in with their new password
      await supabase.auth.signOut();

      // Clear the URL hash after successful reset
      window.history.replaceState(null, '', window.location.pathname);

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
        isPasswordRecovery: false,
      });

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = authError.message;
      
      // Provide more helpful error messages
      if (errorMessage.includes('same as')) {
        errorMessage = 'New password must be different from your current password.';
      } else if (errorMessage.includes('weak')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (errorMessage.includes('session')) {
        errorMessage = 'Session expired. Please click the password reset link from your email again.';
      } else if (errorMessage.includes('token') || errorMessage.includes('expired')) {
        errorMessage = 'Password reset link has expired. Please request a new one.';
      }
      
      console.error('Password reset error:', errorMessage, error);
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { error: errorMessage };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    resetPassword,
    // User is authenticated only if they have both user and session, AND it's not a password recovery flow
    isAuthenticated: !!authState.user && !!authState.session && !authState.isPasswordRecovery,
  };
}
