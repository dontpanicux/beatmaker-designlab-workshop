-- Migration: Create beats table with Row Level Security
-- Run this in your Supabase SQL Editor or via Supabase CLI

-- Create the beats table
CREATE TABLE IF NOT EXISTS beats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bpm INTEGER,
  sequencer_data JSONB NOT NULL, -- Store 5×16 grid state as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS beats_user_id_idx ON beats(user_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS beats_created_at_idx ON beats(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own beats" ON beats;
DROP POLICY IF EXISTS "Users can insert own beats" ON beats;
DROP POLICY IF EXISTS "Users can update own beats" ON beats;
DROP POLICY IF EXISTS "Users can delete own beats" ON beats;

-- Policy: Users can SELECT (read) only their own beats
CREATE POLICY "Users can view own beats" 
  ON beats 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT (create) beats only with their own user_id
CREATE POLICY "Users can insert own beats" 
  ON beats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE (modify) only their own beats
CREATE POLICY "Users can update own beats" 
  ON beats 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE (remove) only their own beats
CREATE POLICY "Users can delete own beats" 
  ON beats 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS update_beats_updated_at ON beats;
CREATE TRIGGER update_beats_updated_at
  BEFORE UPDATE ON beats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add a comment to document the table
COMMENT ON TABLE beats IS 'Stores user-created beats with sequencer data. Protected by Row Level Security.';
COMMENT ON COLUMN beats.sequencer_data IS 'JSONB array representing 5 tracks × 16 steps grid state';
