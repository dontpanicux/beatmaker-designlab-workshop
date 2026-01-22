export interface Beat {
  id: string;
  user_id: string;
  name: string;
  bpm: number;
  sequencer_data: boolean[][]; // 5 tracks × 16 steps
  created_at: string;
  updated_at: string;
}

export interface BeatCreateInput {
  name: string;
  bpm: number;
  sequencer_data: boolean[][];
}
