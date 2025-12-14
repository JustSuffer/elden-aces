-- Create matchmaking_queue table for online matchmaking
CREATE TABLE public.matchmaking_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deck_data JSONB NOT NULL,
  deck_name TEXT NOT NULL,
  main_class TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'searching',
  matched_with UUID,
  match_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table for active games
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID NOT NULL,
  player2_id UUID NOT NULL,
  player1_deck JSONB NOT NULL,
  player2_deck JSONB NOT NULL,
  game_state JSONB,
  status TEXT NOT NULL DEFAULT 'active',
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matchmaking_queue
CREATE POLICY "Users can view all searching players" 
ON public.matchmaking_queue 
FOR SELECT 
USING (status = 'searching' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own queue entry" 
ON public.matchmaking_queue 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue entry" 
ON public.matchmaking_queue 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queue entry" 
ON public.matchmaking_queue 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for matches
CREATE POLICY "Users can view their own matches" 
ON public.matches 
FOR SELECT 
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can create matches" 
ON public.matches 
FOR INSERT 
WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can update their own matches" 
ON public.matches 
FOR UPDATE 
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Enable realtime for matchmaking_queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_matchmaking_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_matchmaking_queue_updated_at
BEFORE UPDATE ON public.matchmaking_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_matchmaking_updated_at_column();

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_matchmaking_updated_at_column();