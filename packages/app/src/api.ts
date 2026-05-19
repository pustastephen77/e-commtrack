const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchProducts() {
  const res = await fetch(`${BASE}/products`);
  return res.json();
}

export async function addWishlist(userId: string, productId: string) {
  const res = await fetch(`${BASE}/users/${userId}/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId })
  });
  return res.json();
}

export async function fetchWishlist(userId: string) {
  const res = await fetch(`${BASE}/users/${userId}/wishlist`);
  return res.json();
}

export async function fetchPriceHistory(productId: string) {
  const res = await fetch(`${BASE}/products/${productId}/priceHistory`);
  return res.json();
}
