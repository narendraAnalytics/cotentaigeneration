import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Initialize Neon serverless client (HTTP) - perfect for Next.js serverless functions
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle database instance with schema
export const db = drizzle(sql, { schema });
