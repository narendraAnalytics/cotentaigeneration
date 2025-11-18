"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Loader2, Music, Clock, Calendar, Mail, X, Send, ChevronDown, ChevronUp } from "lucide-react";
import CreateBlogForm, { BlogGenerationRequest } from "@/components/CreateBlogForm";
import CreateEmailForm from "@/components/CreateEmailForm";
import BlogReader from "@/components/BlogReader";
import {
  generateBlog,
  pollBlogContent,
  BlogContentResponse,
  generateEmail,
  pollEmailContent,
  EmailGenerationRequest,
  EmailContentResponse,
  sendGeneratedEmail
} from "@/lib/api";

interface BlogPost {
  id: string;
  type: string; // 'blog' or 'email'
  emailType: string | null; // Email category
  subjectLine: string | null; // Email subject
  requestId: string | null; // Original request ID from generation (for Motia state)
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
  htmlContent: string | null; // HTML version of email content
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const user = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [contentType, setContentType] = useState<'all' | 'blog' | 'email'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateEmailForm, setShowCreateEmailForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    attempt: number;
    maxAttempts: number;
  } | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogContentResponse | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailContentResponse | null>(null);
  const [emailViewMode, setEmailViewMode] = useState<'plain' | 'html'>('plain'); // NEW: Toggle between plain/HTML

  // Send email form state
  const [sendFormVisible, setSendFormVisible] = useState<Record<string, boolean>>({});
  const [sendFormData, setSendFormData] = useState<Record<string, { recipientEmail: string; subjectLine: string; fromName: string }>>({});
  const [sendStatus, setSendStatus] = useState<Record<string, 'idle' | 'sending' | 'success' | 'error'>>({});
  const [sendError, setSendError] = useState<Record<string, string>>({});

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

  const handleCreateEmail = async (formData: EmailGenerationRequest) => {
    try {
      setIsGenerating(true);
      setGenerationProgress({ attempt: 0, maxAttempts: 30 });

      // Step 1: Start generation
      console.log('🚀 Starting email generation...');
      console.log('📝 Request data:', formData);

      const generateResponse = await generateEmail(formData);
      console.log('✅ Generation started:', generateResponse.id);

      // Step 2: Poll for completion (no TTS wait for emails)
      console.log('⏳ Waiting for email generation...');
      const emailContent = await pollEmailContent(
        generateResponse.id,
        30,
        3000,
        (attempt, maxAttempts) => {
          setGenerationProgress({ attempt, maxAttempts });
        }
      );

      console.log('✅ Email generated successfully!');
      console.log('📦 Email content received:', JSON.stringify(emailContent, null, 2));

      // Step 3: Save to database
      await saveEmailToDatabase(emailContent, formData);

      // Step 4: Show email in reader
      setSelectedEmail(emailContent);
      setShowCreateEmailForm(false);

      // Refresh posts list
      await fetchUserPosts();
    } catch (error) {
      console.error('❌ Error generating email:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to generate email. Please try again.'
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
        requestId: blogContent.id, // Store original request ID
        title,
        content,
        description,
        tone: (formData.options?.tone || 'professional').substring(0, 80),
        audience: (formData.targetAudience || '').substring(0, 80),
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

  const saveEmailToDatabase = async (
    emailContent: EmailContentResponse,
    formData: EmailGenerationRequest
  ) => {
    if (!user) {
      console.error('❌ Cannot save: user not authenticated');
      return;
    }

    try {
      console.log('💾 Preparing to save email to database...');
      console.log('User ID:', user.id);

      const payload = {
        userId: user.id,
        type: 'email',
        emailType: (formData.emailType || '').substring(0, 50), // Truncate to 50 chars (schema limit)
        subjectLine: emailContent.subjectAlternatives.join(' | '), // Store all alternatives
        requestId: emailContent.id, // Store original request ID for email sending
        title: emailContent.subject, // Main subject as title
        content: emailContent.body,
        description: emailContent.body.substring(0, 200), // First 200 chars
        tone: (formData.tone || '').substring(0, 100), // Truncate to 100 chars (schema limit)
        audience: (formData.targetAudience || '').substring(0, 100), // Truncate to 100 chars (schema limit)
        audioData: null, // No audio for emails
        audioDuration: null,
        audioFileSize: null,
        audioStatus: null,
        // NEW: Include optional enhancement fields
        industry: formData.industry || null,
        preheaderText: emailContent.preheaderText || null,
        htmlContent: emailContent.htmlBody || null,
        emojiUsed: emailContent.emojiUsed || false,
      };

      console.log('📤 Sending email to database:', {
        userId: payload.userId,
        type: payload.type,
        emailType: payload.emailType,
        subject: payload.title,
        contentLength: payload.content.length
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
        throw new Error(errorData.error || 'Failed to save email to database');
      }

      const result = await response.json();
      console.log('✅ Email saved to database:', result);
    } catch (error) {
      console.error('❌ Error saving email:', error);
      alert('Warning: Email generated successfully but failed to save to database. You can still read it below.');
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
    try {
      // Fetch full post with audio data from API
      const response = await fetch(`/api/blog-posts/${post.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch post details');
      }

      const { post: fullPost } = await response.json();

      // Convert saved post to BlogContentResponse format for the reader
      const blogContent: BlogContentResponse = {
        id: fullPost.id,
        status: 'completed',
        article: {
          title: fullPost.title,
          content: fullPost.content,
          wordCount: fullPost.content.split(/\s+/).length,
          sections: [],
          metadata: {
            topic: fullPost.title,
            keywords: [],
            tone: fullPost.tone || 'professional',
            style: 'informative',
          },
        },
        audio: fullPost.audioData
          ? {
              audioData: fullPost.audioData,
              format: 'pcm',
              sampleRate: 24000,
              channels: 1,
              generatedAt: fullPost.createdAt,
            }
          : undefined,
        generatedAt: fullPost.createdAt,
      };

      setSelectedBlog(blogContent);
    } catch (error) {
      console.error('Error loading post:', error);
      alert('Failed to load post. Please try again.');
    }
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

  const toggleSendForm = (postId: string, post: BlogPost) => {
    const isVisible = !sendFormVisible[postId];
    setSendFormVisible({ ...sendFormVisible, [postId]: isVisible });

    // Initialize form data if opening for first time
    if (isVisible && !sendFormData[postId]) {
      const alternatives = post.subjectLine?.split(' | ') || [post.title];
      setSendFormData({
        ...sendFormData,
        [postId]: {
          recipientEmail: '',
          subjectLine: alternatives[0] || post.title,
          fromName: ''
        }
      });
    }
  };

  const handleSendEmail = async (post: BlogPost) => {
    const formData = sendFormData[post.id];

    if (!formData || !formData.recipientEmail) {
      setSendError({ ...sendError, [post.id]: 'Please enter a recipient email address' });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.recipientEmail)) {
      setSendError({ ...sendError, [post.id]: 'Please enter a valid email address' });
      return;
    }

    try {
      setSendStatus({ ...sendStatus, [post.id]: 'sending' });
      setSendError({ ...sendError, [post.id]: '' });

      console.log('📧 Sending email for post:', post.id, 'requestId:', post.requestId);

      const result = await sendGeneratedEmail({
        requestId: post.requestId || post.id, // Use requestId, fallback to post.id for old records
        recipientEmail: formData.recipientEmail,
        subjectLine: formData.subjectLine,
        fromName: formData.fromName || undefined,
        body: post.content, // Send the email body from database
        htmlBody: post.htmlContent || undefined // Send HTML version if available
      });

      if (result.success) {
        console.log('✅ Email sent successfully!', result);
        setSendStatus({ ...sendStatus, [post.id]: 'success' });

        // Reset form after 2 seconds
        setTimeout(() => {
          setSendFormVisible({ ...sendFormVisible, [post.id]: false });
          setSendStatus({ ...sendStatus, [post.id]: 'idle' });
        }, 2000);
      } else {
        setSendStatus({ ...sendStatus, [post.id]: 'error' });

        // Format user-friendly error message
        let errorMessage = result.error || 'Failed to send email';

        // Check if this is a Resend testing limitation error
        if (errorMessage.includes('testing emails') || errorMessage.includes('verify a domain')) {
          errorMessage = `⚠️ Testing Mode: You can only send emails to your verified email address (${user?.primaryEmail || 'your account email'}).\n\nTo send to any recipient, verify your domain at resend.com/domains and update the RESEND_FROM_EMAIL setting.`;
        }

        setSendError({ ...sendError, [post.id]: errorMessage });
      }
    } catch (error) {
      setSendStatus({ ...sendStatus, [post.id]: 'error' });
      setSendError({ ...sendError, [post.id]: error instanceof Error ? error.message : 'Unknown error' });
    }
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
          <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.displayName || user?.primaryEmail?.split('@')[0]}!
          </h1>
          <p className="text-xl text-gray-600">
            Manage your AI-generated blog content
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-center gap-4"
        >
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-md">
            <button
              onClick={() => setContentType('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                contentType === 'all'
                  ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setContentType('blog')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                contentType === 'blog'
                  ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Blogs
            </button>
            <button
              onClick={() => setContentType('email')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                contentType === 'email'
                  ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Emails
            </button>
          </div>
        </motion.div>

        {/* Create Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            disabled={isGenerating}
            className="px-6 py-3 bg-linear-to-r from-purple-600 via-blue-600 to-pink-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-5 h-5" />
            Create New Blog
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateEmailForm(true)}
            disabled={isGenerating}
            className="px-6 py-3 bg-linear-to-r from-pink-600 via-purple-600 to-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-5 h-5" />
            Create New Email
          </motion.button>
        </div>

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
        {(() => {
          // Filter posts by contentType
          const filteredPosts = posts.filter(post =>
            contentType === 'all' || post.type === contentType
          );

          if (filteredPosts.length === 0) {
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg"
              >
                {contentType === 'all' ? (
                  <>
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                      No content yet
                    </h3>
                    <p className="text-gray-600">
                      Create your first blog or email to get started!
                    </p>
                  </>
                ) : contentType === 'blog' ? (
                  <>
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                      No blog posts yet
                    </h3>
                    <p className="text-gray-600">
                      Click "Create New Blog" to start generating AI-powered blog content!
                    </p>
                  </>
                ) : (
                  <>
                    <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                      No emails yet
                    </h3>
                    <p className="text-gray-600">
                      Click "Create New Email" to start generating AI-powered emails!
                    </p>
                  </>
                )}
              </motion.div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Clickable area for viewing */}
                <div onClick={() => handlePostClick(post)} className="cursor-pointer">
                  {/* Type Badge & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {post.type === 'email' ? (
                        <Mail className="w-5 h-5 text-pink-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600" />
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                    {post.audioUrl && (
                      <Music className="w-5 h-5 text-purple-600" />
                    )}
                  </div>

                  {/* Email Type Badge (for emails) */}
                  {post.type === 'email' && post.emailType && (
                    <div className="mb-2">
                      <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-medium">
                        {post.emailType}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl font-bold bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2 line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Subject Line Alternatives (for emails) */}
                  {post.type === 'email' && post.subjectLine && (
                    <p className="text-xs text-gray-500 mb-2">
                      Alternatives: {post.subjectLine.split(' | ').slice(0, 2).join(', ')}...
                    </p>
                  )}

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
                </div>

                {/* Send Email Section (for emails only) */}
                {post.type === 'email' && (
                  <div className="mt-4 pt-4 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleSendForm(post.id, post)}
                      className="w-full flex items-center justify-between px-4 py-2 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        <span>Send Email</span>
                      </div>
                      {sendFormVisible[post.id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {/* Send Form (collapsible) */}
                    <AnimatePresence>
                      {sendFormVisible[post.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 space-y-3">
                            {/* Recipient Email */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Recipient Email *
                              </label>
                              <input
                                type="email"
                                value={sendFormData[post.id]?.recipientEmail || ''}
                                onChange={(e) => setSendFormData({
                                  ...sendFormData,
                                  [post.id]: {
                                    ...sendFormData[post.id],
                                    recipientEmail: e.target.value
                                  }
                                })}
                                placeholder="recipient@example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                disabled={sendStatus[post.id] === 'sending'}
                              />
                            </div>

                            {/* Subject Line Selector */}
                            <div>
                              <label htmlFor={`subject-${post.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Subject Line
                              </label>
                              <select
                                id={`subject-${post.id}`}
                                value={sendFormData[post.id]?.subjectLine || ''}
                                onChange={(e) => setSendFormData({
                                  ...sendFormData,
                                  [post.id]: {
                                    ...sendFormData[post.id],
                                    subjectLine: e.target.value
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                disabled={sendStatus[post.id] === 'sending'}
                              >
                                {(post.subjectLine?.split(' | ') || [post.title]).map((subject, idx) => (
                                  <option key={idx} value={subject}>
                                    {subject}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* From Name (Optional) */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                From Name (Optional)
                              </label>
                              <input
                                type="text"
                                value={sendFormData[post.id]?.fromName || ''}
                                onChange={(e) => setSendFormData({
                                  ...sendFormData,
                                  [post.id]: {
                                    ...sendFormData[post.id],
                                    fromName: e.target.value
                                  }
                                })}
                                placeholder="Your Name or Company"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                disabled={sendStatus[post.id] === 'sending'}
                              />
                            </div>

                            {/* Error Message */}
                            {sendError[post.id] && (
                              <div className="text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
                                <p className="text-red-800 font-medium whitespace-pre-wrap leading-relaxed">
                                  {sendError[post.id]}
                                </p>
                              </div>
                            )}

                            {/* Success Message */}
                            {sendStatus[post.id] === 'success' && (
                              <div className="text-sm bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                                <p className="text-green-800 font-medium">
                                  ✅ Email sent successfully!
                                </p>
                              </div>
                            )}

                            {/* Send Button */}
                            <button
                              onClick={() => handleSendEmail(post)}
                              disabled={sendStatus[post.id] === 'sending' || sendStatus[post.id] === 'success'}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {sendStatus[post.id] === 'sending' ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Sending...</span>
                                </>
                              ) : sendStatus[post.id] === 'success' ? (
                                <span>Sent!</span>
                              ) : (
                                <>
                                  <Send className="w-4 h-4" />
                                  <span>Send Email</span>
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          );
        })()}
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

      {/* Create Email Form Modal */}
      <AnimatePresence>
        {showCreateEmailForm && (
          <CreateEmailForm
            onClose={() => !isGenerating && setShowCreateEmailForm(false)}
            onSubmit={handleCreateEmail}
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

      {/* Email Reader Modal (NEW) */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEmail(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEmail.subject}</h2>
                  {selectedEmail.preheaderText && (
                    <p className="text-sm text-gray-600 mt-1">{selectedEmail.preheaderText}</p>
                  )}
                  {selectedEmail.subjectAlternatives && selectedEmail.subjectAlternatives.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Alternative Subject Lines:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmail.subjectAlternatives.map((alt, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
                  aria-label="Close email"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* View Mode Toggle (if HTML available) */}
              {selectedEmail.htmlBody && (
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">View:</span>
                  <button
                    onClick={() => setEmailViewMode('plain')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      emailViewMode === 'plain'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Plain Text
                  </button>
                  <button
                    onClick={() => setEmailViewMode('html')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      emailViewMode === 'html'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    HTML Preview
                  </button>
                </div>
              )}

              {/* Email Body */}
              <div className="p-6">
                {emailViewMode === 'html' && selectedEmail.htmlBody ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-gray-800">
                    {selectedEmail.body}
                  </div>
                )}

                {/* CTA */}
                {selectedEmail.callToAction && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Call to Action:</p>
                    <span className="inline-block px-4 py-2 bg-linear-to-br from-purple-600 to-pink-600 text-white rounded-lg font-medium">
                      {selectedEmail.callToAction}
                    </span>
                  </div>
                )}

                {/* Metadata */}
                {selectedEmail.metadata && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">Email Type:</span>
                        <span className="ml-2 text-gray-600">{selectedEmail.metadata.emailType}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Tone:</span>
                        <span className="ml-2 text-gray-600">{selectedEmail.metadata.tone}</span>
                      </div>
                      {selectedEmail.metadata.estimatedReadTime && (
                        <div>
                          <span className="font-semibold text-gray-700">Read Time:</span>
                          <span className="ml-2 text-gray-600">{selectedEmail.metadata.estimatedReadTime}</span>
                        </div>
                      )}
                      {selectedEmail.emojiUsed && (
                        <div>
                          <span className="font-semibold text-gray-700">Emojis:</span>
                          <span className="ml-2 text-gray-600">✓ Enabled</span>
                        </div>
                      )}
                    </div>
                    {selectedEmail.metadata.keywords && selectedEmail.metadata.keywords.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold text-gray-700 mb-2">Keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmail.metadata.keywords.map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
