"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth";
import { motion } from "framer-motion";
import { FileText, Plus, Loader2, Music, Clock, Calendar } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string | null;
  content: string;
  description: string | null;
  tone: string | null;
  audience: string | null;
  status: string;
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
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, router]);

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
          className="mb-8 px-6 py-3 bg-linear-to-br from-purple-600 via-blue-600 to-pink-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          Create New Post
        </motion.button>

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
    </div>
  );
}
