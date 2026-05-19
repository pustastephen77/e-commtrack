# Seed examples and quick curl commands

From `packages/backend`, run:

```bash
pnpm install
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run seed
pnpm run dev
```

API examples:

- List products:
```
curl http://localhost:4000/products
```

- Add a manual price snapshot:
```
curl -X POST http://localhost:4000/products/<productId>/price -H "Content-Type: application/json" -d '{"price":49900}'
```

- Subscribe to SSE price-drop events (use `curl --no-buffer` to keep open):
```
curl --no-buffer http://localhost:4000/events
```
