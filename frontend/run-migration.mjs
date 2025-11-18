import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigration() {
  try {
    console.log('🔄 Running migration: add_request_id.sql');

    const sql = neon(process.env.DATABASE_URL);

    // Run migration statements
    console.log('Adding request_id column...');
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS request_id VARCHAR(100)`;

    console.log('Creating index on request_id...');
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_request_id ON blog_posts(request_id)`;

    console.log('✅ Migration completed successfully!');
    console.log('✅ request_id column added to blog_posts table');
    console.log('✅ Index created on request_id');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
