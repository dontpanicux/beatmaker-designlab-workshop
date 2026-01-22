import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useSupabase() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: error?.message ?? null,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      });
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

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!authState.user,
  };
}
