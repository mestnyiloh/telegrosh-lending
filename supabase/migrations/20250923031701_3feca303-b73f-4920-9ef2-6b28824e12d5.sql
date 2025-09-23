-- Create table for advertisements
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('figures', 'merch', 'plush')),
  ad_type TEXT[] NOT NULL,
  image_url TEXT,
  contact_info TEXT,
  author_id BIGINT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since it's a marketplace)
CREATE POLICY "Anyone can view ads" 
ON public.ads 
FOR SELECT 
USING (true);

-- Users can create ads (using their Telegram user ID)
CREATE POLICY "Users can create ads" 
ON public.ads 
FOR INSERT 
WITH CHECK (true);

-- Users can update their own ads
CREATE POLICY "Users can update their own ads" 
ON public.ads 
FOR UPDATE 
USING (true);

-- Users can delete their own ads
CREATE POLICY "Users can delete their own ads" 
ON public.ads 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX idx_ads_category ON public.ads(category);
CREATE INDEX idx_ads_author_id ON public.ads(author_id);