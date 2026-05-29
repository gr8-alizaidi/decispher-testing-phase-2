import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { idempotencyPreHandler, persistIdempotent } from '../middleware/idempotency.js';
import { checkout } from '../services/checkout.js';
import { OutOfStockError } from '../services/inventory.js';

const bodySchema = z.object({
  customerId: z.string().uuid(),
  lines: z.array(z.object({
    sku: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPriceCents: z.number().int().nonnegative(),
  })).min(1),
  taxBasisPoints: z.number().int().min(0).max(10_000),
  stripePaymentIntentId: z.string().min(1),
  cardLast4: z.string().length(4),
});

export async function checkoutRoutes(app: FastifyInstance): Promise<void> {
  app.post('/checkout', { preHandler: idempotencyPreHandler }, async (req: FastifyRequest, reply) => {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) return reply.code(422).send({ error: 'ValidationError', issues: parsed.error.issues });

    const key = (req as FastifyRequest & { idempotencyKey?: string }).idempotencyKey!;
    try {
      const result = await checkout(parsed.data);
      await persistIdempotent(key, '/checkout', 201, result);
      return reply.code(201).send(result);
    } catch (err) {
      if (err instanceof OutOfStockError) {
        const body = { error: 'OutOfStock', sku: err.sku, available: err.available };
        await persistIdempotent(key, '/checkout', 409, body);
        return reply.code(409).send(body);
      }
      throw err;
    }
  });
}
