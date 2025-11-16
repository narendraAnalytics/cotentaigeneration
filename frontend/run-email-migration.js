/**
 * Database Migration Runner
 * Adds email support columns to blog_posts table
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

  console.log('🔧 Running email support migration...\n');

  try {
    // Initialize Neon client
    const sql = neon(databaseUrl);

    console.log('📄 Migration: Add email support to blog_posts table');
    console.log('   - Adding type column (blog/email)');
    console.log('   - Adding email_type column');
    console.log('   - Adding subject_line column');
    console.log('   - Adding constraints and indexes\n');

    console.log('🚀 Step 1: Adding type column...');
    await sql`
      ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'blog' NOT NULL
    `;
    console.log('✅ Type column added');

    console.log('🚀 Step 2: Adding email_type column...');
    await sql`
      ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS email_type VARCHAR(50)
    `;
    console.log('✅ Email type column added');

    console.log('🚀 Step 3: Adding subject_line column...');
    await sql`
      ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS subject_line TEXT
    `;
    console.log('✅ Subject line column added');

    console.log('🚀 Step 4: Adding check constraint...');
    await sql`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'check_content_type'
          ) THEN
              ALTER TABLE blog_posts
              ADD CONSTRAINT check_content_type
              CHECK (type IN ('blog', 'email'));
          END IF;
      END $$
    `;
    console.log('✅ Check constraint added');

    console.log('🚀 Step 5: Creating indexes...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_type ON blog_posts(type)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_email_type ON blog_posts(email_type)
    `;
    console.log('✅ Indexes created');

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const result = await sql`
      SELECT
        COUNT(*) as total_records,
        SUM(CASE WHEN type = 'blog' THEN 1 ELSE 0 END) as blog_count,
        SUM(CASE WHEN type = 'email' THEN 1 ELSE 0 END) as email_count
      FROM blog_posts
    `;

    console.log('📊 Current database state:');
    console.log(`   Total records: ${result[0].total_records}`);
    console.log(`   Blogs: ${result[0].blog_count}`);
    console.log(`   Emails: ${result[0].email_count}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('✅ blog_posts table now supports both blogs and emails\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

runMigration();
