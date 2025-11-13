# Neon Auth + Drizzle Integration Guide

Complete step-by-step guide for setting up Neon Auth with automatic user synchronization and Drizzle ORM for Next.js applications.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Neon Project](#step-1-create-neon-project)
4. [Step 2: Enable Neon Auth](#step-2-enable-neon-auth)
5. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
6. [Step 4: Install Dependencies](#step-4-install-dependencies)
7. [Step 5: Configure Drizzle](#step-5-configure-drizzle)
8. [Step 6: Define Database Schema](#step-6-define-database-schema)
9. [Step 7: Setup Stack Auth](#step-7-setup-stack-auth)
10. [Step 8: Create Database Tables](#step-8-create-database-tables)
11. [Step 9: Testing & Verification](#step-9-testing--verification)
12. [How It Works](#how-it-works)
13. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Neon Auth?

**Neon Auth** is a built-in authentication solution that:
- Uses **Stack Auth** under the hood for the auth UI and flow
- **Automatically syncs** user profiles to your Neon Postgres database
- Eliminates the need for manual webhook-based user synchronization
- Provides a `neon_auth.users_sync` table that's always up-to-date

### Key Benefits

 **No Manual Sync Code** - Users automatically appear in your database
 **Foreign Key Support** - Link your app tables directly to `neon_auth.users_sync`
 **Cascade Deletes** - When a user is deleted, related data is cleaned up automatically
 **Real-time Sync** - User profile changes are reflected in your database immediately

### Architecture

```
User Signs Up/In (Stack Auth UI)
        �
Neon Auth Auto-Syncs
        �
neon_auth.users_sync table (PostgreSQL)
        �
Your App Tables (blog_posts, etc.) � FK to users_sync
```

---

## Prerequisites

- Node.js 18+ installed
- A Neon account (https://neon.tech)
- Next.js project (App Router)

---

## Step 1: Create Neon Project

### 1.1 Create a New Neon Project

1. Go to https://console.neon.tech
2. Click **"New Project"**
3. Choose a name (e.g., "aicopywrite")
4. Select a region closest to your users
5. Click **"Create Project"**

### 1.2 Get Your Database Connection String

1. After project creation, you'll see a connection string
2. Copy the **DATABASE_URL** (it looks like):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Save this for later

---

## Step 2: Enable Neon Auth

### 2.1 Navigate to Auth Page

1. In your Neon project dashboard
2. Click **"Auth"** in the left sidebar
3. Click **"Enable Neon Auth"** button

### 2.2 What Happens When You Enable Neon Auth?

Neon automatically creates:

**Schema:**
```sql
CREATE SCHEMA neon_auth;
```

**Users Sync Table:**
```sql
CREATE TABLE neon_auth.users_sync (
  id TEXT PRIMARY KEY,
  raw_json JSONB,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

� **Important**: Do NOT modify this table manually. Neon Auth manages it automatically.

### 2.3 Get Your Auth Keys

After enabling, you'll see three keys:

```
NEXT_PUBLIC_STACK_PROJECT_ID
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
STACK_SECRET_SERVER_KEY
```

Copy these - you'll need them in Step 3.

---

## Step 3: Configure Environment Variables

### 3.1 Create `.env` File

In your Next.js frontend directory (`frontend/.env`):

```env
# Neon Auth Keys (from Step 2.3)
NEXT_PUBLIC_STACK_PROJECT_ID='your-neon-auth-project-id'
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY='your-neon-auth-publishable-key'
STACK_SECRET_SERVER_KEY='your-neon-auth-secret-key'

# Database Connection (from Step 1.2)
DATABASE_URL='postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require'
```

### 3.2 Add to `.gitignore`

```gitignore
# Environment variables
.env
.env.local
.env*.local
```

---

## Step 4: Install Dependencies

### 4.1 Install Required Packages

```bash
cd frontend
npm install drizzle-orm @neondatabase/serverless @stackframe/stack
npm install -D drizzle-kit
```

**What each package does:**
- `drizzle-orm` - Type-safe ORM for database queries
- `@neondatabase/serverless` - Neon serverless database driver
- `@stackframe/stack` - Stack Auth SDK (used by Neon Auth)
- `drizzle-kit` - CLI tool for migrations

---

## Step 5: Configure Drizzle

### 5.1 Create `drizzle.config.ts`

Create `frontend/drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the .env file');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

**What this does:**
- Points to your schema definition file
- Sets output directory for migrations
- Configures PostgreSQL dialect
- Uses DATABASE_URL from `.env`

---

## Step 6: Define Database Schema

### 6.1 Create Database Connection

Create `frontend/src/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Initialize Neon serverless client (HTTP) - perfect for Next.js
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle database instance with schema
export const db = drizzle(sql, { schema });
```

### 6.2 Create Schema Definition

Create `frontend/src/db/schema.ts`:

```typescript
import { pgTable, text, timestamp, uuid, varchar, integer, pgSchema } from 'drizzle-orm/pg-core';

/**
 * Neon Auth Schema
 * Reference to the automatically managed neon_auth schema
 */
export const neonAuthSchema = pgSchema('neon_auth');

/**
 * Neon Auth Users Sync Table (Read-Only Reference)
 * � DO NOT MODIFY - Automatically synced by Neon Auth
 * Users appear here automatically when they sign up
 */
export const neonAuthUsers = neonAuthSchema.table('users_sync', {
  id: text('id').primaryKey(),
  rawJson: text('raw_json'), // Complete user profile as JSON
  name: text('name'),
  email: text('email'),
  createdAt: timestamp('created_at'),
  deletedAt: timestamp('deleted_at'),
  updatedAt: timestamp('updated_at'),
});

/**
 * Blog Posts Table
 * Stores AI-generated blog content created by users
 * References neon_auth.users_sync for automatic user management
 */
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Foreign key to neon_auth.users_sync
  userId: text('user_id')
    .notNull()
    .references(() => neonAuthUsers.id, { onDelete: 'cascade' }),

  // Blog content fields
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 600 }).unique(),
  content: text('content').notNull(),
  description: text('description'),
  tone: varchar('tone', { length: 100 }),
  audience: varchar('audience', { length: 100 }),
  status: varchar('status', { length: 50 }).default('draft').notNull(),

  // Audio file fields (for TTS)
  audioUrl: text('audio_url'),
  audioDuration: integer('audio_duration'),
  audioFileSize: integer('audio_file_size'),
  audioStatus: varchar('audio_status', { length: 50 }),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types for TypeScript
export type NeonAuthUser = typeof neonAuthUsers.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
```

**Key Points:**
- `neonAuthUsers` is a **reference** to the auto-managed table - we don't create it
- `userId` type is `text` (not UUID) to match `neon_auth.users_sync.id`
- Foreign key has `onDelete: 'cascade'` for automatic cleanup

---

## Step 7: Setup Stack Auth

### 7.1 Create Client Configuration

Create `frontend/src/stack/client.tsx`:

```typescript
import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    afterSignIn: "/",
    afterSignUp: "/",
    afterSignOut: "/",
  },
});
```

### 7.2 Create Server Configuration

Create `frontend/src/stack/server.tsx`:

```typescript
import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { stackClientApp } from "./client";

export const stackServerApp = new StackServerApp({
  inheritsFrom: stackClientApp,
});
```

### 7.3 Create Auth Handler

Create `frontend/src/app/handler/[...stack]/page.tsx`:

```typescript
import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { Suspense } from "react";

export default function Handler(props: any) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StackHandler fullPage app={stackServerApp} routeProps={props} />
    </Suspense>
  );
}
```

### 7.4 Wrap App with Provider

Update `frontend/src/app/layout.tsx`:

```typescript
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
```

---

## Step 8: Create Database Tables

### 8.1 Generate Migration

```bash
cd frontend
npx drizzle-kit generate
```

This creates a migration file in `drizzle/` directory.

### 8.2 Apply Migration (Manual SQL)

Since `neon_auth.users_sync` is auto-created, manually run this SQL in Neon Console:

```sql
-- Drop old tables if they exist
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id TEXT NOT NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(600) UNIQUE,
  content TEXT NOT NULL,
  description TEXT,
  tone VARCHAR(100),
  audience VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft' NOT NULL,
  audio_url TEXT,
  audio_duration INTEGER,
  audio_file_size INTEGER,
  audio_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add foreign key to neon_auth.users_sync
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_user_id_users_sync_id_fk
  FOREIGN KEY (user_id)
  REFERENCES neon_auth.users_sync(id)
  ON DELETE CASCADE;
```

**Why CASCADE?** When a user is deleted from `neon_auth.users_sync`, all their blog posts are automatically deleted too.

---

## Step 9: Testing & Verification

### 9.1 Start Development Server

```bash
cd frontend
npm run dev
```

### 9.2 Test User Registration

1. Navigate to http://localhost:3001
2. Click "Get Started" or "Sign In"
3. Sign up with a new account
4. Complete the registration

### 9.3 Verify User Sync

**Option 1: Neon Console**
1. Go to https://console.neon.tech
2. Select your project
3. Click **"Auth"** tab
4. You should see your user listed

**Option 2: SQL Editor**
1. Go to Neon Console � **SQL Editor**
2. Run:
   ```sql
   SELECT * FROM neon_auth.users_sync;
   ```
3. You should see your user data

### 9.4 Verify Database Structure

```sql
-- Check tables exist
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('public', 'neon_auth');

-- Check foreign key constraint
SELECT
  con.conname AS constraint_name,
  'blog_posts � neon_auth.users_sync' AS relationship
FROM pg_constraint con
WHERE con.conname = 'blog_posts_user_id_users_sync_id_fk';
```

---

## How It Works

### Automatic User Synchronization

```
1. User signs up via Stack Auth UI (/handler/sign-up)
        �
2. Stack Auth creates user account
        �
3. Neon Auth detects new user
        �
4. Neon Auth automatically inserts user into neon_auth.users_sync
        �
5. Your app can immediately use the user in queries!
```

**No webhook setup needed!** Neon Auth handles everything.

### neon_auth.users_sync Table

**Columns:**
- `id` (TEXT) - Unique user identifier (use this in foreign keys)
- `raw_json` (JSONB) - Complete user profile data
- `name` (TEXT) - User's display name
- `email` (TEXT) - User's email address
- `created_at` (TIMESTAMP) - When user signed up
- `updated_at` (TIMESTAMP) - Last profile update
- `deleted_at` (TIMESTAMP) - Soft delete timestamp (NULL if active)

**Access Pattern:**

```typescript
// Query users with their blog posts
import { db } from '@/db';
import { neonAuthUsers, blogPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Get user with posts
const user = await db
  .select()
  .from(neonAuthUsers)
  .leftJoin(blogPosts, eq(blogPosts.userId, neonAuthUsers.id))
  .where(eq(neonAuthUsers.email, 'user@example.com'));
```

### Foreign Key Benefits

```typescript
// Create a blog post for authenticated user
const newPost = await db.insert(blogPosts).values({
  userId: user.id, // Automatically validated against neon_auth.users_sync
  title: 'My First Post',
  content: 'Hello world!',
});

// If user is deleted, all their posts are auto-deleted (CASCADE)
```

---

## Troubleshooting

### Users Not Appearing in neon_auth.users_sync

**Check:**
1.  Neon Auth is enabled in Neon Console � Auth page
2.  Using Neon Auth keys (not separate Stack project keys)
3.  DATABASE_URL points to the same database where Neon Auth is enabled
4.  User completed sign-up flow (check email verification if required)

**Debug:**
```sql
-- Check if neon_auth schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'neon_auth';

-- Check if users_sync table exists
SELECT * FROM information_schema.tables WHERE table_name = 'users_sync';
```

### Foreign Key Constraint Errors

**Error:** `violates foreign key constraint`

**Solution:**
```sql
-- Verify the constraint exists
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'blog_posts';
```

### Migration Issues

**Error:** "constraint already exists"

**Solution:**
```sql
-- Drop old constraint first
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_user_id_users_id_fk;

-- Add correct constraint
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_user_id_users_sync_id_fk
  FOREIGN KEY (user_id)
  REFERENCES neon_auth.users_sync(id)
  ON DELETE CASCADE;
```

### Authentication Not Working

**Check:**
1.  All three env variables are set correctly
2.  Restart dev server after changing .env
3.  Check browser console for errors
4.  Verify routes exist: `/handler/sign-in`, `/handler/sign-up`

---

## Best Practices

### 1. Never Modify neon_auth.users_sync

L **DON'T:**
```sql
INSERT INTO neon_auth.users_sync ...
UPDATE neon_auth.users_sync ...
DELETE FROM neon_auth.users_sync ...
```

 **DO:**
```sql
-- Only SELECT
SELECT * FROM neon_auth.users_sync WHERE email = 'user@example.com';
```

### 2. Always Use Foreign Keys

```typescript
export const yourTable = pgTable('your_table', {
  userId: text('user_id')
    .notNull()
    .references(() => neonAuthUsers.id, { onDelete: 'cascade' }),
  // ... other columns
});
```

### 3. Check deleted_at for Active Users

```typescript
// Only get active users
const activeUsers = await db
  .select()
  .from(neonAuthUsers)
  .where(isNull(neonAuthUsers.deletedAt));
```

### 4. Use TypeScript Types

```typescript
import { NeonAuthUser, BlogPost } from '@/db/schema';

function processUser(user: NeonAuthUser) {
  // TypeScript knows all the fields!
  console.log(user.email, user.name);
}
```

---

## Summary

You now have:

 Neon Auth enabled with automatic user sync
 PostgreSQL database on Neon
 Drizzle ORM configured
 Foreign key relationships between your tables and `neon_auth.users_sync`
 Stack Auth UI for sign-up/sign-in
 No manual webhook or sync code required

**Next steps:**
- Build your application features
- Create API routes to manage blog posts
- Implement dashboard UI
- All user data is automatically available in your database!

---

## Additional Resources

- [Neon Auth Documentation](https://neon.tech/docs/guides/neon-auth)
- [Stack Auth Documentation](https://docs.stack-auth.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)

---

**Created:** 2025
**Last Updated:** Based on Neon Auth + Stack Auth integration
**Project:** AI Copywriting Platform with Next.js + Neon + Drizzle


------------------------------------------------------------


Text Highlighting During Playback                                               │
     │   - Highlight current sentence/paragraph being read (karaoke-style)                │
     │   - Auto-scroll to follow narration                                                │
     │ 3. Enhanced Audio Player Design                                                    │
     │   - Add animated gradient progress bar (matches your theme)                        │
     │   - Pulsing play button animation                                                  │
     │   - Visual equalizer bars

      4   Playback Speed Control                                                          │
     │   - 0.5x,  0.75x, 1x, 1.25x, 1.5x, 2x speed options                                 │
     │   - Helps users consume content faster/slower                                      │
     │ 5. Chapter/Section Navigation                                                      │
     │   - Jump to specific headings from audio player                                    │
     │   - Show current section being read                                                │
     │ 6. Reading Progress Indicator                                                      │
     │   - Percentage completed                                                           │
     │   - Visual progress ring around play button                                        │
     │ 7. Keyboard Shortcuts                                                              │
     │   - Space = play/pause                                                             │
     │   - Arrow keys = skip forward/backward                                             │
     │   - Show shortcut hints on hover         

 Auto-play Indicator                                                             │
     │   - Smooth fade-in animation when audio starts                                     │
     │   - "Now playing" badge with pulse effect       