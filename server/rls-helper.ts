import type { Sql } from 'postgres';
import { client } from './db';
import { NextFunction, Request, Response } from 'express';

/**
 * Helper functions to implement Row Level Security in Express
 * These functions help ensure that database operations properly apply
 * the Row Level Security policies defined in PostgreSQL
 */

/**
 * Sets the user context for the current database connection
 * @param userId The UUID of the current user
 * @param txClient Optional transaction client instance
 */
export async function setUserContext(userId: string, txClient?: Sql): Promise<void> {
  const sql = txClient || client;
  
  try {
    await sql`SET LOCAL jwt.claims.user_id = ${userId}`;
  } catch (error) {
    console.error('Failed to set user context:', error);
    throw new Error('Database security context error');
  }
}

/**
 * Executes a database operation with proper RLS context
 * @param userId The UUID of the current user
 * @param operation Function that performs the database operations
 * @returns The result of the operation
 */
export async function withRLS<T>(
  userId: string, 
  operation: (sql: Sql) => Promise<T>
): Promise<T> {
  // Create a transaction with explicit type assertion
  return client.begin(async (sql) => {
    // Set user context for RLS
    await setUserContext(userId, sql);
    
    // Execute the operation inside the transaction
    const result = await operation(sql);
    return result as T;
  });
}

/**
 * Middleware to set user context for RLS in Express
 * This should be applied after authentication middleware
 */
export function rlsMiddleware() {
  return (req: Request & { user?: { id: string }, withRLS?: any }, 
          res: Response, 
          next: NextFunction) => {
    // Skip if no user is authenticated
    if (!req.user || !req.user.id) {
      return next();
    }
    
    // Attach a helper method to the req object
    req.withRLS = async <T>(operation: (sql: Sql) => Promise<T>): Promise<T> => {
      return withRLS(req.user!.id, operation);
    };
    
    next();
  };
}

/**
 * Execute an operation as a superuser (bypassing RLS)
 * Use this very carefully and only for admin operations
 * @param operation Function that performs the database operations
 * @returns The result of the operation
 */
export async function withSuperuser<T>(operation: (sql: Sql) => Promise<T>): Promise<T> {
  // Create a transaction with explicit type assertion
  return client.begin(async (sql) => {
    // Set role to superuser to bypass RLS
    await sql`SET LOCAL ROLE postgres`; // Or your superuser role
    
    // Execute the operation inside the transaction
    const result = await operation(sql);
    
    // Reset role
    await sql`RESET ROLE`;
    
    return result as T;
  });
}