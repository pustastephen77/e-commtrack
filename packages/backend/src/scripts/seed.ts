import { prisma } from '../prisma';

async function main() {
  console.log('Seeding demo data...');

  // Create demo products
  const products = [
    { title: 'SuperPhone X', price: 59900 },
    { title: 'EarBuds Pro', price: 8999 },
    { title: 'Smartwatch Z', price: 12999 }
  ];

  const created: { id: string; title: string }[] = [];
  for (const p of products) {
    const prod = await prisma.product.upsert({
      where: { title: p.title },
      update: { price: p.price },
      create: { title: p.title, price: p.price }
    });
    created.push({ id: prod.id, title: prod.title });
  }

  // helper to add snapshot history; produce slightly noisy historical data
  async function addSnapshots(productId: string, base: number, dropLatest = false) {
    const now = Date.now();
    const snaps = [] as { price: number; timestamp: Date }[];
    for (let i = 0; i < 25; i++) {
      // older first
      const t = new Date(now - (25 - i) * 60 * 60 * 1000);
      // create small fluctuation
      const noise = Math.round((Math.sin(i / 3) * 0.03 + (Math.random() - 0.5) * 0.02) * base);
      snaps.push({ price: Math.max(100, base + noise), timestamp: t });
    }
    if (dropLatest) {
      // make last snapshot significantly lower to trigger z-score
      snaps[snaps.length - 1].price = Math.round(base * 0.6);
    }
    for (const s of snaps) {
      await prisma.priceSnapshot.create({ data: { productId, price: s.price, timestamp: s.timestamp } });
    }
  }

  // Add snapshots for each product; make first product have a drop
  await addSnapshots(created[0].id, 59900, true);
  await addSnapshots(created[1].id, 8999, false);
  await addSnapshots(created[2].id, 12999, false);

  // create demo user and wishlist entries
  const user = await prisma.user.upsert({ where: { id: 'demo-user' }, update: {}, create: { id: 'demo-user', email: 'demo-user@example.com', name: 'Demo User' } });
  await prisma.wishlistItem.deleteMany({ where: { userId: user.id } });
  for (const p of created) {
    await prisma.wishlistItem.create({ data: { userId: user.id, productId: p.id } });
  }

  console.log('Seed complete. Products created:', created.map(c => c.title));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
