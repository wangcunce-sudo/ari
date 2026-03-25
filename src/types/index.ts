// ===== Era Types =====
export interface Track {
  title: string;
  audioSrc?: string;
  duration?: string;
}

export interface MusicVideo {
  title: string;
  src: string;        // local /videos/xxx.mp4 or YouTube URL
  year: number;
  thumbnail?: string; // /images/thumbs/xxx.jpg
  isYoutube?: boolean;
}

export interface EraProduct {
  id: number;
  name: string;
  price: number;
  badge?: string;
  img?: string;
}

export interface Era {
  id: string;
  name: string;
  year: number;
  tagline: string;
  heroImage: string;
  heroObjectPosition?: string;
  spriteClass: string;
  accentColor: string;
  tracks: Track[];
  videos: MusicVideo[];
  products?: EraProduct[];
}

// ===== Store Types =====
export interface Product {
  id: number;
  name: string;
  era: string;
  price: number;
  category?: string;
  badge?: string | null;
  desc: string;
  img?: string | null;
  inStock?: boolean;
}

export interface CartItem {
  productId: number;
  qty: number;
  name: string;
  price: number;
  img?: string | null;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  shipping: ShippingInfo;
}

export interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

// ===== UI Types =====
export type CheckoutStep = 'shipping' | 'review' | 'payment' | 'success';
