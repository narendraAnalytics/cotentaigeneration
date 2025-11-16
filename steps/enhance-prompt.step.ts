import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { ContentRequestSchema } from '../src/types/content.types';
import { GoogleGenAI } from '@google/genai';

/**
 * Input Schema for Event Step 1
 * Receives data from the API Step (generate-content or generate-email)
 */
const EnhancePromptInputSchema = ContentRequestSchema.extend({
  requestId: z.string(),
  contentType: z.enum(['blog', 'email']).default('blog').optional() // Default to 'blog' for backward compatibility
});

/**
 * Event Step 1 Configuration
 * Enhances user prompt using Gemini AI + Google Search
 */
export const config: EventConfig = {
  name: 'EnhancePrompt',
  type: 'event',
  description: 'Enhance user prompt using Gemini AI + Google Search for SEO and trend insights',
  subscribes: ['enhance-prompt'],
  emits: ['generate-content-with-search'],
  input: EnhancePromptInputSchema,
  flows: ['content-generation']
};

/**
 * Event Handler
 * Uses Gemini AI with Google Search to enhance the original prompt
 */
export const handler: Handlers['EnhancePrompt'] = async (input, { emit, logger }) => {
  const { requestId, topic, keywords, targetAudience, additionalContext, options, contentType = 'blog' } = input;

  try {
    logger.info('Starting prompt enhancement', {
      requestId,
      topic,
      keywords,
      contentType
    });

    // Initialize Gemini with Google Search
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build enhancement prompt based on content type
    const enhancementPrompt = contentType === 'email'
      ? buildEmailEnhancementPrompt(topic, keywords, targetAudience, additionalContext, input)
      : buildBlogEnhancementPrompt(topic, keywords, targetAudience, additionalContext);

    // Call Gemini with Google Search tool - following reference code structure
    logger.info('Calling Gemini AI with Google Search', { requestId });

    const tools = [
      {
        googleSearch: {}
      }
    ];

    const geminiConfig = {
      thinkingConfig: {
        thinkingBudget: -1 // Unlimited reasoning
      },
      tools // Tools inside config as per reference
    };

    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-pro',
      config: geminiConfig,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: enhancementPrompt
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

    logger.info('Received enhancement from Gemini', {
      requestId,
      responseLength: fullResponse.length
    });

    // Parse enhanced data
    let enhancedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        enhancedData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create structured data from text response
        enhancedData = {
          enhancedTitle: topic,
          titleAlternatives: [topic],
          enhancedKeywords: keywords,
          seoInsights: {
            searchTrends: fullResponse.substring(0, 200),
            competitiveLandscape: 'See full analysis',
            opportunities: 'Enhanced by AI research'
          },
          keyPointsToCover: ['AI-enhanced content points'],
          recommendedStructure: ['Introduction', 'Main Content', 'Conclusion'],
          trendingAngles: ['Current trends identified'],
          targetedQuestions: ['What questions should be answered?'],
          additionalContext: fullResponse
        };
      }
    } catch (parseError) {
      logger.warn('Failed to parse JSON response, using fallback structure', {
        requestId,
        error: parseError instanceof Error ? parseError.message : 'Unknown error'
      });

      // Fallback structure
      enhancedData = {
        enhancedTitle: topic,
        titleAlternatives: [topic],
        enhancedKeywords: keywords,
        seoInsights: {
          searchTrends: 'Research completed',
          competitiveLandscape: 'Analysis available',
          opportunities: 'Enhanced with AI insights'
        },
        keyPointsToCover: keywords.map(k => `Cover ${k} in detail`),
        recommendedStructure: ['Introduction', 'Main Sections', 'Conclusion'],
        trendingAngles: ['Current industry trends'],
        targetedQuestions: [`What is ${topic}?`, `How does ${topic} work?`],
        additionalContext: fullResponse
      };
    }

    logger.info('Prompt enhancement completed', {
      requestId,
      enhancedKeywordCount: enhancedData.enhancedKeywords.length
    });

    // Emit to next step: generate-content-with-search
    await emit({
      topic: 'generate-content-with-search',
      data: {
        requestId,
        originalRequest: input,
        enhancedData,
        // Pass through content type for routing
        contentType,
        // Pass through original options (only if exists - for blog requests)
        ...(options && { options })
      }
    });

    logger.info('Emitted to generate-content-with-search topic', { requestId, contentType });

  } catch (error) {
    logger.error('Failed to enhance prompt', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Even on error, emit to next step with original data
    // This ensures the workflow continues
    await emit({
      topic: 'generate-content-with-search',
      data: {
        requestId,
        originalRequest: input,
        enhancedData: {
          enhancedTitle: topic,
          titleAlternatives: [topic],
          enhancedKeywords: keywords,
          seoInsights: {
            searchTrends: 'Enhancement failed, using original request',
            competitiveLandscape: 'N/A',
            opportunities: 'N/A'
          },
          keyPointsToCover: keywords,
          recommendedStructure: ['Introduction', 'Main Content', 'Conclusion'],
          trendingAngles: [],
          targetedQuestions: [],
          additionalContext: additionalContext || ''
        },
        contentType,
        // Pass through original options (only if exists - for blog requests)
        ...(options && { options })
      }
    });

    logger.info('Emitted fallback data to generate-content-with-search', { requestId, contentType });
  }
};

/**
 * Build enhancement prompt for blog content
 */
function buildBlogEnhancementPrompt(
  topic: string,
  keywords: string[],
  targetAudience?: string,
  additionalContext?: string
): string {
  return `You are an expert SEO and content strategist. Your task is to enhance and optimize a blog content request.

**Original Request:**
- Topic: ${topic}
- Keywords: ${keywords.join(', ')}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}

**Your Tasks:**
1. Research the topic using Google Search to find:
   - Current trends and latest information
   - Popular related topics and questions
   - Competitive content and gaps in coverage
   - SEO opportunities

2. Enhance the keyword list by:
   - Adding high-value related keywords
   - Including long-tail keyword variations
   - Identifying LSI (Latent Semantic Indexing) keywords

3. Provide strategic insights:
   - What angles would make this content stand out?
   - What specific data, statistics, or examples should be included?
   - What questions is the target audience asking about this topic?

4. Create an enhanced content brief with:
   - Optimized title suggestions (3-5 options)
   - Enhanced keyword list (include original + new keywords)
   - Key points to cover
   - Recommended content structure
   - Trending angles or hooks

**Output Format:**
Please provide a comprehensive JSON response with this structure:
{
  "enhancedTitle": "string",
  "titleAlternatives": ["string", "string"],
  "enhancedKeywords": ["string", "string"],
  "seoInsights": {
    "searchTrends": "string",
    "competitiveLandscape": "string",
    "opportunities": "string"
  },
  "keyPointsToCover": ["string", "string"],
  "recommendedStructure": ["string", "string"],
  "trendingAngles": ["string", "string"],
  "targetedQuestions": ["string", "string"],
  "additionalContext": "string"
}`;
}

/**
 * Build enhancement prompt for email content
 */
function buildEmailEnhancementPrompt(
  topic: string,
  keywords: string[],
  targetAudience?: string,
  additionalContext?: string,
  input?: any
): string {
  const emailType = input?.emailType || 'professional';
  const tone = input?.tone || 'professional';

  return `You are an expert email marketing and copywriting strategist. Your task is to enhance and optimize an email content request.

**Original Request:**
- Topic/Purpose: ${topic}
- Email Type: ${emailType}
- Keywords: ${keywords.join(', ')}
- Tone: ${tone}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}

**Your Tasks:**
1. Research the topic using Google Search to find:
   - Current email marketing trends
   - Best practices for ${emailType} emails
   - Competitive examples and successful campaigns
   - Relevant data and statistics

2. Enhance the keyword list by:
   - Adding relevant email copywriting keywords
   - Including power words and action verbs
   - Identifying emotionally engaging terms

3. Generate compelling subject lines:
   - Create 5 subject line options optimized for open rates
   - Keep subject lines under 60 characters
   - Use proven formulas (urgency, curiosity, personalization)
   - A/B testing recommendations

4. Provide strategic insights:
   - What email structure works best for ${emailType}?
   - What call-to-action would be most effective?
   - What pain points or desires should we address?
   - What personalization elements should be included?

5. Create an enhanced email brief with:
   - Subject line options (5 variations)
   - Enhanced keyword list
   - Key points to cover in email body
   - Recommended email structure (opening, body, CTA, closing)
   - Call-to-action suggestions

**Output Format:**
Please provide a comprehensive JSON response with this structure:
{
  "enhancedTitle": "Primary subject line",
  "titleAlternatives": ["subject 2", "subject 3", "subject 4", "subject 5"],
  "enhancedKeywords": ["string", "string"],
  "seoInsights": {
    "searchTrends": "Current email marketing trends",
    "competitiveLandscape": "Competitive analysis",
    "opportunities": "Unique angles and opportunities"
  },
  "keyPointsToCover": ["Email body point 1", "Email body point 2"],
  "recommendedStructure": ["Opening hook", "Value proposition", "Supporting details", "Call to action", "Closing"],
  "trendingAngles": ["Angle 1", "Angle 2"],
  "targetedQuestions": ["Question to address 1", "Question to address 2"],
  "additionalContext": "Call-to-action: [Specific CTA recommendation]"
}`;
}
