audioUtils.ts

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
  numChannels: number,
): Promise<AudioBuffer> {
  // The API returns raw PCM data. We need to convert it from Int16 to Float32.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize the Int16 value to the Float32 range [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;



geminiservice.ts



import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateBlogPost(topic: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a compelling and informative blog post about "${topic}". The post should be well-structured, engaging, and at least 300 words long. Use clear paragraphs.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating blog post:", error);
    throw new Error("Failed to communicate with the Gemini API for text generation.");
  }
}


export async function generateSpeech(text: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              // Other available voices: Puck, Charon, Zephyr, Fenrir
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    } else {
      throw new Error("No audio data received from the API.");
    }
  } catch (error) {
    console.error("Error generating speech:", error);
    throw new Error("Failed to communicate with the Gemini API for speech generation.");
  }
}


metadata.json

{
  "name": "AI Blog & Voice Generator",
  "description": "Generate a blog post on any topic using AI, then listen to it with a realistic text-to-speech voice. An example of Gemini's text and audio generation capabilities.",
  "requestFramePermissions": []
}


index.tsx


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


index.html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Blog & Voice Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
  <script type="importmap">
{
  "imports": {
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.29.0"
  }
}
</script>
</head>
  <body class="bg-gray-900">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>



app.tsx


import React, { useState, useRef } from 'react';
import { generateBlogPost, generateSpeech } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';
import { SparklesIcon, VolumeUpIcon, LoadingSpinner, DocumentTextIcon } from './components/Icons';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [blogPost, setBlogPost] = useState<string | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState<boolean>(false);
  const [isLoadingSpeech, setIsLoadingSpeech] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleGeneratePost = async () => {
    if (!topic.trim() || isLoadingPost) return;

    setIsLoadingPost(true);
    setError(null);
    setBlogPost(null);

    try {
      const post = await generateBlogPost(topic);
      setBlogPost(post);
    } catch (err) {
      setError('Failed to generate blog post. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handleGenerateSpeech = async () => {
    if (!blogPost || isLoadingSpeech) return;

    setIsLoadingSpeech(true);
    setError(null);

    try {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioContext = audioContextRef.current;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const base64Audio = await generateSpeech(blogPost);
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();

      audioSourceRef.current = source;
      source.onended = () => {
        audioSourceRef.current = null;
      };

    } catch (err) {
      setError('Failed to generate audio. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingSpeech(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            AI Blog & Voice Generator
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Bring your ideas to life with AI-generated articles and audio.
          </p>
        </header>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl shadow-indigo-900/20 border border-gray-700">
            <label htmlFor="topic" className="block text-lg font-medium text-gray-300 mb-2">
              Enter a Blog Topic
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The future of renewable energy..."
              className="w-full h-24 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
              disabled={isLoadingPost}
            />
            <button
              onClick={handleGeneratePost}
              disabled={!topic.trim() || isLoadingPost}
              className="mt-4 w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-200"
            >
              {isLoadingPost ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="mr-2" />
                  Generate Blog Post
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div className="mt-8">
            {isLoadingPost && (
               <div className="flex flex-col items-center justify-center bg-gray-800/50 rounded-xl p-8 border border-gray-700">
                  <LoadingSpinner className="w-8 h-8"/>
                  <p className="mt-4 text-gray-400">Crafting your blog post...</p>
               </div>
            )}
            {blogPost && (
              <article className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl shadow-indigo-900/20 border border-gray-700">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-100 flex items-center">
                    <DocumentTextIcon className="mr-3 text-indigo-400" />
                    Your Generated Blog Post
                  </h2>
                  <button
                    onClick={handleGenerateSpeech}
                    disabled={isLoadingSpeech}
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-all"
                  >
                    {isLoadingSpeech ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Generating Audio
                      </>
                    ) : (
                      <>
                        <VolumeUpIcon className="mr-2" />
                        Listen to Post
                      </>
                    )}
                  </button>
                </div>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
                  {blogPost.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </article>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

