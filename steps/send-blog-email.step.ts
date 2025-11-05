import { ApiRouteConfig } from 'motia';
import type { ApiRouteHandler } from 'motia';
import { z } from 'zod';
import { createResendEmailService } from '../src/services/email/resend.service';

/**
 * Request schema for sending blog email
 */
const SendEmailRequestSchema = z.object({
  requestId: z.string().uuid().describe('The ID of the generated blog article'),
  email: z.string().email().describe('Valid email address to send the blog to')
});

/**
 * Response schemas
 */
const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  messageId: z.string().optional()
});

const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string()
});

/**
 * API Step Configuration
 * Send generated blog article via email
 */
export const config: ApiRouteConfig = {
  name: 'SendBlogEmail',
  type: 'api',
  description: 'Send a generated blog article to the specified email address',
  path: '/api/send-blog-email',
  method: 'POST',
  emits: [],
  flows: ['content-generation'],
  bodySchema: SendEmailRequestSchema,
  responseSchema: {
    200: SuccessResponseSchema,
    404: ErrorResponseSchema,
    400: ErrorResponseSchema,
    500: ErrorResponseSchema
  }
};

/**
 * API Handler
 * Retrieves blog from state and sends via email
 */
export const handler: ApiRouteHandler = async (req, { logger, state }) => {
  const { requestId, email } = req.body as z.infer<typeof SendEmailRequestSchema>;

  try {
    logger.info('Sending blog article via email', { requestId, email });

    // Get the stored article from state
    const blogData = await state.get<any>('blog', requestId);

    if (!blogData) {
      logger.warn('Blog article not found', { requestId });
      return {
        status: 404,
        body: {
          success: false,
          error: `No blog article found for request ID: ${requestId}. The article may still be generating, or the ID is invalid.`
        }
      };
    }

    // Validate that article exists
    if (!blogData.article) {
      logger.error('Blog data found but article is missing', { requestId });
      return {
        status: 500,
        body: {
          success: false,
          error: 'Article data is incomplete or corrupted.'
        }
      };
    }

    // Initialize Resend email service
    const emailService = createResendEmailService();

    // Send email
    logger.info('Sending email via Resend', { requestId, email, title: blogData.article.title });

    const result = await emailService.sendBlogArticle(email, blogData.article);

    if (!result.success) {
      logger.error('Failed to send email', { requestId, email, error: result.error });
      return {
        status: 500,
        body: {
          success: false,
          error: `Failed to send email: ${result.error}`
        }
      };
    }

    logger.info('Email sent successfully', {
      requestId,
      email,
      messageId: result.messageId,
      title: blogData.article.title
    });

    return {
      status: 200,
      body: {
        success: true,
        message: `Blog article "${blogData.article.title}" has been sent to ${email}`,
        messageId: result.messageId
      }
    };

  } catch (error) {
    logger.error('Failed to send blog email', {
      requestId,
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      status: 500,
      body: {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email. Please try again later.'
      }
    };
  }
};
