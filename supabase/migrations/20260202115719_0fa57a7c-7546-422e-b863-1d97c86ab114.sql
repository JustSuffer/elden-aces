-- =====================================================
-- ACORIA BACKEND SYSTEMS MIGRATION
-- =====================================================

-- 1. LP SYSTEM: Add LP and rank columns to game_stats
ALTER TABLE public.game_stats 
ADD COLUMN IF NOT EXISTS lp integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank_tier text NOT NULL DEFAULT 'Unranked';

-- 2. ECONOMY: Add divine_coins to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS divine_coins integer NOT NULL DEFAULT 0;

-- 3. USER DECKS TABLE (Cloud Save)
CREATE TABLE IF NOT EXISTS public.user_decks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  main_class text NOT NULL,
  filler_classes text[] NOT NULL DEFAULT '{}',
  deck_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.user_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own decks" 
ON public.user_decks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks" 
ON public.user_decks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks" 
ON public.user_decks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks" 
ON public.user_decks FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_decks_updated_at
BEFORE UPDATE ON public.user_decks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. BOT MATCH STATS TABLE (Match History for PvE)
CREATE TABLE IF NOT EXISTS public.bot_match_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  player_class text NOT NULL,
  opponent_class text NOT NULL,
  opponent_name text NOT NULL DEFAULT 'Training Bot',
  result text NOT NULL CHECK (result IN ('win', 'loss')),
  player_final_hp integer NOT NULL DEFAULT 0,
  opponent_final_hp integer NOT NULL DEFAULT 0,
  deck_used_name text,
  divine_coins_earned integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bot_match_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bot stats" 
ON public.bot_match_stats FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bot stats" 
ON public.bot_match_stats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. FRIEND REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend requests" 
ON public.friend_requests FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests" 
ON public.friend_requests FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update requests they received" 
ON public.friend_requests FOR UPDATE 
USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own requests" 
ON public.friend_requests FOR DELETE 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Trigger for updated_at
CREATE TRIGGER update_friend_requests_updated_at
BEFORE UPDATE ON public.friend_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. FRIENDSHIPS TABLE (Accepted friends)
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensures no duplicate pairs
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships" 
ON public.friendships FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create friendships" 
ON public.friendships FOR INSERT 
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their own friendships" 
ON public.friendships FOR DELETE 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 7. PRIVATE MATCH INVITES TABLE (1v1 Challenges)
CREATE TABLE IF NOT EXISTS public.private_match_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  sender_deck_id uuid,
  receiver_deck_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'started')),
  match_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.private_match_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own private invites" 
ON public.private_match_invites FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send private invites" 
ON public.private_match_invites FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their invites" 
ON public.private_match_invites FOR UPDATE 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can cancel their invites" 
ON public.private_match_invites FOR DELETE 
USING (auth.uid() = sender_id);

-- Trigger for updated_at
CREATE TRIGGER update_private_match_invites_updated_at
BEFORE UPDATE ON public.private_match_invites
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. ONLINE PRESENCE (for showing online friends)
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'in_game', 'offline')),
  last_seen timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view presence" 
ON public.user_presence FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own presence" 
ON public.user_presence FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presence" 
ON public.user_presence FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for presence and invites
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_match_invites;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;