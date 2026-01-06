-- Match History: Add final HP and result columns to matches table
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS player1_final_hp integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS player2_final_hp integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS finished_at timestamp with time zone DEFAULT NULL;

-- ELO/Ranked System: Add elo_rating to game_stats
ALTER TABLE public.game_stats
ADD COLUMN IF NOT EXISTS elo_rating integer NOT NULL DEFAULT 1000;

-- Rematch System: Create rematch_requests table
CREATE TABLE IF NOT EXISTS public.rematch_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  requester_id uuid NOT NULL,
  opponent_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  new_match_id uuid DEFAULT NULL,
  UNIQUE(match_id, requester_id)
);

-- Enable RLS on rematch_requests
ALTER TABLE public.rematch_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rematch_requests
CREATE POLICY "Users can view their own rematch requests"
ON public.rematch_requests
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can create rematch requests"
ON public.rematch_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update rematch requests they are part of"
ON public.rematch_requests
FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = opponent_id);

CREATE POLICY "Users can delete their own rematch requests"
ON public.rematch_requests
FOR DELETE
USING (auth.uid() = requester_id);

-- Enable realtime for rematch_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.rematch_requests;