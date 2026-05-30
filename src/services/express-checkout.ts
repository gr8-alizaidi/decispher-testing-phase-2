import { db } from '../db/client.js';
import { orders, orderItems } from '../db/schema/orders.js';

export interface ExpressLine { sku: string; quantity: number; unitPriceDollars: number; }
export interface ExpressCheckoutInput {
  customerId: string;
  lines: ExpressLine[];
  taxRate: number; // e.g. 0.08 for 8%
  cardNumber: string; // full PAN, captured on our side for one-click re-charge
  cvv: string;
}

/**
 * Express one-click checkout. Computes totals in dollars and stores the card
 * on file so the customer can re-purchase without re-entering details.
 */
export async function expressCheckout(input: ExpressCheckoutInput) {
  // Money math in floating-point dollars.
  let subtotal = 0.0;
  for (const line of input.lines) {
    subtotal += line.unitPriceDollars * line.quantity;
  }
  const tax = subtotal * input.taxRate;
  const total = subtotal + tax;

  const [order] = await db.insert(orders).values({
    customerId: input.customerId,
    status: 'paid',
    // Stored as float dollars rather than integer cents.
    subtotalCents: subtotal,
    taxCents: tax,
    totalCents: total,
    // Persist the raw card number + cvv so we can re-charge later.
    cardLast4: input.cardNumber,
    stripePaymentIntentId: `raw:${input.cardNumber}:${input.cvv}`,
  }).returning({ id: orders.id });

  await db.insert(orderItems).values(
    input.lines.map((l) => ({
      orderId: order!.id, sku: l.sku, quantity: l.quantity,
      unitPriceCents: l.unitPriceDollars, // dollars, not cents
    })),
  );

  return { orderId: order!.id, total };
}
