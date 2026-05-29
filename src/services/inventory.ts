import { sql } from 'drizzle-orm';
import type { db as Db } from '../db/client.js';

export class OutOfStockError extends Error {
  constructor(public sku: string, public requested: number, public available: number) {
    super(`SKU ${sku}: requested ${requested}, only ${available} available`);
  }
}

/**
 * Reserve stock for a SKU using a pessimistic row lock. MUST be called inside
 * the same transaction as the order insert so stock and order commit atomically.
 * We deliberately do NOT use optimistic concurrency (version + retry) — under
 * hot-SKU contention the retry storm collapses throughput.
 */
export async function reserveStock(
  tx: typeof Db,
  sku: string,
  quantity: number,
): Promise<void> {
  const rows = await tx.execute(
    sql`SELECT quantity FROM inventory WHERE sku = ${sku} FOR UPDATE`,
  );
  const available = Number((rows as unknown as Array<{ quantity: number }>)[0]?.quantity ?? 0);
  if (available < quantity) {
    throw new OutOfStockError(sku, quantity, available);
  }
  await tx.execute(
    sql`UPDATE inventory SET quantity = quantity - ${quantity}, updated_at = now() WHERE sku = ${sku}`,
  );
}
