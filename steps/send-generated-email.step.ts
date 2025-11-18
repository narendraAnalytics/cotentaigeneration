import { ApiRouteConfig } from 'motia';
import type { ApiRouteHandler } from 'motia';
import {
  SendGeneratedEmailRequestSchema,
  SendEmailResponseSchema,
  SendEmailErrorResponseSchema
} from '../src/types/email.types';
import { createResendEmailService } from '../src/services/email/resend.service';
import type { z } from 'zod';

/**
 * API Step Configuration
 * Send generated email to any recipient via Resend
 */
export const config: ApiRouteConfig = {
  name: 'SendGeneratedEmail',
  type: 'api',
  description: 'Send a generated email to any specified email address via Resend',
  path: '/api/send-generated-email',
  method: 'POST',
  emits: [],
  flows: ['content-generation'],
  bodySchema: SendGeneratedEmailRequestSchema,
  responseSchema: {
    200: SendEmailResponseSchema,
    404: SendEmailErrorResponseSchema,
    400: SendEmailErrorResponseSchema,
    500: SendEmailErrorResponseSchema
  }
};

/**
 * API Handler
 * Sends email using content provided directly from the frontend
 * (No longer depends on Motia state - content comes from database via frontend)
 */
export const handler: ApiRouteHandler = async (req, { logger }) => {
  const { requestId, recipientEmail, subjectLine, fromName, body, htmlBody } = req.body as z.infer<typeof SendGeneratedEmailRequestSchema>;

  try {
    logger.info('Sending generated email via Resend', { requestId, recipientEmail, subjectLine, hasHtml: !!htmlBody });

    // Validate that email content exists (now from request body, not state)
    if (!body) {
      logger.error('Email body is missing from request', { requestId });
      return {
        status: 400,
        body: {
          success: false,
          error: 'Email body is required.'
        }
      };
    }

    // Initialize Resend email service
    const emailService = createResendEmailService();

    // Send email using the new sendGeneratedEmail method
    logger.info('Sending email via Resend', {
      requestId,
      recipientEmail,
      subject: subjectLine,
      fromName: fromName || 'default',
      bodyLength: body.length,
      htmlBodyLength: htmlBody?.length || 0
    });

    const result = await emailService.sendGeneratedEmail({
      toEmail: recipientEmail,
      subject: subjectLine,
      htmlBody: htmlBody || `<pre>${body}</pre>`, // Use HTML if provided, otherwise wrap plain text in <pre>
      textBody: body,
      fromName
    });

    if (!result.success) {
      logger.error('Failed to send email', { requestId, recipientEmail, error: result.error });
      return {
        status: 500,
        body: {
          success: false,
          // Pass through the original error message from Resend (includes testing limitation details)
          error: result.error || 'Failed to send email. Please try again.'
        }
      };
    }

    logger.info('Email sent successfully', {
      requestId,
      recipientEmail,
      messageId: result.messageId,
      subject: subjectLine
    });

    return {
      status: 200,
      body: {
        success: true,
        message: `Email "${subjectLine}" has been sent to ${recipientEmail}`,
        messageId: result.messageId
      }
    };

  } catch (error) {
    logger.error('Failed to send generated email', {
      requestId,
      recipientEmail,
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
