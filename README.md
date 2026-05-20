e-commtrack: An E‑commerce Tracker

Selected track: Wishlist & Price Drop Notifier

This monorepo contains:
- packages/app — Expo React Native app
- packages/backend — Node.js API (Express/Prisma suggested)
- packages/shared — shared TypeScript types

Next steps:
1. Design core e‑commerce domain and API spec.
2. Implement backend endpoints and the wishlist/price-notifier service.

Run commands (after installing dependencies):

```bash
# start backend
pnpm --filter backend dev

# start app (from root)
pnpm --filter app start
```
