"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink, Sparkles, Code2, Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";

// Project data structure - easily update with your real projects
const projects = [
  {
    id: 1,
    title: "ProfessionalLifeStyleShoot",
    description: "An advanced AI-powered professional lifestyle photography platform that transforms your vision into stunning reality using cutting-edge technology.",
    video: "/videos/project1.mp4", // Add your video file here
    image: "/images/projects/project1.png", // Fallback image
    techStack: ["Next.js", "TypeScript", "clerck", "Neon", "Tailwind"],
    githubUrl: "https://github.com/narendraAnalytics/ProfessionalLifeStyleShoot.git",
    liveUrl: "https://professional-life-style-shoot.vercel.app/",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "SnapCook - AI-Powered Recipe Generator",
    description: "SnapCook is an intelligent recipe generation platform that transforms your available ingredients into personalized, delicious recipes using advanced AI technology.",
    video: "/videos/project2.mp4",
    image: "/images/projects/project2.png",
    techStack: ["React", "Google Gemini 2.5 Flash", "shadcn/ui ", "Neon", "Drizzle ORM","EmailJS"],
    githubUrl: "https://github.com/narendraAnalytics/snapcook.git",
    liveUrl: "https://snapcook-psi.vercel.app/",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    title: "StepWise - AI-Powered Math Learning Platform",
    description: "StepWise transforms math problems into learning opportunities by providing detailed, step-by-step solutions that teach concepts, not just answers.",
    video: "/videos/project3.mp4",
    image: "/images/projects/project3.png",
    techStack: ["Next.js 15", "TypeScript", "Clerk", " Neon PostgreSQL + Drizzle ORM", "Vercel"],
    githubUrl: "https://github.com/narendraAnalytics/stepwise.git",
    liveUrl: "https://stepwise-gules.vercel.app/",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    title: "Personal Research AI Assistant",
    description: "An intelligent research assistant powered by LangGraph, Gemini AI, and advanced parallel execution",
    video: "/videos/project4.mp4",
    image: "/images/projects/project4.png",
    techStack: ["Next.js", "FastAPI", "Python", "LangGraph", "Google Gemini","Clerk"],
    githubUrl: "https://github.com/narendraAnalytics/aiagent.git",
    liveUrl: "https://aiagent-ten-nu.vercel.app/",
    gradient: "from-orange-500 to-red-500"
  },
];

// Tech stack color mapping for badges
const techColors: Record<string, string> = {
  "Next.js": "bg-gradient-to-r from-gray-700 to-gray-900 text-white",
  "React": "bg-gradient-to-r from-cyan-500 to-blue-500 text-white",
  "Vue.js": "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
  "TypeScript": "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
  "Node.js": "bg-gradient-to-r from-green-600 to-green-700 text-white",
  "Tailwind": "bg-gradient-to-r from-cyan-400 to-teal-500 text-white",
  "PostgreSQL": "bg-gradient-to-r from-blue-700 to-indigo-700 text-white",
  "MongoDB": "bg-gradient-to-r from-green-700 to-green-800 text-white",
  "Firebase": "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
  "Vercel": "bg-gradient-to-r from-black to-gray-800 text-white",
  "AWS": "bg-gradient-to-r from-orange-600 to-yellow-500 text-white",
  default: "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
};

// Video Player Component
interface VideoPlayerProps {
  project: typeof projects[0];
  index: number;
}

function VideoPlayer({ project, index }: VideoPlayerProps) {
  const [videoStatus, setVideoStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attempt to play video with proper Promise handling and retry logic
  const attemptPlay = async () => {
    const video = videoRef.current;
    if (!video || !canPlay) return;

    try {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
      }
    } catch (error: any) {
      // Handle common autoplay errors
      if (error.name === 'AbortError' || error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
        // Retry after a short delay
        setTimeout(() => attemptPlay(), 500);
      }
    }
  };

  // Intersection Observer - play when visible, pause when not
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.load();
            // Attempt play when visible and ready
            if (canPlay) {
              attemptPlay();
            }
          } else {
            // Pause when not visible to save power
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, [canPlay]);

  // Page Visibility API - pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden) {
        video.pause();
        setIsPlaying(false);
      } else if (canPlay) {
        attemptPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [canPlay]);

  const handleCanPlayThrough = () => {
    setCanPlay(true);
    setVideoStatus('loaded');
    attemptPlay();
  };

  const handleVideoLoaded = () => {
    // Video metadata loaded, but wait for canplaythrough
  };

  const handleVideoError = () => {
    setVideoStatus('error');
    setCanPlay(false);
  };

  const togglePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      await attemptPlay();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      className="relative w-full h-56 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20`} />

      {/* Loading State */}
      <AnimatePresence>
        {videoStatus === 'loading' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 z-20"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className={`w-12 h-12 text-gray-400 mx-auto mb-2`} />
              </motion.div>
              <p className="text-sm text-gray-500 font-medium">Loading demo...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Element */}
      {videoStatus !== 'error' && (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={handleCanPlayThrough}
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
          className={`w-full h-full object-cover ${videoStatus === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        >
          <source src={project.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Error Fallback */}
      {videoStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">Project Demo</p>
          </div>
        </div>
      )}

      {/* Hover Overlay */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
      />

      {/* Video Controls */}
      <AnimatePresence>
        {showControls && videoStatus === 'loaded' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-black/50 backdrop-blur-md z-30"
          >
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            <span className="text-xs text-white/80 ml-auto">Demo Video</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShowcaseSection() {
  return (
    <section id="showcase" className="relative min-h-screen w-full py-20 px-4 sm:px-8 overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 14, repeat: Infinity }}
          className="absolute bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 mb-4"
          >
            <Code2 className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              My Work
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
              Project Showcase
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Explore my latest projects - built with modern tech stacks and deployed on the web
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Floating Animation */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4 + index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
                className="relative h-full"
              >
                {/* Card */}
                <div className="relative h-full rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Project Video */}
                  <VideoPlayer project={project} index={index} />

                  {/* Project Details */}
                  <div className="relative p-6">
                    {/* Title */}
                    <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${project.gradient} bg-clip-text text-transparent`}>
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            techColors[tech] || techColors.default
                          } shadow-sm`}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {/* GitHub Button */}
                      <motion.a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        <Github className="w-4 h-4" />
                        <span>Code</span>
                      </motion.a>

                      {/* Live Demo Button */}
                      <motion.a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${project.gradient} hover:opacity-90 text-white font-semibold transition-all shadow-md hover:shadow-lg`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Live Demo</span>
                      </motion.a>
                    </div>
                  </div>

                  {/* Decorative Gradient Glow */}
                  <motion.div
                    className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${project.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`}
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600">
            Want to collaborate or learn more about these projects?{" "}
            <a
              href="#contact"
              className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Get in touch →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
