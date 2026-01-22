import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Beat, BeatCreateInput } from '../types/beat';

export function useBeats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => {
    setError(null);
  };

  const saveBeat = async (beatData: BeatCreateInput): Promise<{ beat: Beat | null; error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Insert the beat into the database
      const { data, error: insertError } = await supabase
        .from('beats')
        .insert({
          user_id: user.id,
          name: beatData.name,
          bpm: beatData.bpm,
          sequencer_data: beatData.sequencer_data,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setLoading(false);
      return { beat: data as Beat, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save beat';
      setError(errorMessage);
      setLoading(false);
      return { beat: null, error: errorMessage };
    }
  };

  const updateBeat = async (beatId: string, beatData: BeatCreateInput): Promise<{ beat: Beat | null; error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Update the beat in the database
      const { data, error: updateError } = await supabase
        .from('beats')
        .update({
          name: beatData.name,
          bpm: beatData.bpm,
          sequencer_data: beatData.sequencer_data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', beatId)
        .eq('user_id', user.id) // Ensure user can only update their own beats
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setLoading(false);
      return { beat: data as Beat, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update beat';
      setError(errorMessage);
      setLoading(false);
      return { beat: null, error: errorMessage };
    }
  };

  const loadBeat = async (beatId: string): Promise<{ beat: Beat | null; error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('beats')
        .select('*')
        .eq('id', beatId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setLoading(false);
      return { beat: data as Beat, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load beat';
      setError(errorMessage);
      setLoading(false);
      return { beat: null, error: errorMessage };
    }
  };

  const listBeats = async (): Promise<{ beats: Beat[]; error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('beats')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setLoading(false);
      return { beats: (data || []) as Beat[], error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load beats';
      setError(errorMessage);
      setLoading(false);
      return { beats: [], error: errorMessage };
    }
  };

  const deleteBeat = async (beatId: string): Promise<{ error: string | null }> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('beats')
        .delete()
        .eq('id', beatId);

      if (deleteError) {
        throw deleteError;
      }

      setLoading(false);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete beat';
      setError(errorMessage);
      setLoading(false);
      return { error: errorMessage };
    }
  };

  return {
    saveBeat,
    updateBeat,
    loadBeat,
    listBeats,
    deleteBeat,
    clearError,
    loading,
    error,
  };
}
