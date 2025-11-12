import { GoogleGenAI, Modality } from '@google/genai';

/**
 * TTS Service Configuration
 */
interface TTSServiceConfig {
  apiKey: string;
  model?: string;
  voiceName?: string;
}

/**
 * TTS Generation Result
 */
export interface TTSResult {
  audioData: string; // Base64 encoded PCM audio
  format: 'pcm';
  sampleRate: 24000;
  channels: 1;
}

/**
 * Gemini TTS Service
 * Handles text-to-speech generation using Gemini TTS API
 */
export class GeminiTTSService {
  private ai: GoogleGenAI;
  private model: string;
  private voiceName: string;

  constructor(config: TTSServiceConfig) {
    if (!config.apiKey) {
      throw new Error('GEMINI_API_KEY is required for TTS service');
    }

    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model || 'gemini-2.5-flash-preview-tts';
    this.voiceName = config.voiceName || 'Kore';
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate speech from text using Gemini TTS
   * Includes retry logic with exponential backoff for rate limit errors
   * @param text The text to convert to speech
   * @returns Base64 encoded PCM audio data
   */
  async generateSpeech(text: string, maxRetries: number = 3): Promise<TTSResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: [{ parts: [{ text }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: this.voiceName },
              },
            },
          },
        });

        const pcmAudioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!pcmAudioData) {
          throw new Error('No audio data received from the Gemini TTS API');
        }

        // Return raw PCM data directly (no conversion needed)
        return {
          audioData: pcmAudioData,
          format: 'pcm',
          sampleRate: 24000,
          channels: 1,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        const errorMessage = lastError.message.toLowerCase();

        // Check if it's a rate limit or overload error
        const isRateLimitError =
          errorMessage.includes('overloaded') ||
          errorMessage.includes('rate limit') ||
          errorMessage.includes('503') ||
          errorMessage.includes('service unavailable');

        if (isRateLimitError && attempt < maxRetries) {
          // Exponential backoff: 2s, 4s, 8s
          const delayMs = Math.pow(2, attempt) * 1000;
          console.warn(
            `TTS API rate limit hit (attempt ${attempt}/${maxRetries}). Retrying in ${delayMs}ms...`
          );
          await this.sleep(delayMs);
          continue;
        }

        // If not a rate limit error or we're out of retries, throw
        throw new Error(
          `Gemini TTS API error: ${lastError.message} (failed after ${attempt} attempts)`
        );
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Unknown error in TTS generation');
  }

  /**
   * Generate speech from blog article
   * Concatenates title, introduction, sections, and conclusion
   */
  async generateSpeechFromArticle(article: {
    title: string;
    introduction?: string;
    sections: Array<{ heading: string; content: string }>;
    conclusion?: string;
  }): Promise<TTSResult> {
    // Build complete text from article structure
    let fullText = `${article.title}\n\n`;

    if (article.introduction) {
      fullText += `${article.introduction}\n\n`;
    }

    for (const section of article.sections) {
      fullText += `${section.heading}\n${section.content}\n\n`;
    }

    if (article.conclusion) {
      fullText += `${article.conclusion}`;
    }

    return this.generateSpeech(fullText);
  }
}

/**
 * Factory function to create a GeminiTTSService instance
 */
export function createGeminiTTSService(apiKey?: string, voiceName?: string): GeminiTTSService {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  return new GeminiTTSService({
    apiKey: key,
    voiceName,
  });
}
