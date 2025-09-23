-- Изменим image_url на массив изображений для поддержки нескольких фото
ALTER TABLE public.ads 
DROP COLUMN image_url;

ALTER TABLE public.ads 
ADD COLUMN images TEXT[] DEFAULT '{}';

-- Добавим индекс для поиска по изображениям
CREATE INDEX idx_ads_images ON public.ads USING GIN(images);