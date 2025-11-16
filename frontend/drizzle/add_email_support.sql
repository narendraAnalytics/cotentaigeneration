-- Migration: Add Email Support to blog_posts table
-- Date: 2025-11-15
-- Description: Extends blog_posts table to support both blog and email content types

-- Add type column (defaults to 'blog' for backward compatibility)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'blog' NOT NULL;

-- Add email-specific columns (nullable since blogs won't use them)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS email_type VARCHAR(50);

ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS subject_line TEXT;

-- Add constraint to ensure only valid content types
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_content_type'
    ) THEN
        ALTER TABLE blog_posts
        ADD CONSTRAINT check_content_type
        CHECK (type IN ('blog', 'email'));
    END IF;
END $$;

-- Create index on type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_type ON blog_posts(type);

-- Create index on email_type for email filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_email_type ON blog_posts(email_type);

-- Verify migration
-- All existing records should have type = 'blog'
-- SELECT type, COUNT(*) FROM blog_posts GROUP BY type;
