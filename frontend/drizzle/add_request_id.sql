-- Migration: Add Request ID Column
-- Date: 2025-11-17
-- Description: Adds request_id column to track original generation request ID for email sending

-- Add request_id column (optional - NULL allowed for old records)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS request_id VARCHAR(100);

-- Create index on request_id for efficient lookups when sending emails
CREATE INDEX IF NOT EXISTS idx_blog_posts_request_id ON blog_posts(request_id);

-- Verify migration
-- SELECT COUNT(*) as total,
--        COUNT(request_id) as has_request_id
-- FROM blog_posts;
