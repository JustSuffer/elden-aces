-- Fix online round desync by tracking which round each player's field belongs to
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS player1_field_round integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS player2_field_round integer DEFAULT 0;

-- Ensure realtime UPDATE events include full row data (prevents stale deck/field merges)
ALTER TABLE public.matches REPLICA IDENTITY FULL;

-- Ensure matches table is in realtime publication (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;
END $$;