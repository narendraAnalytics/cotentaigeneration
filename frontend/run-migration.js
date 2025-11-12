/**
 * Database Migration Runner
 * Adds the audio_data column to blog_posts table
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL not found in .env file');
    process.exit(1);
  }

  console.log('🔧 Running database migration...\n');

  try {
    // Initialize Neon client
    const sql = neon(databaseUrl);

    console.log('📄 Executing migration: Add audio_data column');
    console.log('\n🚀 Running migration...');

    // Execute migration using tagged template
    await sql`
      ALTER TABLE "blog_posts"
      ADD COLUMN IF NOT EXISTS "audio_data" text
    `;

    console.log('✅ Migration completed successfully!');
    console.log('✅ Column "audio_data" added to "blog_posts" table\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

runMigration();
