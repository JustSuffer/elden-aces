
CREATE OR REPLACE FUNCTION public.validate_match_state_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only participants may update the match (defense in depth alongside RLS)
  IF auth.uid() IS NOT NULL
     AND auth.uid() <> OLD.player1_id
     AND auth.uid() <> OLD.player2_id THEN
    RAISE EXCEPTION 'Only match participants may update this match';
  END IF;

  -- Prevent unauthorized round advancement
  IF NEW.current_round IS DISTINCT FROM OLD.current_round
     AND NEW.current_round > COALESCE(OLD.current_round, 0) THEN
    IF NOT (COALESCE(OLD.player1_next_round_ready, false)
            AND COALESCE(OLD.player2_next_round_ready, false)) THEN
      RAISE EXCEPTION 'Cannot advance round: both players must be ready';
    END IF;
    NEW.player1_next_round_ready := false;
    NEW.player2_next_round_ready := false;
    NEW.player1_ready := false;
    NEW.player2_ready := false;
  END IF;

  -- Prevent game start without both players ready
  IF NEW.game_started = true AND COALESCE(OLD.game_started, false) = false THEN
    IF NOT (COALESCE(OLD.player1_ready, false)
            AND COALESCE(OLD.player2_ready, false)) THEN
      RAISE EXCEPTION 'Cannot start game: both players must be ready';
    END IF;
  END IF;

  -- Prevent rewinding rounds
  IF NEW.current_round IS NOT NULL
     AND OLD.current_round IS NOT NULL
     AND NEW.current_round < OLD.current_round THEN
    RAISE EXCEPTION 'Cannot decrease current_round';
  END IF;

  -- Prevent reverting game_started flag
  IF COALESCE(OLD.game_started, false) = true AND NEW.game_started = false THEN
    RAISE EXCEPTION 'Cannot revert game_started flag';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_match_state_transitions ON public.matches;
CREATE TRIGGER enforce_match_state_transitions
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_match_state_changes();
