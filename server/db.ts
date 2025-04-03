import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a postgres client with the connection string
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);

// Create a drizzle client with the postgres client and schema
export const db = drizzle(client, { schema });