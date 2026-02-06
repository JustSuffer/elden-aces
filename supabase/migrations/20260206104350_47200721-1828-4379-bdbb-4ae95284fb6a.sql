-- Allow authenticated users to read any deck (needed for private matches where you fetch opponent's deck)
CREATE POLICY "Authenticated users can view any deck for matches"
ON public.user_decks
FOR SELECT
USING (auth.uid() IS NOT NULL);