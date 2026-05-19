import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { prisma } from './prisma';
import { startWorker, notifier } from './priceWorker';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple SSE subscription for price drop events
const sseClients: Set<express.Response> = new Set();

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write('retry: 10000\n\n');
  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

notifier.on('priceDrop', (evt) => {
  const payload = `data: ${JSON.stringify(evt)}\n\n`;
  for (const res of sseClients) {
    try { res.write(payload); } catch (e) { sseClients.delete(res); }
  }
});

// Products
app.get('/products', async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.post('/products', async (req, res) => {
  const { title, description, price, currency, sku } = req.body;
  const p = await prisma.product.create({ data: { title, description, price, currency, sku } });
  res.json(p);
});

// Price snapshots (append)
app.post('/products/:id/price', async (req, res) => {
  const { id } = req.params;
  const { price } = req.body;
  const snap = await prisma.priceSnapshot.create({ data: { productId: id, price } });
  res.json(snap);
});

app.get('/products/:id/priceHistory', async (req, res) => {
  const { id } = req.params;
  const snaps = await prisma.priceSnapshot.findMany({ where: { productId: id }, orderBy: { timestamp: 'desc' }, take: 50 });
  res.json(snaps);
});

// Wishlist
app.get('/users/:userId/wishlist', async (req, res) => {
  const { userId } = req.params;
  const items = await prisma.wishlistItem.findMany({ where: { userId }, include: { product: true } });
  res.json(items);
});

app.post('/users/:userId/wishlist', async (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;
  try {
    // ensure user exists (upsert) to allow demo users without separate user creation
    await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId, email: `${userId}@example.com` } });
    const item = await prisma.wishlistItem.create({ data: { userId, productId } });
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: 'Could not add to wishlist' });
  }
});

// Start
const port = Number(process.env.PORT || 4000);
app.listen(port, async () => {
  console.log(`Backend listening on http://localhost:${port}`);
  // start periodic worker
  startWorker(10_000);
});
