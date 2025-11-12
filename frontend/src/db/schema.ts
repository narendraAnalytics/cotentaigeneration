import { pgTable, text, timestamp, uuid, varchar, integer, pgSchema } from 'drizzle-orm/pg-core';

/**
 * Neon Auth Schema
 * Reference to the automatically managed neon_auth schema
 */
export const neonAuthSchema = pgSchema('neon_auth');

/**
 * Neon Auth Users Sync Table (Read-Only Reference)
 * Automatically synced by Neon Auth - DO NOT modify this table directly
 * Users appear here automatically when they sign up through Stack Auth
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
  userId: text('user_id')
    .notNull()
    .references(() => neonAuthUsers.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 600 }).unique(),
  content: text('content').notNull(),
  description: text('description'),
  tone: varchar('tone', { length: 100 }),
  audience: varchar('audience', { length: 100 }),
  status: varchar('status', { length: 50 }).default('draft').notNull(),

  // Audio file fields
  audioData: text('audio_data'), // Base64 encoded audio data
  audioUrl: text('audio_url'),
  audioDuration: integer('audio_duration'),
  audioFileSize: integer('audio_file_size'),
  audioStatus: varchar('audio_status', { length: 50 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export types for TypeScript
export type NeonAuthUser = typeof neonAuthUsers.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
