-- Create increment_coins function for atomic coin updates
CREATE OR REPLACE FUNCTION public.increment_coins(amount integer, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET divine_coins = divine_coins + amount,
      updated_at = now()
  WHERE profiles.user_id = increment_coins.user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_coins(integer, uuid) TO authenticated;