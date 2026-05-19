import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, FlatList, Alert } from 'react-native';
import WishlistScreen from './src/screens/WishlistScreen';
import { fetchProducts } from './src/api';
import 'event-source-polyfill';

export default function App() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const es = new EventSource('http://localhost:4000/events');
    es.onmessage = (ev: any) => {
      try {
        const data = JSON.parse(ev.data);
        setNotifications(n => [data, ...n].slice(0, 10));
      } catch (e) { }
    };
    es.onerror = () => { es.close(); };
    return () => es.close();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>ITMSD4 — Wishlist & Price Notifier</Text>
      </View>
      <WishlistScreen />
      <View style={{ position: 'absolute', right: 12, top: 12 }}>
        {notifications.map((n, i) => (
          <View key={i} style={{ backgroundColor: '#fde68a', padding: 8, marginBottom: 6 }}>
            <Text>Price drop: {n.title} now ₱{(n.latestPrice/100).toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
