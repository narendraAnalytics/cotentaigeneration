import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { GenerationOptionsSchema } from '../src/types/content.types';

/**
 * Input Schema for Email Content Generation
 * MUST match generate-content-with-search.step.ts schema for topic compatibility
 */
const GenerateEmailContentInputSchema = z.object({
  requestId: z.string(),
  contentType: z.enum(['blog', 'email']).default('blog').optional(),
  originalRequest: z.object({
    topic: z.string(),
    keywords: z.array(z.string()),
    targetAudience: z.string().optional(),
    additionalContext: z.string().optional(),
    options: GenerationOptionsSchema.optional()
  }),
  enhancedData: z.object({
    enhancedTitle: z.string(),
    titleAlternatives: z.array(z.string()),
    enhancedKeywords: z.array(z.string()),
    seoInsights: z.object({
      searchTrends: z.string(),
      competitiveLandscape: z.string(),
      opportunities: z.string()
    }),
    keyPointsToCover: z.array(z.string()),
    recommendedStructure: z.array(z.string()),
    trendingAngles: z.array(z.string()),
    targetedQuestions: z.array(z.string()),
    additionalContext: z.string()
  }),
  options: GenerationOptionsSchema.optional()
});

/**
 * Event Step Configuration
 * Generates email content using enhanced data and Google Search
 */
export const config: EventConfig = {
  name: 'GenerateEmailContent',
  type: 'event',
  description: 'Generate email content using enhanced data and Google Search',
  subscribes: ['generate-content-with-search'],
  emits: [], // No TTS for emails
  input: GenerateEmailContentInputSchema,
  flows: ['email-generation']
};

/**
 * Event Handler
 * Uses Gemini AI with Google Search to generate professional email content
 */
export const handler: Handlers['GenerateEmailContent'] = async (input, { logger, state }) => {
  const { requestId, contentType = 'blog', originalRequest, enhancedData } = input;

  // IMPORTANT: Skip if this is not an email request (let blog handler process it)
  if (contentType !== 'email') {
    logger.info('Skipping email generation - contentType is not email', {
      requestId,
      contentType
    });
    return; // Exit early, don't process blog content
  }

  try {
    // Email-specific data is passed through originalRequest
    const emailData = originalRequest as any; // Type assertion since schema is shared

    logger.info('Starting email content generation', {
      requestId,
      emailType: emailData.emailType,
      enhancedTitle: enhancedData.enhancedTitle
    });

    // Initialize Gemini with Google Search
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Extract email parameters
    const { topic, keywords, targetAudience } = originalRequest;
    const emailType = emailData.emailType || 'marketing';
    const tone = emailData.tone || 'professional';

    // NEW: Extract optional enhancement fields
    const industry = emailData.industry; // Optional industry type
    const emojiEnabled = emailData.emojiEnabled || false; // Optional emoji flag

    // Build email generation prompt using enhanced data
    const emailPrompt = `You are an expert email copywriter. Generate a professional ${emailType} email using the research and insights provided.

**Enhanced Email Brief:**

**Subject Line Options:**
- Primary: ${enhancedData.enhancedTitle}
- Alternatives: ${enhancedData.titleAlternatives.join(' | ')}

**Email Marketing Research:**
- Trends: ${enhancedData.seoInsights.searchTrends}
- Competitive Landscape: ${enhancedData.seoInsights.competitiveLandscape}
- Opportunities: ${enhancedData.seoInsights.opportunities}

**Enhanced Keywords (Incorporate Naturally):**
${enhancedData.enhancedKeywords.map(k => `- ${k}`).join('\n')}

**Key Points to Cover:**
${enhancedData.keyPointsToCover.map(p => `- ${p}`).join('\n')}

**Recommended Structure:**
${enhancedData.recommendedStructure.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Call-to-Action Guidance:**
${enhancedData.additionalContext}

**Original Request Context:**
- Topic/Purpose: ${topic}
- Email Type: ${emailType}
- Target Audience: ${targetAudience || 'General audience'}
- Tone: ${tone}${industry ? `\n- Industry: ${industry} (USE INDUSTRY-SPECIFIC LANGUAGE)` : ''}${emojiEnabled ? '\n- Emoji Mode: ENABLED (include 1-2 relevant emojis in subject line)' : ''}

---

**Email Requirements:**

1. **Subject Line Selection:**
   - Choose the BEST subject line from the options above
   - Provide 4 alternative subject lines for A/B testing
   - Keep all subject lines under 60 characters
   - Optimize for open rates${emojiEnabled ? '\n   - **Include 1-2 relevant emojis** in subject lines (e.g., 🎯, ✨, 🚀, 💡, 🎉)' : ''}

2. **Preheader Text (NEW):**
   - Create a compelling preheader/preview text (40-130 characters)
   - Complements the subject line
   - Provides additional context visible in inbox preview
   - Entices reader to open the email

3. **Email Body:**
   - Opening: Hook the reader immediately (1-2 sentences)
   - Value Proposition: Clearly state the benefit or purpose
   - Supporting Details: Use the key points identified in research
   - Call-to-Action: Clear, compelling CTA based on email type
   - Closing: Professional sign-off appropriate for the tone${industry ? `\n   - **Use ${industry} industry terminology and language patterns**` : ''}

4. **HTML Formatting (NEW):**
   - Provide HTML formatted version with:
     - <h2> for main headings
     - <strong> for emphasis
     - <ul>/<li> for bullet lists
     - <p> tags for paragraphs
     - Styled CTA button with inline CSS
   - Keep HTML clean and email-client compatible

5. **Optimization:**
   - Keep email concise (200-400 words for body)
   - Use short paragraphs and bullet points where appropriate
   - Incorporate enhanced keywords naturally
   - Make it scannable and easy to read
   - Ensure CTA stands out

6. **Personalization:**
   - Use "you" language
   - Address the target audience's pain points or desires
   - Include specific data or examples from your Google Search research

**Output Format:**
Generate a complete email and provide it as a JSON object with this exact structure:
{
  "subject": "Best subject line (max 60 chars)${emojiEnabled ? ' with emojis' : ''}",
  "subjectAlternatives": ["alt 1", "alt 2", "alt 3", "alt 4"],
  "preheaderText": "Compelling preview text (40-130 chars)",
  "body": "Complete email body text with proper formatting and line breaks",
  "htmlBody": "HTML formatted version with <h2>, <strong>, <ul>, <li>, <p> tags and styled CTA button",
  "callToAction": "Specific CTA text",
  "emojiUsed": ${emojiEnabled},
  "metadata": {
    "emailType": "${emailType}",
    "estimatedReadTime": "X min",
    "tone": "${tone}",
    "keywords": ${JSON.stringify(enhancedData.enhancedKeywords.slice(0, 5))}
  }
}

**IMPORTANT:**
- Use Google Search to find current, relevant examples and data
- Ensure the email is appropriate for ${emailType} purpose
- Match the ${tone} tone throughout
- Make the subject line compelling and click-worthy

Generate the email now:`;

    // Call Gemini with Google Search
    logger.info('Calling Gemini AI with Google Search to generate email', { requestId });

    const tools = [
      {
        googleSearch: {}
      }
    ];

    const geminiConfig = {
      thinkingConfig: {
        thinkingBudget: -1 // Unlimited reasoning
      },
      tools
    };

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-pro',
      config: geminiConfig,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: emailPrompt
            }
          ]
        }
      ]
    });

    // Collect streaming response
    let fullResponse = '';
    for await (const chunk of response) {
      if (chunk && typeof chunk === 'object' && 'text' in chunk) {
        fullResponse += chunk.text;
      }
    }

    logger.info('Received email content from Gemini', {
      requestId,
      responseLength: fullResponse.length
    });

    // Parse email content from response
    let emailContent;
    try {
      // Try to extract JSON from the response
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emailContent = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create structured data from text response
        emailContent = {
          subject: enhancedData.enhancedTitle.substring(0, 60),
          subjectAlternatives: enhancedData.titleAlternatives.slice(0, 4),
          body: fullResponse,
          callToAction: 'Learn More',
          metadata: {
            emailType: emailType,
            estimatedReadTime: '2 min',
            tone: tone,
            keywords: enhancedData.enhancedKeywords.slice(0, 5)
          }
        };
      }
    } catch (parseError) {
      logger.warn('Failed to parse JSON response, using fallback structure', {
        requestId,
        error: parseError instanceof Error ? parseError.message : 'Unknown error'
      });

      // Fallback structure
      emailContent = {
        subject: enhancedData.enhancedTitle.substring(0, 60),
        subjectAlternatives: enhancedData.titleAlternatives.slice(0, 4),
        body: fullResponse,
        callToAction: 'Take Action',
        metadata: {
          emailType: emailType,
          estimatedReadTime: '2 min',
          tone: tone,
          keywords: enhancedData.enhancedKeywords.slice(0, 5)
        }
      };
    }

    logger.info('Email content generated successfully', {
      requestId,
      subject: emailContent.subject,
      bodyLength: emailContent.body.length
    });

    // Store the email in state for retrieval
    const resultData = {
      id: requestId,
      status: 'completed',
      subject: emailContent.subject,
      subjectAlternatives: emailContent.subjectAlternatives,
      body: emailContent.body,
      emailType: emailType,
      callToAction: emailContent.callToAction,
      metadata: emailContent.metadata,
      generatedAt: new Date().toISOString(),
      // NEW: Store optional enhancement fields
      preheaderText: emailContent.preheaderText || undefined,
      htmlBody: emailContent.htmlBody || undefined,
      emojiUsed: emailContent.emojiUsed || false
    };

    await state.set('email', requestId, resultData);

    logger.info('Email stored in state', {
      requestId,
      stateKey: `email:${requestId}`
    });

    // NOTE: No TTS emission for emails (per user preference)
    logger.info('Email generation complete - no TTS audio generation for emails', {
      requestId
    });

  } catch (error) {
    logger.error('Failed to generate email content', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Store error in state
    await state.set('email', requestId, {
      id: requestId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      generatedAt: new Date().toISOString()
    });

    throw error; // Re-throw to trigger retry mechanisms
  }
};
