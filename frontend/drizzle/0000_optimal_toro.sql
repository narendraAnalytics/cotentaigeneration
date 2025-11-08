-- Note: neon_auth schema and users_sync table are automatically created by Neon Auth
-- We only create our blog_posts table and reference the existing neon_auth.users_sync table

-- Drop old tables if they exist from previous setup
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(600),
	"content" text NOT NULL,
	"description" text,
	"tone" varchar(100),
	"audience" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"audio_url" text,
	"audio_duration" integer,
	"audio_file_size" integer,
	"audio_status" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
-- Add foreign key constraint to neon_auth.users_sync (which is auto-managed by Neon Auth)
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_user_id_users_sync_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."users_sync"("id") ON DELETE cascade ON UPDATE no action;