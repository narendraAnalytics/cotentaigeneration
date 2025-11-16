import { z } from 'zod';

/**
 * Email Type Enum
 * Different types of emails that can be generated
 */
export const EmailTypeSchema = z.enum([
  'marketing',      // Promotional offers, product launches
  'cold-outreach',  // Business development, partnerships
  'newsletter',     // Regular updates, curated content
  'follow-up'       // Meeting follow-ups, application follow-ups
]);

export type EmailType = z.infer<typeof EmailTypeSchema>;

/**
 * Email Tone Enum
 * Tone options for email generation
 */
export const EmailToneSchema = z.enum([
  'professional',
  'casual',
  'formal',
  'friendly'
]);

export type EmailTone = z.infer<typeof EmailToneSchema>;

/**
 * Email Generation Request Schema
 * Input schema for requesting email generation
 */
export const EmailRequestSchema = z.object({
  topic: z.string().min(3).max(500).describe('The main topic or purpose of the email'),

  emailType: EmailTypeSchema.describe('Type of email to generate'),

  keywords: z.array(z.string()).min(1).max(10).describe('Keywords to include'),

  targetAudience: z.string().optional().describe('Who is the target audience?'),

  additionalContext: z.string().optional().describe('Additional context or specific requirements'),

  tone: EmailToneSchema.default('professional').describe('Tone of the email')
});

export type EmailRequest = z.infer<typeof EmailRequestSchema>;

/**
 * Email Content Schema
 * Structure of a generated email
 */
export const EmailContentSchema = z.object({
  subject: z.string().min(5).max(200).describe('Primary subject line'),

  subjectAlternatives: z.array(z.string()).min(2).max(5).describe('Alternative subject line options'),

  body: z.string().min(50).describe('Email body content'),

  callToAction: z.string().optional().describe('Clear call-to-action'),

  metadata: z.object({
    emailType: EmailTypeSchema,
    estimatedReadTime: z.string().optional(),
    tone: EmailToneSchema,
    keywords: z.array(z.string())
  })
});

export type EmailContent = z.infer<typeof EmailContentSchema>;

/**
 * Email Response Schema
 * Response when retrieving generated email
 */
export const EmailResponseSchema = z.object({
  id: z.string().describe('Request ID'),

  status: z.enum(['completed', 'generating', 'failed']),

  subject: z.string(),

  subjectAlternatives: z.array(z.string()),

  body: z.string(),

  emailType: EmailTypeSchema,

  callToAction: z.string().optional(),

  metadata: z.object({
    emailType: EmailTypeSchema,
    estimatedReadTime: z.string().optional(),
    tone: EmailToneSchema,
    keywords: z.array(z.string())
  }),

  generatedAt: z.string()
});

export type EmailResponse = z.infer<typeof EmailResponseSchema>;
