-- Drop the old restrictive policy that only allows viewing own decks
DROP POLICY IF EXISTS "Users can view their own decks" ON public.user_decks;