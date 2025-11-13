"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  DollarSign,
  Mail,
  Menu,
  X,
  Zap,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useUser } from "@/lib/auth";

const navItems = [
  {
    name: "Home",
    href: "#home",
    icon: Home,
    gradient: "from-purple-500 to-pink-500",
    hoverGradient: "hover:from-purple-600 hover:to-pink-600",
    iconColor: "text-purple-500"
  },
  {
    name: "Features",
    href: "#features",
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-400",
    hoverGradient: "hover:from-blue-600 hover:to-cyan-500",
    iconColor: "text-blue-500"
  },
  {
    name: "Pricing",
    href: "#pricing",
    icon: DollarSign,
    gradient: "from-orange-500 to-red-500",
    hoverGradient: "hover:from-orange-600 hover:to-red-600",
    iconColor: "text-orange-500"
  },
  {
    name: "Contact",
    href: "#contact",
    icon: Mail,
    gradient: "from-green-500 to-emerald-400",
    hoverGradient: "hover:from-green-600 hover:to-emerald-500",
    iconColor: "text-green-500"
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on the dashboard page
  const isDashboard = pathname?.startsWith('/dashboard');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/handler/sign-in');
    }
  };

  const handleSignOut = async () => {
    await user?.signOut();
    router.push('/');
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/ backdrop-blur-xl"
          : "bg-white/ backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
          >
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
              <div className="absolute inset-0 bg-linear-to-br from-purple-600 via-blue-600 to-pink-600 rounded-lg blur-sm opacity-50" />
              <Zap className="w-8 h-8 text-purple-600 relative z-10" strokeWidth={2.5} />
            </motion.div>
            <span className="text-2xl font-bold bg-linear-to-br from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              AI Copywrite
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isDashboard ? (
              // Show Home button on dashboard
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="relative group px-4 py-2 rounded-xl transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.3, 1.3, 1.3, 1],
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Home className="w-5 h-5 text-purple-500 transition-all group-hover:scale-110" strokeWidth={2.5} />
                  </motion.div>
                  <span className="font-semibold bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent transition-all duration-300">
                    Home
                  </span>
                </div>

                {/* Hover underline with gradient */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ) : (
              // Show full navigation on landing page
              navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group px-4 py-2 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      whileHover={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.3, 1.3, 1.3, 1],
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon className={`w-5 h-5 ${item.iconColor} transition-all group-hover:scale-110`} strokeWidth={2.5} />
                    </motion.div>
                    <span className={`font-semibold bg-linear-to-r ${item.gradient} bg-clip-text text-transparent ${item.hoverGradient} transition-all duration-300 group-hover:opacity-0 group-hover:w-0 overflow-hidden whitespace-nowrap`}>
                      {item.name}
                    </span>
                  </div>

                  {/* Hover underline with gradient */}
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r ${item.gradient} rounded-full`}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))
            )}
          </div>

          {/* CTA Button or User Menu - Only show on landing page */}
          {!isDashboard && (
            user ? (
              <div className="hidden md:flex items-center gap-3">
                {/* User Avatar */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.displayName?.[0]?.toUpperCase() || user.primaryEmail?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName || user.primaryEmail?.split("@")[0]}
                  </span>
                </motion.div>

                {/* Sign Out Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl border-2 border-red-200 hover:border-red-400 text-red-600 font-semibold flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </motion.button>
              </div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(147, 51, 234, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="hidden md:block relative px-6 py-2.5 rounded-xl font-semibold text-white overflow-hidden group"
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

                <span className="relative flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Get Started
                </span>
              </motion.button>
            )
          )}

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl bg-linear-to-r from-purple-100 via-blue-100 to-pink-100"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-purple-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6 text-purple-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white/80 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {isDashboard ? (
                // Show Home button on dashboard mobile menu
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    router.push('/');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-white/50 to-white/30 backdrop-blur-sm hover:from-white/70 hover:to-white/50 transition-all"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Home className="w-5 h-5 text-purple-500" strokeWidth={2} />
                  </motion.div>
                  <span className="font-semibold bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Home</span>
                </motion.button>
              ) : (
                // Show full navigation on landing page mobile menu
                navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-linear-to-r from-white/50 to-white/30 backdrop-blur-sm hover:from-white/70 hover:to-white/50 transition-all"
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} strokeWidth={2} />
                    </motion.div>
                    <span className={`font-semibold bg-linear-to-r ${item.gradient} bg-clip-text text-transparent`}>{item.name}</span>
                  </motion.a>
                ))
              )}

              {/* User Menu - Only show on landing page */}
              {!isDashboard && (
                user ? (
                  <>
                    {/* User Info */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: navItems.length * 0.1 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                        {user.displayName?.[0]?.toUpperCase() || user.primaryEmail?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{user.displayName || "User"}</p>
                        <p className="text-xs text-gray-600">{user.primaryEmail}</p>
                      </div>
                    </motion.div>

                    {/* Sign Out Button */}
                    <motion.button
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: (navItems.length + 1) * 0.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSignOut}
                      className="w-full mt-2 px-4 py-3 rounded-xl font-semibold text-red-600 border-2 border-red-200 hover:border-red-400 flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: navItems.length * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGetStarted}
                    className="w-full mt-2 px-4 py-3 rounded-xl font-semibold text-white bg-linear-to-r from-purple-600 via-blue-600 to-pink-600 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </motion.button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.nav>
  );
}
