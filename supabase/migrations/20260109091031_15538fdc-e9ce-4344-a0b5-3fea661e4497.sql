-- Enable REPLICA IDENTITY FULL for matches table to ensure complete row data in realtime updates
-- This is critical for proper card synchronization between players
ALTER TABLE public.matches REPLICA IDENTITY FULL;