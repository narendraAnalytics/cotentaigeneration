"use client";

import { motion } from "framer-motion";
import { Zap, Github, Linkedin, ArrowRight } from "lucide-react";

const navigationLinks = [
  { name: "Home", href: "#home" },
  { name: "Features", href: "#features" },
  { name: "Showcase", href: "#showcase" },
  { name: "Contact", href: "#contact" }
];

const socialLinks = [
  {
    name: "GitHub",
    icon: Github,
    url: "https://github.com/yourusername",
    gradient: "from-gray-700 to-gray-900",
    hoverGradient: "from-gray-600 to-gray-800"
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    url: "https://linkedin.com/in/yourusername",
    gradient: "from-blue-600 to-blue-800",
    hoverGradient: "from-blue-500 to-blue-700"
  }
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orb 1 - Top Left */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur-3xl"
        />

        {/* Gradient Orb 2 - Top Right */}
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -top-20 -right-40 w-80 h-80 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full blur-3xl"
        />

        {/* Gradient Orb 3 - Bottom Left */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.45, 0.25],
            x: [0, 40, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full blur-3xl"
        />

        {/* Gradient Orb 4 - Bottom Right */}
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
          className="absolute -bottom-20 -right-40 w-80 h-80 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full blur-3xl"
        />

        {/* Gradient Orb 5 - Center */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16">
        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section - Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <motion.div
              animate={{
                y: [0, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Logo and Brand Name */}
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-lg blur-sm opacity-60" />
                  <Zap className="w-10 h-10 text-amber-400 relative z-10" strokeWidth={2.5} />
                </motion.div>
                <span className="text-2xl font-bold bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  AI Copywrite
                </span>
              </div>

              {/* Tagline */}
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Transform Ideas into Content with AI. Create stunning blogs, emails, and more in seconds.
              </p>
            </motion.div>
          </motion.div>

          {/* Navigation Links - Center */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <motion.div
              animate={{
                y: [0, -5, 0]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <h3 className="text-white font-bold text-lg mb-6 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Quick Links
              </h3>
              <nav className="flex flex-col space-y-3">
                {navigationLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="group relative inline-flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 w-fit"
                  >
                    {/* Hover Glow Effect */}
                    <span className="relative">
                      {link.name}
                      <motion.span
                        className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10"
                      />
                      <motion.span
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-rose-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                      />
                    </span>

                    {/* Animated Arrow */}
                    <motion.div
                      initial={{ x: -5, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="opacity-0 group-hover:opacity-100"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.a>
                ))}
              </nav>
            </motion.div>
          </motion.div>

          {/* Social Links - Right */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <motion.div
              animate={{
                y: [0, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <h3 className="text-white font-bold text-lg mb-6 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                Connect
              </h3>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.5 }}
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -5, 5, -5, 0]
                    }}
                    className="group relative"
                  >
                    {/* Icon Button */}
                    <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${social.gradient} hover:${social.hoverGradient} transition-all duration-300 shadow-lg`}>
                      <social.icon className="w-6 h-6 text-white" strokeWidth={2.5} />

                      {/* Glow Effect on Hover */}
                      <motion.div
                        className={`absolute -inset-1 bg-gradient-to-br ${social.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300 -z-10`}
                      />
                    </div>

                    {/* Tooltip */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    >
                      {social.name}
                    </motion.div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Separator Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-8"
        />

        {/* Copyright Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm">
            © {currentYear} AI Copywrite. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
