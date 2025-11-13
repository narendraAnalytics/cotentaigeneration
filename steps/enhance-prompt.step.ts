import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { ContentRequestSchema } from '../src/types/content.types';
import { GoogleGenAI } from '@google/genai';

/**
 * Input Schema for Event Step 1
 * Receives data from the API Step (generate-content)
 */
const EnhancePromptInputSchema = ContentRequestSchema.extend({
  requestId: z.string()
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
  const { requestId, topic, keywords, targetAudience, additionalContext, options } = input;

  try {
    logger.info('Starting prompt enhancement', {
      requestId,
      topic,
      keywords
    });

    // Initialize Gemini with Google Search
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build enhancement prompt
    const enhancementPrompt = `You are an expert SEO and content strategist. Your task is to enhance and optimize a blog content request.

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
        // Pass through original options
        options
      }
    });

    logger.info('Emitted to generate-content-with-search topic', { requestId });

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
        options
      }
    });

    logger.info('Emitted fallback data to generate-content-with-search', { requestId });
  }
};
