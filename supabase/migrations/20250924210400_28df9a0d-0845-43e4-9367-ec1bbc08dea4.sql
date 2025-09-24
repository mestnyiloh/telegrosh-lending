-- Исправляем функцию с правильным search_path
CREATE OR REPLACE FUNCTION public.archive_expired_ads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ads 
  SET archived = true 
  WHERE expires_at <= now() 
    AND archived = false;
END;
$$;