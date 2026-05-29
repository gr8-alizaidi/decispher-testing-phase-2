# checkout-service (Decispher Stage-2 simulation repo)

A deliberately realistic e-commerce checkout API: **Fastify + Drizzle + Postgres + Stripe**.

It embodies four non-obvious team decisions that are NOT visible from the code alone unless you
already know them — exactly the kind of context Decispher serves:

1. **Money = integer cents, never floats** (`src/lib/money.ts`, `_cents` columns)
2. **Idempotency-Key required on charge POSTs** (`src/middleware/idempotency.ts`)
3. **Inventory uses `SELECT … FOR UPDATE`, not optimistic retry** (`src/services/inventory.ts`)
4. **Never store raw PAN — Stripe tokenization, token + last4 only** (`orders` schema)

## Files
- `src/db/schema/orders.ts` — orders, order_items, inventory, idempotency_keys
- `src/db/client.ts` — Drizzle client
- `src/lib/money.ts` — integer-cents money helpers
- `src/middleware/idempotency.ts` — idempotency pre-handler + persist
- `src/services/inventory.ts` — pessimistic stock reservation
- `src/services/checkout.ts` — atomic order+pay
- `src/routes/checkout.ts` — POST /checkout
- `src/server.ts` — Fastify entry

This repo is the substrate for the Stage-2 A/B token-savings test (see `../results/`).
