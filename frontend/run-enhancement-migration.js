/**
 * Database Migration Runner
 * Adds email enhancement columns to blog_posts table
 * - industry (VARCHAR 50)
 * - preheader_text (TEXT)
 * - html_content (TEXT)
 * - emoji_used (VARCHAR 10)
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

  console.log('🔧 Running email enhancement migration...\n');

  try {
    // Initialize Neon client
    const sql = neon(databaseUrl);

    console.log('📄 Migration: Add email enhancement columns to blog_posts table');
    console.log('   - Adding industry column (VARCHAR 50)');
    console.log('   - Adding preheader_text column (TEXT)');
    console.log('   - Adding html_content column (TEXT)');
    console.log('   - Adding emoji_used column (VARCHAR 10)');
    console.log('   - Adding indexes\n');

    console.log('🚀 Step 1: Adding industry column...');
    await sql`
      ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS industry VARCHAR(50)
    `;
    console.log('✅ Industry column added');

    console.log('🚀 Step 2: Adding preheader_text column...');
    await sql`
      ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS preheader_text TEXT
    `;
    console.log('✅ Preheader text column added');

    console.log('🚀 Step 3: Adding html_content column...');
    await sql`
      ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS html_content TEXT
    `;
    console.log('✅ HTML content column added');

    console.log('🚀 Step 4: Adding emoji_used column...');
    await sql`
      ALTER TABLE blog_posts
      ADD COLUMN IF NOT EXISTS emoji_used VARCHAR(10)
    `;
    console.log('✅ Emoji used column added');

    console.log('🚀 Step 5: Creating index on industry...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_blog_posts_industry ON blog_posts(industry)
    `;
    console.log('✅ Industry index created');

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const result = await sql`
      SELECT
        COUNT(*) as total_records,
        COUNT(industry) as has_industry,
        COUNT(preheader_text) as has_preheader,
        COUNT(html_content) as has_html,
        COUNT(emoji_used) as has_emoji
      FROM blog_posts
    `;

    console.log('📊 Current database state:');
    console.log(`   Total records: ${result[0].total_records}`);
    console.log(`   Records with industry: ${result[0].has_industry}`);
    console.log(`   Records with preheader: ${result[0].has_preheader}`);
    console.log(`   Records with HTML: ${result[0].has_html}`);
    console.log(`   Records with emoji flag: ${result[0].has_emoji}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('✅ blog_posts table now has email enhancement columns\n');
    console.log('💡 Note: All new columns are optional (NULL allowed)');
    console.log('💡 Existing records will have NULL for these fields\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

runMigration();
