"use client";

import { motion } from "framer-motion";
import { Github, ExternalLink, Sparkles, Code2 } from "lucide-react";
import Image from "next/image";

// Project data structure - easily update with your real projects
const projects = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with payment integration, real-time inventory, and admin dashboard",
    image: "/images/projects/project1.png", // Replace with your project screenshot
    techStack: ["Next.js", "TypeScript", "Stripe", "PostgreSQL", "Tailwind"],
    githubUrl: "https://github.com/yourusername/project1",
    liveUrl: "https://project1.vercel.app",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "AI Content Generator",
    description: "Smart content creation tool powered by AI for blogs, social media, and marketing materials",
    image: "/images/projects/project2.png",
    techStack: ["React", "Node.js", "OpenAI", "MongoDB", "AWS"],
    githubUrl: "https://github.com/yourusername/project2",
    liveUrl: "https://project2.vercel.app",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    title: "Real-Time Chat App",
    description: "Modern messaging platform with WebSocket support, file sharing, and encrypted communications",
    image: "/images/projects/project3.png",
    techStack: ["React", "Socket.io", "Express", "Redis", "Docker"],
    githubUrl: "https://github.com/yourusername/project3",
    liveUrl: "https://project3.vercel.app",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: 4,
    title: "Task Management System",
    description: "Collaborative project management tool with kanban boards, team collaboration, and analytics",
    image: "/images/projects/project4.png",
    techStack: ["Vue.js", "Firebase", "Vuex", "Chart.js", "Vercel"],
    githubUrl: "https://github.com/yourusername/project4",
    liveUrl: "https://project4.vercel.app",
    gradient: "from-orange-500 to-red-500"
  },
  {
    id: 5,
    title: "Weather Forecast Dashboard",
    description: "Beautiful weather app with interactive maps, hourly forecasts, and location-based alerts",
    image: "/images/projects/project5.png",
    techStack: ["React", "Weather API", "Mapbox", "Recharts", "Netlify"],
    githubUrl: "https://github.com/yourusername/project5",
    liveUrl: "https://project5.vercel.app",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    id: 6,
    title: "Portfolio Website Builder",
    description: "Drag-and-drop website builder for creating stunning portfolios without coding knowledge",
    image: "/images/projects/project6.png",
    techStack: ["Next.js", "DnD Kit", "Supabase", "Tailwind", "Vercel"],
    githubUrl: "https://github.com/yourusername/project6",
    liveUrl: "https://project6.vercel.app",
    gradient: "from-yellow-500 to-orange-500"
  }
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
                  {/* Project Image */}
                  <div className="relative w-full h-56 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {/* Placeholder gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-20`} />

                    {/* Image overlay effect */}
                    <motion.div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"
                    />

                    {/* "Add Your Screenshot" Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Project Screenshot</p>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                    />
                  </div>

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
