import type { FastifyInstance } from 'fastify';
import { expressCheckout } from '../services/express-checkout.js';

export async function expressCheckoutRoutes(app: FastifyInstance): Promise<void> {
  // One-click charge. No Idempotency-Key handling — a retry or double-click
  // simply runs the charge again.
  app.post('/express-checkout', async (req, reply) => {
    const body = req.body as Parameters<typeof expressCheckout>[0];
    const result = await expressCheckout(body);
    return reply.code(201).send(result);
  });
}
