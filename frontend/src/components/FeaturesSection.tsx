"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Mail,
  Share2,
  Lightbulb,
  TrendingUp,
  Wand2,
  Sparkles,
  Zap
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI Blog Posts",
    description: "Generate engaging, SEO-optimized blog posts with built-in text-to-speech audio in seconds",
    gradient: "from-amber-500 to-yellow-500",
    iconBg: "from-amber-500 to-yellow-600",
    iconColor: "text-amber-500",
    delay: 0.1
  },
  {
    icon: Mail,
    title: "Email Copywriting",
    description: "Craft compelling marketing emails, cold outreach, newsletters, and follow-ups effortlessly",
    gradient: "from-rose-500 to-pink-500",
    iconBg: "from-rose-500 to-pink-600",
    iconColor: "text-rose-500",
    delay: 0.2
  },
  {
    icon: Share2,
    title: "Social Media Content",
    description: "Create scroll-stopping posts for all platforms with the perfect tone and engagement",
    gradient: "from-orange-500 to-rose-400",
    iconBg: "from-orange-500 to-rose-500",
    iconColor: "text-orange-500",
    delay: 0.3
  },
  {
    icon: Lightbulb,
    title: "Startup Tips & Guides",
    description: "Get expert business advice and actionable startup tips powered by AI insights",
    gradient: "from-yellow-500 to-orange-500",
    iconBg: "from-yellow-500 to-orange-600",
    iconColor: "text-yellow-600",
    delay: 0.4
  },
  {
    icon: TrendingUp,
    title: "SEO Optimized",
    description: "Every piece of content is crafted with SEO best practices to boost your rankings",
    gradient: "from-amber-600 to-rose-500",
    iconBg: "from-amber-600 to-rose-600",
    iconColor: "text-amber-600",
    delay: 0.5
  },
  {
    icon: Wand2,
    title: "Multiple Tones & Styles",
    description: "Switch between professional, casual, friendly, or persuasive tones to match your brand",
    gradient: "from-pink-500 to-rose-500",
    iconBg: "from-pink-500 to-rose-600",
    iconColor: "text-pink-500",
    delay: 0.6
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative min-h-screen w-full py-20 px-4 sm:px-8 overflow-hidden bg-white/30">
      {/* Background Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-20 -left-40 w-96 h-96 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-20 -right-40 w-96 h-96 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full blur-3xl"
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 mb-4"
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Everything You Need to
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
              Create Amazing Content
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            From blogs to emails, social posts to business tips - AI Copywrite has you covered
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay, duration: 0.6 }}
              whileHover={{
                scale: 1.05,
                y: -10,
              }}
              className="group relative"
            >
              {/* Floating Animation */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3 + index * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2
                }}
                className="relative h-full"
              >
                {/* Card */}
                <div className="relative h-full p-8 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  {/* Animated Border Glow */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <motion.div
                      whileHover={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.5 }}
                      className="mb-6"
                    >
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center shadow-lg`}>
                        <feature.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                    </motion.div>

                    {/* Title */}
                    <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Decorative Element */}
                    <motion.div
                      className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.4
                      }}
                    />
                  </div>

                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 flex items-center justify-center gap-2 flex-wrap">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="font-semibold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
              Powered by Advanced AI
            </span>
            <span>• Lightning Fast • Always Improving</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
