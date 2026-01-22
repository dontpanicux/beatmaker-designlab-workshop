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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: error?.message ?? null,
        isPasswordRecovery: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle password recovery event - keep session for updateUser to work
      // but set flag so user isn't considered "authenticated" for UI purposes
      if (event === 'PASSWORD_RECOVERY') {
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}`,
      });

      if (error) throw error;

      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: null,
      }));

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      let errorMessage = authError.message;
      
      // Provide more helpful error messages
      if (errorMessage.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (errorMessage.includes('not found')) {
        errorMessage = 'No account found with this email address.';
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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // After successful password reset, sign out the user
      // They should log in with their new password
      await supabase.auth.signOut();

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
      }
      
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
