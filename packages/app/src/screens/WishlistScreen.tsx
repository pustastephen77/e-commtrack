import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import { fetchProducts, addWishlist, fetchWishlist, fetchPriceHistory } from '../api';
import PriceChart from '../components/PriceChart';

const USER_ID = 'demo-user';

export default function WishlistScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [priceMap, setPriceMap] = useState<Record<string, { timestamp: string; price: number }[]>>({});

  useEffect(() => {
    fetchProducts().then(setProducts);
    refreshWishlist();
  }, []);

  async function refreshWishlist() {
    const items = await fetchWishlist(USER_ID);
    setWishlist(items);
    // fetch price history for each wishlist product
    const ids = Array.from(new Set(items.map((it: any) => it.productId)));
    const entries = await Promise.all(ids.map(async (id: string) => {
      try {
        const snaps = await fetchPriceHistory(id);
        return { id, snaps };
      } catch (e) {
        return { id, snaps: [] };
      }
    }));
    const map: Record<string, { timestamp: string; price: number }[]> = {};
    for (const e of entries) map[e.id] = e.snaps;
    setPriceMap(map);
  }

  async function handleAdd(productId: string) {
    await addWishlist(USER_ID, productId);
    Alert.alert('Added to wishlist');
    refreshWishlist();
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Products</Text>
      <FlatList data={products} keyExtractor={p => p.id} renderItem={({ item }) => (
        <View style={{ paddingVertical: 8 }}>
          <Text>{item.title} — ₱{(item.price/100).toFixed(2)}</Text>
          <Button title="Add to Wishlist" onPress={() => handleAdd(item.id)} />
        </View>
      )} />

      <View style={{ height: 1, backgroundColor: '#ddd', marginVertical: 12 }} />
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Your Wishlist</Text>
      <FlatList data={wishlist} keyExtractor={i => i.id} renderItem={({ item }) => (
        <View style={{ paddingVertical: 8 }}>
          <Text>{item.product.title} — ₱{(item.product.price/100).toFixed(2)}</Text>
          <PriceChart data={priceMap[item.productId] || []} width={240} height={64} />
        </View>
      )} />
    </View>
  );
}
