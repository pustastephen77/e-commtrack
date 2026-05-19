export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number; // in cents
  currency?: string;
  sku?: string;
}

export interface PriceSnapshot {
  productId: string;
  timestamp: string; // ISO
  price: number; // in cents
}

export interface PriceHistoryEntry {
  timestamp: string;
  price: number;
}

export interface WishlistItem {
  userId: string;
  productId: string;
  addedAt: string; // ISO
}

export interface User {
  id: string;
  email: string;
  name?: string;
}
