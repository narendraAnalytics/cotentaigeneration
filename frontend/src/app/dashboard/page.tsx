"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Loader2, Music, Clock, Calendar } from "lucide-react";
import CreateBlogForm, { BlogGenerationRequest } from "@/components/CreateBlogForm";
import BlogReader from "@/components/BlogReader";
import { generateBlog, pollBlogContent, BlogContentResponse } from "@/lib/api";

interface BlogPost {
  id: string;
  title: string;
  slug: string | null;
  content: string;
  description: string | null;
  tone: string | null;
  audience: string | null;
  status: string;
  audioData: string | null;
  audioUrl: string | null;
  audioDuration: number | null;
  audioFileSize: number | null;
  audioStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const user = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    attempt: number;
    maxAttempts: number;
  } | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogContentResponse | null>(null);

  useEffect(() => {
    console.log('🔍 Dashboard loaded, user:', user);

    // Wait a moment for user to load before redirecting
    const timer = setTimeout(() => {
      if (!user) {
        console.log('❌ No user found, redirecting to sign-in');
        router.push('/handler/sign-in');
      } else {
        console.log('✅ User authenticated:', {
          id: user.id,
          email: user.primaryEmail,
          name: user.displayName
        });
        setIsLoading(false);
        fetchUserPosts();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, router]);

  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/blog-posts?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch posts:', response.status, response.statusText);
        // Don't crash, just show empty state
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Don't crash, just show empty state
      setPosts([]);
    }
  };

  const handleCreateBlog = async (formData: BlogGenerationRequest, email?: string) => {
    try {
      setIsGenerating(true);
      setGenerationProgress({ attempt: 0, maxAttempts: 50 });

      // Step 1: Start generation
      console.log('🚀 Starting blog generation...');
      console.log('📝 Request data:', formData);

      const generateResponse = await generateBlog(formData);
      console.log('✅ Generation started:', generateResponse.id);

      // Step 2: Poll for completion
      console.log('⏳ Waiting for blog + TTS generation...');
      const blogContent = await pollBlogContent(
        generateResponse.id,
        50,
        5000,
        (attempt, maxAttempts) => {
          setGenerationProgress({ attempt, maxAttempts });
        }
      );

      console.log('✅ Blog generated successfully!');
      console.log('📦 Blog content received:', JSON.stringify(blogContent, null, 2));

      // Step 3: Save to database
      await saveBlogToDatabase(blogContent, formData);

      // Step 4: Send email if provided
      if (email) {
        console.log('📧 Sending email to:', email);
        // Optional: send email notification (can implement later)
        // await sendBlogEmail(generateResponse.id, email);
      }

      // Step 5: Show blog reader
      setSelectedBlog(blogContent);
      setShowCreateForm(false);

      // Refresh posts list
      await fetchUserPosts();
    } catch (error) {
      console.error('❌ Error generating blog:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to generate blog. Please try again.'
      );
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const saveBlogToDatabase = async (
    blogContent: BlogContentResponse,
    formData: BlogGenerationRequest
  ) => {
    if (!user) {
      console.error('❌ Cannot save: user not authenticated');
      return;
    }

    try {
      // Log the structure we're working with
      console.log('💾 Preparing to save to database...');
      console.log('User ID:', user.id);
      console.log('Article data:', {
        hasArticle: !!blogContent.article,
        hasTitle: !!blogContent.article?.title,
        hasContent: !!blogContent.article?.content,
        hasSections: !!blogContent.article?.sections,
        hasFullContent: !!(blogContent as any).fullContent
      });

      // Extract title and content with fallbacks
      const title = blogContent.article?.title ||
                   formData.topic ||
                   'Untitled Blog Post';

      // Use article.content if available, otherwise use fullContent from API
      const content = blogContent.article?.content ||
                     (blogContent as any).fullContent ||
                     '';

      if (!content) {
        console.error('❌ No content found in blog response');
        throw new Error('Blog content is missing');
      }

      // Generate description from first section or content
      let description = '';
      if (blogContent.article?.sections && blogContent.article.sections.length > 0) {
        description = blogContent.article.sections[0]?.content?.substring(0, 200) || '';
      }

      if (!description && content) {
        // Fallback: use first 200 chars of content
        description = content.substring(0, 200);
      }

      const payload = {
        userId: user.id,
        title,
        content,
        description,
        tone: formData.options?.tone || 'professional',
        audience: formData.targetAudience || '',
        audioData: blogContent.audio?.audioData || null,
        audioDuration: blogContent.audio
          ? estimateAudioDuration(
              blogContent.audio.audioData,
              blogContent.audio.sampleRate,
              blogContent.audio.channels
            )
          : null,
        audioFileSize: blogContent.audio
          ? Math.floor((blogContent.audio.audioData.length * 3) / 4)
          : null,
        audioStatus: blogContent.audio ? 'ready' : null,
      };

      console.log('📤 Sending to database:', {
        userId: payload.userId,
        title: payload.title,
        contentLength: payload.content.length,
        hasAudio: !!payload.audioData
      });

      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Database save error response:', errorData);
        throw new Error(errorData.error || 'Failed to save blog to database');
      }

      const result = await response.json();
      console.log('✅ Blog saved to database:', result);
    } catch (error) {
      console.error('❌ Error saving blog:', error);
      // Don't throw - just log, so user can still see the blog
      alert('Warning: Blog generated successfully but failed to save to database. You can still read it below.');
    }
  };

  const estimateAudioDuration = (
    base64Data: string,
    sampleRate: number,
    channels: number
  ): number => {
    const audioBytes = (base64Data.length * 3) / 4;
    const samples = audioBytes / 2;
    return Math.floor(samples / (sampleRate * channels));
  };

  const handlePostClick = async (post: BlogPost) => {
    // Convert saved post to BlogContentResponse format for the reader
    const blogContent: BlogContentResponse = {
      id: post.id,
      status: 'completed',
      article: {
        title: post.title,
        content: post.content,
        wordCount: post.content.split(/\s+/).length,
        sections: [],
        metadata: {
          topic: post.title,
          keywords: [],
          tone: post.tone || 'professional',
          style: 'informative',
        },
      },
      audio: post.audioData
        ? {
            audioData: post.audioData,
            format: 'pcm',
            sampleRate: 24000,
            channels: 1,
            generatedAt: post.createdAt,
          }
        : undefined,
      generatedAt: post.createdAt,
    };

    setSelectedBlog(blogContent);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-linear-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-purple-50 via-blue-50 to-pink-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-br from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.displayName || user?.primaryEmail?.split('@')[0]}!
          </h1>
          <p className="text-xl text-gray-600">
            Manage your AI-generated blog content
          </p>
        </motion.div>

        {/* Create New Post Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateForm(true)}
          disabled={isGenerating}
          className="mb-8 px-6 py-3 bg-linear-to-br from-purple-600 via-blue-600 to-pink-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Create New Post
        </motion.button>

        {/* Generation Progress */}
        {isGenerating && generationProgress && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              <span className="font-semibold text-gray-800">
                Generating your blog post...
              </span>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              This includes prompt enhancement, content generation, and TTS audio
              synthesis. Please wait...
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(generationProgress.attempt / generationProgress.maxAttempts) * 100}%`,
                }}
                className="bg-linear-to-r from-purple-600 to-pink-600 h-2 rounded-full"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {generationProgress.attempt} / {generationProgress.maxAttempts} attempts
            </div>
          </motion.div>
        )}

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg"
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No blog posts yet
            </h3>
            <p className="text-gray-600">
              Click "Create New Post" to start generating AI-powered content!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handlePostClick(post)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {post.status}
                  </span>
                  {post.audioUrl && (
                    <Music className="w-5 h-5 text-purple-600" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {post.title}
                </h3>

                {/* Description */}
                {post.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.createdAt)}
                  </div>
                  {post.audioDuration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(post.audioDuration)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Blog Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateBlogForm
            onClose={() => !isGenerating && setShowCreateForm(false)}
            onSubmit={handleCreateBlog}
            isGenerating={isGenerating}
          />
        )}
      </AnimatePresence>

      {/* Blog Reader Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <BlogReader
            blog={{
              title: selectedBlog.article?.title || 'Untitled',
              content: selectedBlog.article?.content ||
                      (selectedBlog as any).fullContent ||
                      'Content not available',
              description: selectedBlog.article?.sections?.[0]?.content?.substring(0, 200) ||
                          selectedBlog.article?.introduction?.substring(0, 200) ||
                          '',
              tone: selectedBlog.article?.metadata?.tone || 'professional',
              audience: selectedBlog.article?.metadata?.keywords?.join(', ') ||
                       selectedBlog.article?.metadata?.targetAudience ||
                       '',
              audio: selectedBlog.audio,
            }}
            onClose={() => setSelectedBlog(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
