export type AdCategory = 'figures' | 'merch' | 'plush';
export type AdType = 'sale' | 'exchange';

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: AdCategory;
  ad_type: AdType[];
  image_url?: string;
  created_at: string;
  author_id: number;
  author_name: string;
  contact_info?: string;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}