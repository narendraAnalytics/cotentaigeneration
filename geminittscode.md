gemini.ts 

------------
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateBlogPost(topic: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a compelling and informative blog post about "${topic}". The post should be well-structured, engaging for a general audience, and approximately 400-500 words long.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating blog post:", error);
    throw new Error("Failed to generate blog post. Please try again.");
  }
}

export async function generateSpeech(text: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
      throw new Error("No audio data received from the API.");
    }
    return audioData;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to synthesize audio. Please try again.");
  }
}
------------


audio.ts

--------------

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  // The API returns raw PCM data. We need to convert it into a format that Web Audio API can use.
  // The data is signed 16-bit PCM, little-endian.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize the 16-bit PCM data to the range [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }

  ---------------

  app.tsx


  import React, { useState, useCallback, useRef } from 'react';
import { generateBlogPost, generateSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audio';
import { PlayIcon, StopIcon, SparklesIcon, LoadingSpinnerIcon } from './components/icons';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [blogContent, setBlogContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleStopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);
  
  const handlePlayAudio = useCallback(async () => {
    if (!audioData) return;

    if (isPlaying) {
      handleStopAudio();
      return;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioBuffer = await decodeAudioData(
        decode(audioData),
        audioContextRef.current,
        24000,
        1
      );
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
      };
      source.start();
      
      audioSourceRef.current = source;
      setIsPlaying(true);
    } catch (e) {
      console.error('Error playing audio:', e);
      setError('Failed to play audio. The data might be corrupted.');
    }
  }, [audioData, isPlaying, handleStopAudio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || isLoading) return;

    setIsLoading(true);
    setError(null);
    setBlogContent('');
    setAudioData(null);
    handleStopAudio();

    try {
      setLoadingStep('Crafting the perfect blog post...');
      const content = await generateBlogPost(topic);
      setBlogContent(content);

      setLoadingStep('Synthesizing audio with a nice voice...');
      const speechData = await generateSpeech(content);
      setAudioData(speechData);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            AI Blog Post Generator
          </h1>
          <p className="mt-2 text-lg text-gray-400">Enter a topic and let Gemini create a post and read it to you!</p>
        </header>

        <main>
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'The Future of Renewable Energy'"
                className="w-full pl-4 pr-32 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !topic}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-[calc(100%-1rem)] px-4 flex items-center justify-center font-semibold bg-indigo-600 rounded-md text-white hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {isLoading ? (
                  <LoadingSpinnerIcon className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </form>

          {isLoading && (
            <div className="text-center p-8 bg-gray-800 rounded-lg">
              <div className="flex justify-center items-center mb-4">
                <LoadingSpinnerIcon className="animate-spin h-8 w-8 text-indigo-400" />
              </div>
              <p className="text-lg text-gray-300">{loadingStep}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {blogContent && !isLoading && (
            <article className="prose prose-invert max-w-none bg-gray-800 rounded-lg p-6 sm:p-8 shadow-lg transition-opacity duration-500 animate-fade-in">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-gray-100 mb-0">
                  {topic.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h2>
                {audioData && (
                  <button 
                    onClick={handlePlayAudio}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-300"
                  >
                    {isPlaying ? <StopIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                    <span className="font-semibold">{isPlaying ? 'Stop' : 'Listen'}</span>
                  </button>
                )}
              </div>
              <div className="text-gray-300 whitespace-pre-wrap">{blogContent}</div>
            </article>
          )}

        </main>
      </div>
    </div>
  );
};

export default App;
