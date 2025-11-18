-- Migration: Add Email Fields
-- Date: 2025-11-18
-- Description: Adds all required email fields for email generation and sending

-- Add content type fields
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'blog' NOT NULL;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS email_type VARCHAR(50);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS subject_line TEXT;

-- Add request_id column (for retrieving from Motia state)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS request_id VARCHAR(100);

-- Add email enhancement fields
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS industry VARCHAR(50);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS preheader_text TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS html_content TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS emoji_used VARCHAR(10);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_request_id ON blog_posts(request_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_type ON blog_posts(type);

-- Verify migration
SELECT
  COUNT(*) as total_records,
  COUNT(request_id) as has_request_id,
  COUNT(html_content) as has_html_content
FROM blog_posts;
