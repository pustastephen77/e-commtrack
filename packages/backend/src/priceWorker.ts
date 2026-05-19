import { prisma } from './prisma';
import { EventEmitter } from 'events';

const N = 20; // rolling window
const THRESHOLD_Z = 1.5;

export const notifier = new EventEmitter();

function mean(xs: number[]) {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stddev(xs: number[]) {
  const mu = mean(xs);
  const v = xs.reduce((s, x) => s + (x - mu) * (x - mu), 0) / xs.length;
  return Math.sqrt(v);
}

export async function scanForDrops() {
  const products = await prisma.product.findMany({ select: { id: true, title: true } });
  for (const p of products) {
    const snaps = await prisma.priceSnapshot.findMany({
      where: { productId: p.id },
      orderBy: { timestamp: 'desc' },
      take: N
    });
    if (snaps.length < 2) continue;
    const prices = snaps.map(s => s.price).reverse(); // oldest -> newest
    const latest = prices[prices.length - 1];
    const rest = prices.slice(0, -1);
    const mu = mean(rest);
    const sd = stddev(rest);
    if (sd === 0) continue;
    const z = (mu - latest) / sd; // drop relative to historical mean
    if (z >= THRESHOLD_Z) {
      // emit price-drop event
      notifier.emit('priceDrop', {
        productId: p.id,
        title: p.title,
        latestPrice: latest,
        zScore: z,
        timestamp: new Date().toISOString()
      });
    }
  }
}

let running = false;
export function startWorker(intervalMs = 30_000) {
  if (running) return;
  running = true;
  setInterval(() => {
    scanForDrops().catch(err => console.error('scanForDrops', err));
  }, intervalMs);
}
