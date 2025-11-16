import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { EmailRequestSchema } from '../src/types/email.types';
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
 * Entry point for email generation requests
 */
export const config: ApiRouteConfig = {
  name: 'GenerateEmail',
  type: 'api',
  description: 'HTTP endpoint to receive email generation requests',
  path: '/api/generate-email',
  method: 'POST',
  emits: ['enhance-prompt'],
  flows: ['email-generation'],
  bodySchema: EmailRequestSchema,
  responseSchema: {
    202: AcceptedResponseSchema,
    400: ErrorResponseSchema,
    500: ErrorResponseSchema
  }
};

/**
 * API Handler
 * Accepts email generation requests and triggers async processing
 */
export const handler: Handlers['GenerateEmail'] = async (req, { emit, logger }) => {
  try {
    // Generate unique request ID for tracking
    const requestId = randomUUID();

    // Log incoming request
    logger.info('Received email generation request', {
      requestId,
      topic: req.body.topic,
      emailType: req.body.emailType,
      keywords: req.body.keywords,
      targetAudience: req.body.targetAudience
    });

    // Emit event to enhance-prompt topic for async processing
    // Include contentType='email' to route to email flow
    await emit({
      topic: 'enhance-prompt',
      data: {
        requestId,
        contentType: 'email', // KEY: This routes to email flow
        ...req.body
      }
    });

    logger.info('Email request queued for processing', { requestId });

    // Return 202 Accepted - processing will happen asynchronously
    return {
      status: 202,
      body: {
        id: requestId,
        status: 'accepted',
        message: 'Your email generation request has been queued for processing'
      }
    };
  } catch (error) {
    logger.error('Failed to process email generation request', {
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
