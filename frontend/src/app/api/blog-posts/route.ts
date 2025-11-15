import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/blog-posts - Fetch blog posts for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user's blog posts (newest first, without audio data to reduce payload size)
    const posts = await db
      .select({
        id: blogPosts.id,
        userId: blogPosts.userId,
        title: blogPosts.title,
        slug: blogPosts.slug,
        content: blogPosts.content,
        description: blogPosts.description,
        tone: blogPosts.tone,
        audience: blogPosts.audience,
        status: blogPosts.status,
        audioUrl: blogPosts.audioUrl,
        audioDuration: blogPosts.audioDuration,
        audioFileSize: blogPosts.audioFileSize,
        audioStatus: blogPosts.audioStatus,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        // audioData excluded - too large for list view, fetched on-demand
      })
      .from(blogPosts)
      .where(eq(blogPosts.userId, userId))
      .orderBy(desc(blogPosts.createdAt))
      .limit(5);

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog-posts - Save a new blog post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      title,
      content,
      description,
      tone,
      audience,
      audioData,
      audioDuration,
      audioFileSize,
      audioStatus,
    } = body;

    if (!userId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, content' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Insert blog post
    const [newPost] = await db
      .insert(blogPosts)
      .values({
        userId,
        title,
        slug,
        content,
        description,
        tone,
        audience,
        audioData: audioData || null, // Store base64 audio data
        audioUrl: audioData ? 'embedded' : null,
        audioDuration,
        audioFileSize,
        audioStatus,
        status: 'draft',
      })
      .returning();

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error('Error saving blog post:', error);
    return NextResponse.json(
      { error: 'Failed to save blog post' },
      { status: 500 }
    );
  }
}
