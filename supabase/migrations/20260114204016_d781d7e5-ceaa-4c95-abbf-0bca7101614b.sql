-- Ensure realtime UPDATE payloads include full row so clients don't merge stale fields/ready flags
ALTER TABLE public.matches REPLICA IDENTITY FULL;

-- Ensure matches table is part of realtime publication (idempotent)
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
END
$$;