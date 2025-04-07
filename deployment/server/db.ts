import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a postgres client with the connection string
const connectionString = process.env.DATABASE_URL;

// Configure postgres client with production-ready settings
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Max seconds to keep unused connections alive
  connect_timeout: 10, // Max seconds to wait for connection
  ssl: true, // Enable SSL for all environments with Replit and Vercel
  onnotice: (notice) => {
    // Log database notices (optional, helpful for debugging)
    console.log('Database notice:', notice.message);
  },
  // Log important connection events
  onparameter: (key: string, value: any) => {
    // Log parameter status changes (optional, helpful for debugging)
    if (key === 'server_version') {
      console.log('Connected to PostgreSQL server version:', value);
    }
  },
});

// Create a drizzle client with the postgres client and schema
export const db = drizzle(client, { schema });

// Log connection status
console.log('Database connected with SSL enabled');

// Add graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connections');
  await client.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connections');
  await client.end();
  process.exit(0);
});