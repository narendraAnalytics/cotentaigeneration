import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { ContentRequestSchema } from '../src/types/content.types';
import { randomUUID } from 'crypto';

/**
 * Response schemas for the API endpoint
 */
const AcceptedResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  message: z.string()
});

const ErrorResponseSchema = z.object({
  error: z.string()
});

/**
 * API Step Configuration
 * Entry point for blog content generation requests
 */
export const config: ApiRouteConfig = {
  name: 'GenerateContent',
  type: 'api',
  description: 'HTTP endpoint to receive blog generation requests',
  path: '/api/generate-content',
  method: 'POST',
  emits: ['enhance-prompt'],
  flows: ['content-generation'],
  bodySchema: ContentRequestSchema,
  responseSchema: {
    202: AcceptedResponseSchema,
    400: ErrorResponseSchema,
    500: ErrorResponseSchema
  }
};

/**
 * API Handler
 * Accepts blog generation requests and triggers async processing
 */
export const handler: Handlers['GenerateContent'] = async (req, { emit, logger }) => {
  try {
    // Generate unique request ID for tracking
    const requestId = randomUUID();

    // Log incoming request
    logger.info('Received blog generation request', {
      requestId,
      topic: req.body.topic,
      keywords: req.body.keywords,
      targetAudience: req.body.targetAudience
    });

    // Emit event to enhance-prompt topic for async processing
    await emit({
      topic: 'enhance-prompt',
      data: {
        requestId,
        ...req.body
      }
    });

    logger.info('Request queued for processing', { requestId });

    // Return 202 Accepted - processing will happen asynchronously
    return {
      status: 202,
      body: {
        id: requestId,
        status: 'accepted',
        message: 'Your content generation request has been queued for processing'
      }
    };
  } catch (error) {
    logger.error('Failed to process content generation request', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      status: 500,
      body: {
        error: 'Failed to process request. Please try again later.'
      }
    };
  }
};
