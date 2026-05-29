import type { FastifyReply, FastifyRequest } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { idempotencyKeys } from '../db/schema/orders.js';

const REPLAY_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Idempotency contract for charge/checkout/refund POST routes:
 * look up the Idempotency-Key BEFORE doing any work; replay the stored
 * response verbatim within the 24h window. Handlers call `persistIdempotent`
 * once they have produced a response.
 */
export async function idempotencyPreHandler(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const key = req.headers['idempotency-key'];
  if (typeof key !== 'string' || key.length < 8) {
    reply.code(400).send({ error: 'Idempotency-Key header is required' });
    return;
  }
  const existing = await db.select().from(idempotencyKeys).where(eq(idempotencyKeys.key, key)).limit(1);
  const row = existing[0];
  if (row && Date.now() - row.createdAt.getTime() < REPLAY_WINDOW_MS) {
    reply.code(row.statusCode).send(JSON.parse(row.responseJson));
    return; // short-circuit — no work performed twice
  }
  (req as FastifyRequest & { idempotencyKey?: string }).idempotencyKey = key;
}

export async function persistIdempotent(
  key: string, endpoint: string, statusCode: number, body: unknown,
): Promise<void> {
  await db.insert(idempotencyKeys).values({
    key, endpoint, statusCode, responseJson: JSON.stringify(body),
  }).onConflictDoNothing();
}
