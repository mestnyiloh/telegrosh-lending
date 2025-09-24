-- Добавляем новые поля для управления объявлениями
ALTER TABLE public.ads 
ADD COLUMN location TEXT,
ADD COLUMN published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days'),
ADD COLUMN archived BOOLEAN DEFAULT false,
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'exchanged'));

-- Обновляем существующие записи
UPDATE public.ads 
SET 
  location = 'Не указан',
  published_at = created_at,
  expires_at = created_at + INTERVAL '30 days'
WHERE location IS NULL;

-- Делаем location обязательным
ALTER TABLE public.ads 
ALTER COLUMN location SET NOT NULL;

-- Добавляем индексы для производительности
CREATE INDEX idx_ads_published_at ON public.ads(published_at DESC);
CREATE INDEX idx_ads_expires_at ON public.ads(expires_at);
CREATE INDEX idx_ads_archived ON public.ads(archived);
CREATE INDEX idx_ads_status ON public.ads(status);
CREATE INDEX idx_ads_location ON public.ads(location);

-- Создаем функцию для автоматического архивирования просроченных объявлений
CREATE OR REPLACE FUNCTION public.archive_expired_ads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ads 
  SET archived = true 
  WHERE expires_at <= now() 
    AND archived = false;
END;
$$;