-- Migration: Add Email Enhancement Columns
-- Date: 2025-11-16
-- Description: Adds visual enhancement fields for email generation (industry, preheader, HTML, emoji)

-- Add industry column (optional - NULL allowed)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS industry VARCHAR(50);

-- Add preheader_text column (optional - NULL allowed)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS preheader_text TEXT;

-- Add html_content column (optional - NULL allowed)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Add emoji_used column (optional - NULL allowed)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS emoji_used VARCHAR(10);

-- Create index on industry for efficient filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_industry ON blog_posts(industry);

-- Verify migration
-- All columns should be nullable and existing records should have NULL values
-- SELECT COUNT(*) as total,
--        COUNT(industry) as has_industry,
--        COUNT(preheader_text) as has_preheader,
--        COUNT(html_content) as has_html,
--        COUNT(emoji_used) as has_emoji
-- FROM blog_posts;
