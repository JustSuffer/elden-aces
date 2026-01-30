-- Create bot_match_stats table
CREATE TABLE IF NOT EXISTS public.bot_match_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    player_class TEXT NOT NULL,
    player_deck_name TEXT,
    opponent_class TEXT NOT NULL,
    opponent_name TEXT,
    result TEXT NOT NULL CHECK (result IN ('win', 'lose')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.bot_match_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own bot stats" 
ON public.bot_match_stats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bot stats" 
ON public.bot_match_stats FOR SELECT 
USING (auth.uid() = user_id);
