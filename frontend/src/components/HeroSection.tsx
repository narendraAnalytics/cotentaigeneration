"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FileText, Mail, Lightbulb, Sparkles } from "lucide-react";
import { useUser } from "@/lib/auth";

export default function HeroSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const rotatingWords = ["Content", "Blogs", "Emails", "Posts"];
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    setIsNavigating(true);
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/handler/sign-in');
    }
  };

  // Get user's first name for personalized CTA
  const getUserFirstName = () => {
    if (!user) return null;

    if (user.displayName) {
      // Extract first name from display name
      return user.displayName.split(' ')[0];
    }

    if (user.primaryEmail) {
      // Extract name from email (part before @)
      return user.primaryEmail.split('@')[0];
    }

    return 'there';
  };

  const firstName = getUserFirstName();

  return (
    <section id="home" className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-8 pt-20">
      {/* Gradient Orbs Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Feature Cards */}
      {/* AI Blog Card - Top Left */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{ scale: 1.05, rotate: 2 }}
        className="absolute top-32 left-8 md:left-20 lg:left-40 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 shadow-xl hover:shadow-2xl transition-all"
        >
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-2xl" />
          <div className="relative">
            <div className="w-12 h-12 mb-3 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-lg bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Blog
            </h3>
            <p className="text-sm text-gray-600 mt-1">Create engaging posts</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Email Card - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        whileHover={{ scale: 1.05, rotate: -2 }}
        className="absolute top-40 right-8 md:right-20 lg:right-40 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="relative p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 shadow-xl hover:shadow-2xl transition-all"
        >
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-cyan-400/20 rounded-2xl" />
          <div className="relative">
            <div className="w-12 h-12 mb-3 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-lg bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Email
            </h3>
            <p className="text-sm text-gray-600 mt-1">Craft perfect emails</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Startup Tips Card - Bottom Center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        whileHover={{ scale: 1.05, rotate: 3 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 md:left-auto md:right-32 md:translate-x-0 md:bottom-32 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="relative p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 shadow-xl hover:shadow-2xl transition-all"
        >
          <div className="absolute inset-0 bg-linear-to-br from-orange-500/20 to-red-500/20 rounded-2xl" />
          <div className="relative">
            <div className="w-12 h-12 mb-3 rounded-xl bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-lg bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Startup Tips
            </h3>
            <p className="text-sm text-gray-600 mt-1">Grow your business</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Hero Content */}
      <div className="relative z-10 text-center space-y-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
            <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Transform Ideas into{" "}
            </span>
            <span className="inline-block relative">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotatingWords[currentWordIndex]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block text-4xl sm:text-5xl md:text-6xl lg:text-7xl bg-linear-to-r from-cyan-400 via-pink-500 to-purple-600 bg-clip-text text-transparent font-extrabold"
                >
                  {rotatingWords[currentWordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              {" "}with AI
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto px-4"
        >
          Generate stunning blogs, emails, and startup tips with AI-powered copywriting in seconds
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
            className="relative px-8 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden group cursor-pointer"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-linear-to-r from-purple-600 via-blue-600 to-pink-600 group-hover:from-purple-500 group-hover:via-blue-500 group-hover:to-pink-500 transition-all duration-300" />

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />

            <span className="relative flex items-center gap-2 justify-center">
              <motion.div
                animate={{ rotate: isNavigating ? 360 : 0 }}
                transition={{
                  duration: 0.6,
                  repeat: isNavigating ? Infinity : 0,
                  ease: "linear"
                }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              {user ? `Start Blog Post, ${firstName}` : 'Get Started Free'}
            </span>
          </motion.button>
        </motion.div>

        {/* Trust Badge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-sm text-gray-500"
        >
          {user
            ? 'Ready to create? • AI-powered • With TTS Audio'
            : 'No credit card required • Free forever • Join 10,000+ creators'}
        </motion.p>
      </div>
    </section>
  );
}
