"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mail,
  Github,
  Linkedin,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles
} from "lucide-react";

// Social media links - Update with your actual profiles
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

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface CursorTrail {
  x: number;
  y: number;
  id: number;
}

export default function ContactSection() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [cursorTrail, setCursorTrail] = useState<CursorTrail[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const trailIdRef = useRef(0);

  const yourEmail = "your.email@example.com"; // Update with your email

  // Cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only create trail if mouse is inside the section
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        const newTrail: CursorTrail = {
          x,
          y,
          id: trailIdRef.current++
        };

        setCursorTrail((prev) => {
          const updated = [...prev, newTrail];
          // Keep only last 8 trail elements for performance
          return updated.slice(-8);
        });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (section) {
        section.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // Auto-remove trail elements after animation
  useEffect(() => {
    if (cursorTrail.length > 0) {
      const timer = setTimeout(() => {
        setCursorTrail((prev) => prev.slice(1));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [cursorTrail]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Simulate API call - Replace with your actual endpoint
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(yourEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen w-full py-20 px-4 sm:px-8 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-gray-50"
    >
      {/* Cursor Trail Effect */}
      <AnimatePresence>
        {cursorTrail.map((trail, index) => (
          <motion.div
            key={trail.id}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute pointer-events-none rounded-full bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 blur-xl"
            style={{
              left: trail.x,
              top: trail.y,
              width: 40,
              height: 40,
              transform: "translate(-50%, -50%)",
              zIndex: 5
            }}
          />
        ))}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-300 to-rose-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full blur-3xl"
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 via-rose-100 to-pink-100 mb-4"
          >
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
              Get In Touch
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
              Let's Work Together
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Have a project in mind? Drop me a message and let's create something amazing
          </p>
        </motion.div>

        {/* Diagonal Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Left Side - Contact Form (3/5 width) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3"
          >
            <div className="relative">
              {/* Glassmorphic Form Container */}
              <div className="relative p-8 sm:p-10 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-2xl">
                {/* Gradient Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 rounded-3xl blur-2xl opacity-20 -z-10" />

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-6 py-4 rounded-2xl bg-white/30 backdrop-blur-md border ${
                        errors.name ? "border-red-400" : "border-white/40"
                      } focus:border-gradient-to-r focus:from-orange-400 focus:to-rose-400 outline-none transition-all placeholder-gray-500 text-gray-800 font-medium shadow-sm focus:shadow-lg`}
                    />
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Email Input */}
                  <div>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-6 py-4 rounded-2xl bg-white/30 backdrop-blur-md border ${
                        errors.email ? "border-red-400" : "border-white/40"
                      } focus:border-gradient-to-r focus:from-orange-400 focus:to-rose-400 outline-none transition-all placeholder-gray-500 text-gray-800 font-medium shadow-sm focus:shadow-lg`}
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Subject Input */}
                  <div>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      placeholder="Subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full px-6 py-4 rounded-2xl bg-white/30 backdrop-blur-md border ${
                        errors.subject ? "border-red-400" : "border-white/40"
                      } focus:border-gradient-to-r focus:from-orange-400 focus:to-rose-400 outline-none transition-all placeholder-gray-500 text-gray-800 font-medium shadow-sm focus:shadow-lg`}
                    />
                    <AnimatePresence>
                      {errors.subject && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.subject}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <motion.textarea
                      whileFocus={{ scale: 1.01 }}
                      placeholder="Your Message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full px-6 py-4 rounded-2xl bg-white/30 backdrop-blur-md border ${
                        errors.message ? "border-red-400" : "border-white/40"
                      } focus:border-gradient-to-r focus:from-orange-400 focus:to-rose-400 outline-none transition-all placeholder-gray-500 text-gray-800 font-medium shadow-sm focus:shadow-lg resize-none`}
                    />
                    <AnimatePresence>
                      {errors.message && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 text-sm text-red-500 flex items-center gap-1"
                        >
                          <AlertCircle className="w-4 h-4" />
                          {errors.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full px-8 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 group-hover:from-orange-400 group-hover:via-rose-400 group-hover:to-pink-400 transition-all duration-300" />

                    {/* Shimmer Effect */}
                    {!isSubmitting && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ["-100%", "200%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                      />
                    )}

                    <span className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </span>
                  </motion.button>

                  {/* Status Messages */}
                  <AnimatePresence>
                    {submitStatus === "success" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-4 rounded-xl bg-green-100 text-green-700 font-medium"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Message sent successfully! I'll get back to you soon.
                      </motion.div>
                    )}
                    {submitStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-4 rounded-xl bg-red-100 text-red-700 font-medium"
                      >
                        <AlertCircle className="w-5 h-5" />
                        Something went wrong. Please try again.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Social Links & Info (2/5 width) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Email Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={handleCopyEmail}
              className="p-6 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Email</p>
                    <p className="text-gray-800 font-semibold">{yourEmail}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: copiedEmail ? 1.2 : 1 }}
                  className="p-2"
                >
                  {copiedEmail ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Location Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="p-6 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Location</p>
                  <p className="text-gray-800 font-semibold">Remote / Your City</p>
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-sm text-gray-500 bg-gradient-to-br from-slate-50 via-white to-gray-50">
                  Connect with me
                </span>
              </div>
            </div>

            {/* Social Media Cards */}
            <div className="space-y-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, x: 10 }}
                  className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/40 backdrop-blur-xl border border-white/50 shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${social.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`relative p-3 rounded-xl bg-gradient-to-r ${social.gradient} shadow-lg`}
                  >
                    <social.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </motion.div>

                  {/* Name */}
                  <span className={`relative font-semibold text-gray-700 group-hover:bg-gradient-to-r group-hover:${social.gradient} group-hover:bg-clip-text group-hover:text-transparent transition-all`}>
                    {social.name}
                  </span>

                  {/* Arrow Icon */}
                  <motion.div
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 border-t-2 border-r-2 border-gray-600 transform rotate-45" />
                  </motion.div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
