# PostgreSQL Row Level Security (RLS) Implementation

This document outlines the Row Level Security (RLS) policies implemented in our PostgreSQL database to ensure proper data isolation and access control.

## Overview

Row Level Security (RLS) in PostgreSQL allows us to restrict which rows users can see or modify based on their identity. We've implemented RLS policies for the `notes` table to ensure that:

1. **Everyone can read all notes** (public read access)
2. **Users can only create notes with their own user_id**
3. **Users can only update notes they own**
4. **Users can only delete notes they own**

## RLS Policies Implemented

The following policies have been applied to the `notes` table:

```sql
-- 1. Public read access
CREATE POLICY note_read_policy ON notes
    FOR SELECT
    USING (true);

-- 2. Insert restriction - users can only insert notes they own
CREATE POLICY note_insert_policy ON notes
    FOR INSERT
    WITH CHECK (
        user_id = (nullif(current_setting('jwt.claims.user_id', true), '')::uuid)
    );

-- 3. Update restriction - users can only update their own notes
CREATE POLICY note_update_policy ON notes
    FOR UPDATE
    USING (
        user_id = (nullif(current_setting('jwt.claims.user_id', true), '')::uuid)
    );

-- 4. Delete restriction - users can only delete their own notes
CREATE POLICY note_delete_policy ON notes
    FOR DELETE
    USING (
        user_id = (nullif(current_setting('jwt.claims.user_id', true), '')::uuid)
    );
```

## How to Use RLS in Your Application

To properly enforce RLS in your application:

### 1. Set the User ID for Database Connections

When you authenticate a user, set the JWT claim before executing database operations:

```typescript
// In your authentication middleware or before DB operations
const userId = "user-uuid-here";
await db.query("SET LOCAL jwt.claims.user_id = $1", [userId]);

// Now all subsequent queries in this connection will be subject to RLS policies
```

### 2. Using with Pooled Connections

When using a connection pool, make sure to set the user context for each transaction:

```typescript
await pool.connect(async (client) => {
  // Start a transaction
  await client.query('BEGIN');
  
  // Set the user context
  await client.query('SET LOCAL jwt.claims.user_id = $1', [userId]);
  
  // Now perform your operations - RLS will be enforced
  await client.query('INSERT INTO notes (title, user_id) VALUES ($1, $2)', 
                    ['My Note', userId]);
  
  // Commit the transaction
  await client.query('COMMIT');
});
```

### 3. For Superuser Access (Bypassing RLS)

If your admin application needs to bypass RLS for specific operations:

```typescript
// Execute as RLS-exempt superuser
await db.query("SET ROLE postgres"); // Or your superuser role
// Perform operations (RLS will be bypassed)
// Reset role
await db.query("RESET ROLE");
```

## Testing RLS

You can test if RLS is working correctly by:

1. Setting different user contexts
2. Attempting operations that should be allowed or denied
3. Verifying the operation results

Example test:

```typescript
// Set user A context
await db.query("SET LOCAL jwt.claims.user_id = $1", [userA.id]);
// Try to update a note owned by user B - should fail or update 0 rows
const result = await db.query(
  "UPDATE notes SET title = $1 WHERE id = $2",
  ["Updated title", userBNoteId]
);
// Should show 0 rows affected
console.log(result.rowCount); // Expected: 0
```

## Important Notes

1. **Always set user context**: Operations will fail or leak data if you forget to set the user context.
2. **Use transactions**: Always wrap operations in transactions when setting local variables.
3. **RLS does not replace API validation**: Still validate permissions at the API level as a defense in depth approach.