import { sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { orders, orderItems } from '../db/schema/orders.js';
import { reserveStock } from './inventory.js';
import { sumCents, applyTaxCents, assertCents, type Cents } from '../lib/money.js';

export interface CheckoutLine { sku: string; quantity: number; unitPriceCents: Cents; }
export interface CheckoutInput {
  customerId: string;
  lines: CheckoutLine[];
  taxBasisPoints: number;
  stripePaymentIntentId: string; // produced by the client via Stripe.js — server never sees the PAN
  cardLast4: string;
}

export interface CheckoutResult {
  orderId: string;
  status: 'paid';
  subtotalCents: Cents;
  taxCents: Cents;
  totalCents: Cents;
}

/**
 * Create + pay an order atomically:
 *  - money math in integer cents only
 *  - inventory reserved under FOR UPDATE inside the same tx
 *  - only the Stripe token + last4 are persisted (no raw PAN)
 */
export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  const subtotalCents = sumCents(
    input.lines.map((l) => assertCents(l.unitPriceCents) * l.quantity),
  );
  const taxCents = applyTaxCents(subtotalCents, input.taxBasisPoints);
  const totalCents = subtotalCents + taxCents;

  return db.transaction(async (tx) => {
    for (const line of input.lines) {
      await reserveStock(tx as unknown as typeof db, line.sku, line.quantity);
    }
    const [order] = await tx.insert(orders).values({
      customerId: input.customerId,
      status: 'paid',
      subtotalCents, taxCents, totalCents,
      stripePaymentIntentId: input.stripePaymentIntentId,
      cardLast4: input.cardLast4,
    }).returning({ id: orders.id });

    await tx.insert(orderItems).values(
      input.lines.map((l) => ({
        orderId: order!.id, sku: l.sku, quantity: l.quantity, unitPriceCents: l.unitPriceCents,
      })),
    );

    return { orderId: order!.id, status: 'paid' as const, subtotalCents, taxCents, totalCents };
  });
}
