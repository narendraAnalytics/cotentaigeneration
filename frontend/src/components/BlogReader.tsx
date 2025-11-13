"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Download,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface BlogReaderProps {
  blog: {
    title: string;
    content: string;
    description?: string;
    tone?: string;
    audience?: string;
    audio?: {
      audioData: string;
      format: string;
    };
  };
  onClose: () => void;
}

export default function BlogReader({ blog, onClose }: BlogReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Determine if we should use Web Audio API (for PCM) or HTML5 Audio (for MP3)
  const isPCMFormat = blog.audio?.format === 'pcm';

  // Create data URL for MP3 audio (only used for MP3 format)
  const audioUrl = blog.audio && !isPCMFormat
    ? `data:audio/mp3;base64,${blog.audio.audioData}`
    : null;

  /**
   * Decode base64 PCM audio data
   */
  const decodePCMAudio = useCallback((base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }, []);

  /**
   * Convert PCM data to AudioBuffer
   */
  const createAudioBuffer = useCallback(
    async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
      // The API returns signed 16-bit PCM, little-endian
      const dataInt16 = new Int16Array(data.buffer);
      const frameCount = dataInt16.length / 1; // mono audio
      const buffer = ctx.createBuffer(1, frameCount, 24000);

      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        // Normalize the 16-bit PCM data to the range [-1.0, 1.0]
        channelData[i] = dataInt16[i] / 32768.0;
      }

      return buffer;
    },
    []
  );

  /**
   * Stop PCM audio playback
   */
  const stopPCMAudio = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  /**
   * Play PCM audio using Web Audio API
   */
  const playPCMAudio = useCallback(async () => {
    if (!blog.audio || !isPCMFormat) return;

    try {
      // Stop any existing playback
      stopPCMAudio();

      // Initialize AudioContext if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      // Decode and create audio buffer
      const pcmData = decodePCMAudio(blog.audio.audioData);
      const audioBuffer = await createAudioBuffer(pcmData, audioContextRef.current);

      // Create and configure audio source
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      // Handle playback end
      source.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        audioSourceRef.current = null;
      };

      // Start playback
      const offset = pauseTimeRef.current;
      source.start(0, offset);
      startTimeRef.current = audioContextRef.current.currentTime - offset;

      audioSourceRef.current = source;
      setDuration(audioBuffer.duration);
      setIsPlaying(true);

      // Update current time during playback
      const updateTime = () => {
        if (audioContextRef.current && audioSourceRef.current) {
          const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
          setCurrentTime(elapsed);
          if (elapsed < audioBuffer.duration) {
            requestAnimationFrame(updateTime);
          }
        }
      };
      updateTime();
    } catch (error) {
      console.error("Error playing PCM audio:", error);
      alert("Failed to play audio. Please try again.");
    }
  }, [blog.audio, isPCMFormat, decodePCMAudio, createAudioBuffer, stopPCMAudio]);

  /**
   * Pause PCM audio
   */
  const pausePCMAudio = useCallback(() => {
    if (audioContextRef.current && audioSourceRef.current) {
      pauseTimeRef.current = currentTime;
      stopPCMAudio();
    }
  }, [currentTime, stopPCMAudio]);

  /**
   * Handle play/pause for both PCM and MP3
   */
  const handlePlayPause = useCallback(() => {
    if (isPCMFormat) {
      // PCM audio - use Web Audio API
      if (isPlaying) {
        pausePCMAudio();
      } else {
        playPCMAudio();
      }
    } else {
      // MP3 audio - use HTML5 audio element
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPCMFormat, isPlaying, playPCMAudio, pausePCMAudio]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);

    if (isPCMFormat) {
      // For PCM, restart playback from the new position
      pauseTimeRef.current = time;
      if (isPlaying) {
        stopPCMAudio();
        playPCMAudio();
      } else {
        setCurrentTime(time);
      }
    } else {
      // For MP3, use the HTML5 audio element
      if (!audioRef.current) return;
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [isPCMFormat, isPlaying, stopPCMAudio, playPCMAudio]);

  const handleSkipBackward = useCallback(() => {
    if (isPCMFormat) {
      // For PCM, we need to restart playback from the new position
      pauseTimeRef.current = Math.max(0, currentTime - 10);
      if (isPlaying) {
        stopPCMAudio();
        playPCMAudio();
      } else {
        setCurrentTime(pauseTimeRef.current);
      }
    } else {
      // For MP3, use the HTML5 audio element
      if (!audioRef.current) return;
      audioRef.current.currentTime = Math.max(0, currentTime - 10);
    }
  }, [isPCMFormat, currentTime, isPlaying, stopPCMAudio, playPCMAudio]);

  const handleSkipForward = useCallback(() => {
    if (isPCMFormat) {
      // For PCM, we need to restart playback from the new position
      pauseTimeRef.current = Math.min(duration, currentTime + 10);
      if (isPlaying) {
        stopPCMAudio();
        playPCMAudio();
      } else {
        setCurrentTime(pauseTimeRef.current);
      }
    } else {
      // For MP3, use the HTML5 audio element
      if (!audioRef.current) return;
      audioRef.current.currentTime = Math.min(duration, currentTime + 10);
    }
  }, [isPCMFormat, duration, currentTime, isPlaying, stopPCMAudio, playPCMAudio]);

  const handleMuteToggle = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDownloadAudio = useCallback(() => {
    if (!blog.audio) return;

    const dataUrl = `data:audio/${blog.audio.format};base64,${blog.audio.audioData}`;
    const link = document.createElement("a");
    link.href = dataUrl;
    const extension = blog.audio.format === 'pcm' ? 'pcm' : 'mp3';
    link.download = `${blog.title.replace(/\s+/g, "-").toLowerCase()}.${extension}`;
    link.click();
  }, [blog.audio, blog.title]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-play audio when component mounts (if audio is available)
  useEffect(() => {
    if (blog.audio && isPCMFormat) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        playPCMAudio();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{blog.title}</h2>
            {blog.description && (
              <p className="text-sm text-gray-600 mt-1">{blog.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
            aria-label="Close blog reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Player (if available) */}
        {blog.audio && (
          <div className="bg-linear-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            {/* Hidden audio element (only for MP3) */}
            {!isPCMFormat && audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />
            )}

            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>

              {/* Skip Backward */}
              <button
                onClick={handleSkipBackward}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                aria-label="Skip backward 10 seconds"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              {/* Progress Bar */}
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  aria-label="Audio progress"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Skip Forward */}
              <button
                onClick={handleSkipForward}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                aria-label="Skip forward 10 seconds"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Mute Button */}
              <button
                onClick={handleMuteToggle}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownloadAudio}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                title="Download MP3 audio"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Blog Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <article className="prose prose-lg max-w-none">
            <ReactMarkdown>{blog.content}</ReactMarkdown>
          </article>
        </div>

        {/* Footer Meta */}
        {(blog.tone || blog.audience) && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
            <div className="flex gap-4 text-sm text-gray-600">
              {blog.tone && (
                <div>
                  <span className="font-semibold">Tone:</span> {blog.tone}
                </div>
              )}
              {blog.audience && (
                <div>
                  <span className="font-semibold">Audience:</span> {blog.audience}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
