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
  audioData: string; // Base64 encoded audio
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
   * Generate speech from text using Gemini TTS
   * @param text The text to convert to speech
   * @returns Base64 encoded audio data
   */
  async generateSpeech(text: string): Promise<TTSResult> {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
      }

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

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (!audioData) {
        throw new Error('No audio data received from the Gemini TTS API');
      }

      return {
        audioData,
        format: 'pcm',
        sampleRate: 24000,
        channels: 1,
      };
    } catch (error) {
      throw new Error(
        `Gemini TTS API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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
