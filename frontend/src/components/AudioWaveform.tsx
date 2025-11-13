"use client";

import { motion } from "framer-motion";

interface AudioWaveformProps {
  isPlaying: boolean;
}

export default function AudioWaveform({ isPlaying }: AudioWaveformProps) {
  const bars = [
    { delay: 0, height: [12, 24, 12] },
    { delay: 0.1, height: [20, 32, 20] },
    { delay: 0.2, height: [16, 28, 16] },
    { delay: 0.15, height: [24, 36, 24] },
    { delay: 0.05, height: [14, 26, 14] },
  ];

  return (
    <div className="flex items-center gap-1 h-10 px-2">
      {bars.map((bar, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full bg-gradient-to-t from-purple-600 via-pink-600 to-orange-500"
          animate={
            isPlaying
              ? {
                  height: bar.height,
                  transition: {
                    repeat: Infinity,
                    duration: 0.8,
                    ease: "easeInOut",
                    delay: bar.delay,
                  },
                }
              : { height: 12 }
          }
          style={{ height: 12 }}
        />
      ))}
    </div>
  );
}
