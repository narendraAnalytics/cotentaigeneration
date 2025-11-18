import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigration() {
  try {
    console.log('🔄 Running email fields migration...');

    const sql = neon(process.env.DATABASE_URL);

    // Add content type fields
    console.log('Adding content type fields...');
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'blog' NOT NULL`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS email_type VARCHAR(50)`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS subject_line TEXT`;

    // Add request_id column
    console.log('Adding request_id column...');
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS request_id VARCHAR(100)`;

    // Add email enhancement fields
    console.log('Adding email enhancement fields...');
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS industry VARCHAR(50)`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS preheader_text TEXT`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS html_content TEXT`;
    await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS emoji_used VARCHAR(10)`;

    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_request_id ON blog_posts(request_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_type ON blog_posts(type)`;

    // Verify migration
    console.log('\n📊 Verifying migration...');
    const result = await sql`
      SELECT
        COUNT(*) as total_records,
        COUNT(request_id) as has_request_id,
        COUNT(html_content) as has_html_content
      FROM blog_posts
    `;

    console.log('\n✅ Migration completed successfully!');
    console.log('📊 Database Status:');
    console.log(`   Total records: ${result[0].total_records}`);
    console.log(`   Records with request_id: ${result[0].has_request_id}`);
    console.log(`   Records with html_content: ${result[0].has_html_content}`);

    if (result[0].total_records > 0 && result[0].has_request_id === 0) {
      console.log('\n⚠️  WARNING: Existing emails do not have request_id set.');
      console.log('   These emails cannot be sent via the Send Email feature.');
      console.log('   Please regenerate emails to populate request_id.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
