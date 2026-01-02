-- Add columns for online game synchronization
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS player1_field jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS player2_field jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS player1_ready boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS player2_ready boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS current_round integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS phase text DEFAULT 'placement';