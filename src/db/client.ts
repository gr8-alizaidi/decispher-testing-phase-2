import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/orders.js';

const connectionString = process.env.DATABASE_URL ?? 'postgres://localhost:5432/checkout';
const queryClient = postgres(connectionString);

export const db = drizzle(queryClient, { schema });
