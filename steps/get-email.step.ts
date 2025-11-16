import { ApiRouteConfig } from 'motia';
import type { ApiRouteHandler } from 'motia';
import { z } from 'zod';
import { EmailResponseSchema } from '../src/types/email.types';

/**
 * Response schemas for the GET endpoint
 */
const NotFoundResponseSchema = z.object({
  error: z.string(),
  message: z.string()
});

const ErrorResponseSchema = z.object({
  error: z.string()
});

/**
 * API Step Configuration
 * Retrieve generated email content by request ID
 */
export const config: ApiRouteConfig = {
  name: 'GetEmail',
  type: 'api',
  description: 'Retrieve generated email content by request ID',
  path: '/api/email/:id',
  method: 'GET',
  emits: [],
  virtualSubscribes: ['generate-content-with-search'], // Visual connection - shows this endpoint is called after email generation
  flows: ['email-generation'],
  responseSchema: {
    200: EmailResponseSchema,
    404: NotFoundResponseSchema,
    500: ErrorResponseSchema
  }
};

/**
 * API Handler
 * Retrieves email content from state storage
 */
export const handler: ApiRouteHandler = async (req, { logger, state }) => {
  const { id } = req.pathParams;

  try {
    logger.info('Retrieving email content', { requestId: id });

    // Get the stored email from state
    const result = await state.get<any>('email', id);

    if (!result) {
      logger.warn('Email content not found', { requestId: id });
      return {
        status: 404,
        body: {
          error: 'Not Found',
          message: `No email content found for request ID: ${id}. It may still be generating, or the ID is invalid.`
        }
      };
    }

    // Check if email generation failed
    if (result.status === 'failed') {
      logger.error('Email generation failed', {
        requestId: id,
        error: result.error
      });
      return {
        status: 500,
        body: {
          error: `Email generation failed: ${result.error}`
        }
      };
    }

    logger.info('Email content retrieved successfully', {
      requestId: id,
      status: result.status,
      subject: result.subject
    });

    return {
      status: 200,
      body: result
    };
  } catch (error) {
    logger.error('Failed to retrieve email content', {
      requestId: id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      status: 500,
      body: {
        error: 'Failed to retrieve email content. Please try again later.'
      }
    };
  }
};
