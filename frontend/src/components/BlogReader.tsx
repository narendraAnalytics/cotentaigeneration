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
import AudioWaveform from "./AudioWaveform";

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
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

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

  /**
   * Convert PCM to WAV format for Windows playback
   */
  const convertPCMToWAV = useCallback((base64PCM: string, sampleRate: number, channels: number): Blob => {
    // Decode base64 to binary
    const pcmData = decodePCMAudio(base64PCM);

    // WAV file header specifications
    const dataSize = pcmData.length;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');                                   // ChunkID
    view.setUint32(4, totalSize - 8, true);                   // ChunkSize
    writeString(8, 'WAVE');                                   // Format
    writeString(12, 'fmt ');                                  // Subchunk1ID
    view.setUint32(16, 16, true);                             // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);                              // AudioFormat (1 for PCM)
    view.setUint16(22, channels, true);                       // NumChannels
    view.setUint32(24, sampleRate, true);                     // SampleRate
    view.setUint32(28, sampleRate * channels * 2, true);      // ByteRate
    view.setUint16(32, channels * 2, true);                   // BlockAlign
    view.setUint16(34, 16, true);                             // BitsPerSample
    writeString(36, 'data');                                  // Subchunk2ID
    view.setUint32(40, dataSize, true);                       // Subchunk2Size

    // Copy PCM data
    const pcmView = new Uint8Array(buffer, headerSize);
    pcmView.set(pcmData);

    return new Blob([buffer], { type: 'audio/wav' });
  }, [decodePCMAudio]);

  const handleDownloadAudio = useCallback(() => {
    if (!blog.audio) return;

    if (blog.audio.format === 'pcm') {
      // Convert PCM to WAV for Windows compatibility
      const wavBlob = convertPCMToWAV(
        blog.audio.audioData,
        24000, // sampleRate
        1      // channels (mono)
      );
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${blog.title.replace(/\s+/g, "-").toLowerCase()}.wav`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // MP3 format - keep original behavior
      const dataUrl = `data:audio/${blog.audio.format};base64,${blog.audio.audioData}`;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${blog.title.replace(/\s+/g, "-").toLowerCase()}.mp3`;
      link.click();
    }
  }, [blog.audio, blog.title, convertPCMToWAV]);

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

  // Detect manual scrolling and disable auto-scroll temporarily
  useEffect(() => {
    const scrollContainer = contentScrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      // User scrolled manually - disable auto-scroll
      setAutoScrollEnabled(false);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Re-enable auto-scroll after 5 seconds of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setAutoScrollEnabled(true);
      }, 5000);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Text highlighting during playback - sentence level
  useEffect(() => {
    const articleElement = document.querySelector('.prose');
    if (!articleElement) return;

    // Get all paragraphs and headings
    const paragraphs = articleElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
    if (paragraphs.length === 0) return;

    // If not playing, remove all highlights
    if (!isPlaying || !blog.audio) {
      paragraphs.forEach((p) => {
        const sentences = p.querySelectorAll('.sentence-highlight');
        sentences.forEach((s) => s.classList.remove('highlighted-text'));
      });
      return;
    }

    // Split all paragraphs into sentences and wrap them
    const allSentences: Array<{ element: HTMLElement; text: string }> = [];

    paragraphs.forEach((paragraph) => {
      const text = paragraph.textContent || '';
      // Split by sentence endings (., !, ?)
      const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

      if (sentences.length > 1) {
        // Wrap each sentence in a span for individual highlighting
        let html = '';
        sentences.forEach((sentence, idx) => {
          html += `<span class="sentence-highlight" data-sentence-id="${allSentences.length + idx}">${sentence}</span> `;
        });
        paragraph.innerHTML = html;

        // Collect wrapped sentence elements
        const wrappedSentences = paragraph.querySelectorAll('.sentence-highlight');
        wrappedSentences.forEach((el) => {
          allSentences.push({
            element: el as HTMLElement,
            text: el.textContent || ''
          });
        });
      } else {
        // Single sentence or heading - wrap entire element
        const wrapper = document.createElement('span');
        wrapper.className = 'sentence-highlight';
        wrapper.setAttribute('data-sentence-id', String(allSentences.length));
        wrapper.textContent = text;
        paragraph.innerHTML = '';
        paragraph.appendChild(wrapper);

        allSentences.push({
          element: wrapper,
          text: text
        });
      }
    });

    if (allSentences.length === 0) return;

    // Calculate estimated duration for each sentence
    const calculateSentenceDuration = (text: string): number => {
      // Count words (base unit)
      const wordCount = text.split(/\s+/).filter(Boolean).length;

      // TTS typically speaks at ~150 words per minute
      const baseSeconds = (wordCount / 150) * 60;

      // Add pause time for punctuation (in seconds)
      const periodPauses = (text.match(/[.!?]/g) || []).length * 0.6;  // 0.6s pause after sentence end
      const commaPauses = (text.match(/[,;:]/g) || []).length * 0.3;   // 0.3s pause after comma
      const totalPauses = periodPauses + commaPauses;

      // Return total estimated time
      return baseSeconds + totalPauses;
    };

    // Calculate total estimated duration for all sentences
    const totalEstimatedDuration = allSentences.reduce((sum, sentence) => {
      return sum + calculateSentenceDuration(sentence.text);
    }, 0);

    // Use actual audio duration for calibration
    const actualDuration = duration || 0;

    // Calculate scaling factor to match actual duration
    // Add 20% buffer to sync highlighting with audio voice
    const scalingFactor = actualDuration > 0
      ? (actualDuration / totalEstimatedDuration) * 1.20
      : 1;

    // Build timing map for each sentence
    let cumulativeTime = 0;
    const timingMap: Array<{ element: HTMLElement; startTime: number; endTime: number }> = [];

    allSentences.forEach((sentence) => {
      const estimatedDuration = calculateSentenceDuration(sentence.text);
      const actualSentenceDuration = estimatedDuration * scalingFactor;

      timingMap.push({
        element: sentence.element,
        startTime: cumulativeTime,
        endTime: cumulativeTime + actualSentenceDuration,
      });

      cumulativeTime += actualSentenceDuration;
    });

    // Find and highlight current sentence
    const currentSentence = timingMap.find(
      (item) => currentTime >= item.startTime && currentTime < item.endTime
    );

    // Remove previous highlights
    allSentences.forEach((s) => s.element.classList.remove('highlighted-text'));

    // Add highlight to current sentence
    if (currentSentence && autoScrollEnabled) {
      currentSentence.element.classList.add('highlighted-text');

      // Auto-scroll only if enabled
      currentSentence.element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else if (currentSentence) {
      // Still highlight even if auto-scroll is disabled
      currentSentence.element.classList.add('highlighted-text');
    }
  }, [isPlaying, currentTime, duration, autoScrollEnabled]);

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
            <h2 className="text-2xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">{blog.title}</h2>
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

              {/* Animated Waveform */}
              <AudioWaveform isPlaying={isPlaying} />

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
        <div ref={contentScrollRef} className="flex-1 overflow-y-auto px-6 py-6">
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
