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
 * Industry Type Enum (NEW - Optional Enhancement)
 * Industry-specific language and tone optimization
 */
export const IndustryTypeSchema = z.enum([
  'saas',          // Software as a Service, Tech
  'ecommerce',     // Retail, Online stores
  'healthcare',    // Medical, Wellness, Fitness
  'realestate',    // Property, Real estate agents
  'finance',       // Banking, Investment, Insurance
  'education',     // Schools, Training, Courses
  'general'        // General business
]);

export type IndustryType = z.infer<typeof IndustryTypeSchema>;

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

  tone: EmailToneSchema.default('professional').describe('Tone of the email'),

  // NEW: Optional enhancement fields
  industry: IndustryTypeSchema.optional().describe('Industry for specialized language and tone'),

  emojiEnabled: z.boolean().optional().default(false).describe('Enable emojis in subject line')
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
  }),

  // NEW: Optional visual enhancement fields
  preheaderText: z.string().optional().describe('Preheader/preview text (40-130 chars)'),

  htmlBody: z.string().optional().describe('HTML formatted version of email body'),

  emojiUsed: z.boolean().optional().describe('Whether emojis were used in subject')
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

  generatedAt: z.string(),

  // NEW: Optional visual enhancement fields
  preheaderText: z.string().optional(),

  htmlBody: z.string().optional(),

  emojiUsed: z.boolean().optional()
});

export type EmailResponse = z.infer<typeof EmailResponseSchema>;

/**
 * Send Generated Email Request Schema
 * Schema for sending a generated email to a recipient
 */
export const SendGeneratedEmailRequestSchema = z.object({
  requestId: z.string().describe('The ID of the generated email'),

  recipientEmail: z.string().email().describe('Valid email address to send the email to'),

  subjectLine: z.string().min(1).describe('The subject line to use (chosen from alternatives)'),

  fromName: z.string().optional().describe('Optional custom sender name (e.g., "John from Company")'),

  body: z.string().min(1).describe('Plain text email body content'),

  htmlBody: z.string().optional().describe('HTML formatted email body (optional)')
});

export type SendGeneratedEmailRequest = z.infer<typeof SendGeneratedEmailRequestSchema>;

/**
 * Send Email Response Schema
 * Response when sending an email
 */
export const SendEmailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  messageId: z.string().optional()
});

export type SendEmailResponse = z.infer<typeof SendEmailResponseSchema>;

/**
 * Send Email Error Response Schema
 */
export const SendEmailErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.string()
});

export type SendEmailErrorResponse = z.infer<typeof SendEmailErrorResponseSchema>;
