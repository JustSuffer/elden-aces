-- Add game_started field for ready sync and next_round_ready fields for round sync
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS game_started boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS player1_next_round_ready boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS player2_next_round_ready boolean DEFAULT false;