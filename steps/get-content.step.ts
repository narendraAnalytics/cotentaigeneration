import { ApiRouteConfig } from 'motia';
import type { ApiRouteHandler } from 'motia';
import { z } from 'zod';

/**
 * Response schemas for the GET endpoint
 */
const SuccessResponseSchema = z.object({
  id: z.string(),
  article: z.any(),
  status: z.string(),
  generatedAt: z.string(),
  fullContent: z.string(),
  audio: z.object({
    audioData: z.string(),
    format: z.string(),
    sampleRate: z.number(),
    channels: z.number(),
    generatedAt: z.string()
  }).optional()
});

type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

const NotFoundResponseSchema = z.object({
  error: z.string(),
  message: z.string()
});

const ErrorResponseSchema = z.object({
  error: z.string()
});

/**
 * API Step Configuration
 * Retrieve generated blog content by request ID
 */
export const config: ApiRouteConfig = {
  name: 'GetContent',
  type: 'api',
  description: 'Retrieve generated blog content by request ID',
  path: '/api/content/:id',
  method: 'GET',
  emits: [],
  virtualSubscribes: ['generate-content-with-search'], // Visual connection in diagram - shows this endpoint is called after content generation
  flows: ['content-generation'],
  responseSchema: {
    200: SuccessResponseSchema,
    404: NotFoundResponseSchema,
    500: ErrorResponseSchema
  }
};

/**
 * API Handler
 * Retrieves blog content from state storage
 */
export const handler: ApiRouteHandler = async (req, { logger, state }) => {
  const { id } = req.pathParams;

  try {
    logger.info('Retrieving blog content', { requestId: id });

    // Get the stored article from state
    const result = await state.get<SuccessResponse>('blog', id);

    if (!result) {
      logger.warn('Blog content not found', { requestId: id });
      return {
        status: 404,
        body: {
          error: 'Not Found',
          message: `No blog content found for request ID: ${id}. It may still be generating, or the ID is invalid.`
        }
      };
    }

    // Try to get TTS audio data if available
    const ttsData = await state.get<any>('tts', id);

    // Include audio data in response if available and not an error
    if (ttsData && !ttsData.error && ttsData.audioData) {
      logger.info('TTS audio data found, including in response', {
        requestId: id,
        audioDataLength: ttsData.audioData.length
      });

      (result as any).audio = {
        audioData: ttsData.audioData,
        format: ttsData.format,
        sampleRate: ttsData.sampleRate,
        channels: ttsData.channels,
        generatedAt: ttsData.generatedAt
      };
    } else if (ttsData?.error) {
      logger.warn('TTS generation failed for this article', {
        requestId: id,
        error: ttsData.error
      });
    } else {
      logger.info('TTS audio not yet available', { requestId: id });
    }

    logger.info('Blog content retrieved successfully', {
      requestId: id,
      status: result.status,
      hasAudio: !!(result as any).audio
    });

    return {
      status: 200,
      body: result
    };
  } catch (error) {
    logger.error('Failed to retrieve blog content', {
      requestId: id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      status: 500,
      body: {
        error: 'Failed to retrieve content. Please try again later.'
      }
    };
  }
};
