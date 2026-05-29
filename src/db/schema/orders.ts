import { pgTable, uuid, text, integer, bigint, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';

// snake_case columns at the DB layer; camelCase is applied at the API boundary.
export const orderStatus = pgEnum('order_status', ['pending', 'paid', 'failed', 'refunded']);

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').notNull(),
  status: orderStatus('status').notNull().default('pending'),
  // Money is ALWAYS integer minor units (cents). Never a float / NUMERIC mapped to JS number.
  subtotalCents: bigint('subtotal_cents', { mode: 'number' }).notNull(),
  taxCents: bigint('tax_cents', { mode: 'number' }).notNull(),
  totalCents: bigint('total_cents', { mode: 'number' }).notNull(),
  currency: text('currency').notNull().default('usd'),
  // Stripe tokenization only — token + last4, never the raw PAN.
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  cardLast4: text('card_last4'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byCustomer: index('idx_orders_customer').on(t.customerId),
}));

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  sku: text('sku').notNull(),
  quantity: integer('quantity').notNull(),
  unitPriceCents: bigint('unit_price_cents', { mode: 'number' }).notNull(),
});

export const inventory = pgTable('inventory', {
  sku: text('sku').primaryKey(),
  quantity: integer('quantity').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Idempotency store: first response for a key is replayed on retry for 24h.
export const idempotencyKeys = pgTable('idempotency_keys', {
  key: text('key').primaryKey(),
  endpoint: text('endpoint').notNull(),
  responseJson: text('response_json').notNull(),
  statusCode: integer('status_code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byCreated: index('idx_idem_created').on(t.createdAt),
}));
