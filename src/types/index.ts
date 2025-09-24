export type AdCategory = 'figures' | 'merch' | 'plush';
export type AdType = 'sale' | 'exchange';

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  ad_type: string[];
  images: string[];
  location: string;
  published_at: string;
  expires_at: string;
  archived: boolean;
  status: 'active' | 'sold' | 'exchanged';
  created_at: string;
  author_id: number;
  author_name: string;
  contact_info?: string | null;
  updated_at: string;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}