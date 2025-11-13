import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { createGeminiTTSService } from '../src/services/gemini/tts.service';

/**
 * Input Schema for TTS Generation Event Step
 * Receives request ID after blog content is generated
 */
const GenerateTTSInputSchema = z.object({
  requestId: z.string()
});

/**
 * Event Step Configuration
 * Generates text-to-speech audio from blog content
 */
export const config: EventConfig = {
  name: 'GenerateTTS',
  type: 'event',
  description: 'Generate text-to-speech audio from blog content using Gemini TTS',
  subscribes: ['generate-tts'],
  emits: [], // End of the workflow chain
  input: GenerateTTSInputSchema,
  flows: ['content-generation']
};

/**
 * Event Handler
 * Fetches blog content from state and generates TTS audio
 */
export const handler: Handlers['GenerateTTS'] = async (input, { logger, state }) => {
  const { requestId } = input;

  try {
    logger.info('Starting TTS generation', { requestId });

    // Fetch the blog content from state
    const blogData = await state.get<any>('blog', requestId);

    if (!blogData) {
      logger.error('Blog content not found in state', { requestId });
      throw new Error(`Blog content not found for request ID: ${requestId}`);
    }

    if (!blogData.article) {
      logger.error('Blog article is missing from stored data', { requestId });
      throw new Error('Blog article data is incomplete');
    }

    logger.info('Blog content retrieved, generating TTS', {
      requestId,
      title: blogData.article.title,
      sectionCount: blogData.article.sections?.length || 0
    });

    // Initialize Gemini TTS Service
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const ttsService = createGeminiTTSService(apiKey);

    // Generate speech from the blog article
    const ttsResult = await ttsService.generateSpeechFromArticle(blogData.article);

    logger.info('TTS audio generated successfully', {
      requestId,
      audioDataLength: ttsResult.audioData.length,
      format: ttsResult.format,
      sampleRate: ttsResult.sampleRate
    });

    // Store TTS result in state
    await state.set('tts', requestId, {
      requestId,
      audioData: ttsResult.audioData,
      format: ttsResult.format,
      sampleRate: ttsResult.sampleRate,
      channels: ttsResult.channels,
      generatedAt: new Date().toISOString(),
      articleTitle: blogData.article.title
    });

    logger.info('TTS audio stored in state', {
      requestId,
      stateKey: `tts:${requestId}`
    });

  } catch (error) {
    logger.error('Failed to generate TTS audio', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Store error state for debugging
    await state.set('tts', requestId, {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'failed',
      generatedAt: new Date().toISOString()
    });

    // DON'T throw - let the blog generation succeed even if TTS fails
    // The user can still read the blog, just without audio
    logger.warn('TTS generation failed, but blog content is still available', {
      requestId
    });
  }
};
