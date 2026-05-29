/**
 * Money helpers. Invariant: every amount in the domain is an integer count of
 * minor units (cents). Decimal strings exist only for display.
 */

export type Cents = number; // integer; enforced by assertCents

export function assertCents(value: number): Cents {
  if (!Number.isInteger(value)) {
    throw new Error(`money must be integer cents, got ${value}`);
  }
  return value;
}

/** Sum line items with exact integer arithmetic — no float accumulation. */
export function sumCents(values: Cents[]): Cents {
  return values.reduce((acc, v) => acc + assertCents(v), 0);
}

/** Tax computed in integer space, rounded once at the end (banker-safe floor+half). */
export function applyTaxCents(subtotal: Cents, taxBasisPoints: number): Cents {
  assertCents(subtotal);
  // basis points = 1/100 of a percent; integer math then a single rounding step.
  return Math.round((subtotal * taxBasisPoints) / 10_000);
}

/** Format for UI boundary only. */
export function formatCents(amount: Cents, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
}
