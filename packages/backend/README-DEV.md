# Backend dev notes

After installing dependencies, generate Prisma client and run migrations:

```bash
cd packages/backend
pnpm install
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run dev
```

This starts the Express server and a background worker that scans price history for drops.

Seed demo data (creates products, price history, and a `demo-user` with wishlist items):

```bash
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run seed
```

See `SEED-EXAMPLES.md` for quick curl examples and SSE subscription.
