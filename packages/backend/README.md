# packages/backend

Node.js backend placeholder.

Suggested stack:
- Node.js + Express
- SQLite via Prisma ORM (easy local dev) or Postgres for production
- WebSocket or Server-Sent Events for push notifications

Scaffold with:

```bash
cd packages/backend
npm init -y
npm install express prisma @prisma/client
npx prisma init --datasource-provider sqlite
```
