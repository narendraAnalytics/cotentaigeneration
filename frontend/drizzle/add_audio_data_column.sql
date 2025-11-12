-- Migration: Add audio_data column to blog_posts table
-- This column stores base64-encoded PCM audio data for TTS

ALTER TABLE "blog_posts"
ADD COLUMN IF NOT EXISTS "audio_data" text;
