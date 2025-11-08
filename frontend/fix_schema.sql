-- Step 1: Drop existing tables and constraints cleanly
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 2: Create blog_posts table with correct schema
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id TEXT NOT NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(600) UNIQUE,
  content TEXT NOT NULL,
  description TEXT,
  tone VARCHAR(100),
  audience VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft' NOT NULL,
  audio_url TEXT,
  audio_duration INTEGER,
  audio_file_size INTEGER,
  audio_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Step 3: Add foreign key constraint to neon_auth.users_sync
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_user_id_users_sync_id_fk
  FOREIGN KEY (user_id)
  REFERENCES neon_auth.users_sync(id)
  ON DELETE CASCADE;

-- Verify the setup
SELECT
  'blog_posts table created' as status,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'blog_posts'
  AND table_schema = 'public';

-- Verify foreign key
SELECT
  con.conname AS constraint_name,
  'blog_posts → neon_auth.users_sync' AS relationship
FROM pg_constraint con
WHERE con.conname = 'blog_posts_user_id_users_sync_id_fk';
