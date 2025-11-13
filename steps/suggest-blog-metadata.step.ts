import { ApiRouteConfig } from 'motia';
import type { ApiRouteHandler } from 'motia';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

/**
 * Input Schema for Metadata Suggestion API
 */
const SuggestMetadataInputSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters')
});

type SuggestMetadataInput = z.infer<typeof SuggestMetadataInputSchema>;

/**
 * Output Schema for Metadata Suggestions
 */
const SuggestMetadataOutputSchema = z.object({
  keywords: z.array(z.string()),
  targetAudience: z.string(),
  additionalContext: z.string()
});

/**
 * API Step Configuration
 * Generates blog metadata suggestions using Gemini 2.5 Flash
 */
export const config: ApiRouteConfig = {
  name: 'SuggestBlogMetadata',
  type: 'api',
  description: 'Generate keyword, audience, and context suggestions for blog topics using AI',
  path: '/api/suggest-blog-metadata',
  method: 'POST',
  emits: [],
  bodySchema: SuggestMetadataInputSchema,
  responseSchema: {
    200: SuggestMetadataOutputSchema,
    400: z.object({ error: z.string() }),
    500: z.object({ error: z.string() })
  }
};

/**
 * API Handler
 * Uses Gemini 2.5 Flash for fast, cost-effective metadata generation
 */
export const handler: ApiRouteHandler = async (req, { logger }) => {
  const { topic } = req.body as SuggestMetadataInput;

  try {
    logger.info('Generating blog metadata suggestions', { topic });

    // Initialize Gemini 2.5 Flash (fast and efficient)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Create optimized prompt for metadata generation
    const prompt = `You are an expert content strategist and SEO specialist. Generate blog metadata for the following topic:

**Topic**: "${topic}"

Provide the following in JSON format:
1. **keywords**: An array of 5-8 relevant keywords that would help with SEO and content creation
2. **targetAudience**: A concise description of who would benefit from reading this blog (1-2 sentences)
3. **additionalContext**: Brief context or key points that should be covered in the blog (2-3 sentences)

**Output Format** (JSON only, no markdown):
{
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "targetAudience": "Description of the target audience",
  "additionalContext": "Key context and points to cover in the blog"
}

Respond with ONLY the JSON object, no additional text.`;

    logger.info('Calling Gemini 2.5 Flash for suggestions', { topic });

    // Use Gemini 2.5 Flash for fast generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    const responseText = response.text || '';
    logger.info('Received response from Gemini', {
      topic,
      responseLength: responseText.length
    });

    // Parse the JSON response
    let suggestions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.warn('Failed to parse JSON, using fallback', {
        topic,
        error: parseError instanceof Error ? parseError.message : 'Unknown error'
      });

      // Fallback: Generate basic suggestions
      suggestions = {
        keywords: [
          topic.toLowerCase(),
          `${topic.toLowerCase()} guide`,
          `${topic.toLowerCase()} tutorial`,
          `best practices ${topic.toLowerCase()}`,
          `${topic.toLowerCase()} tips`
        ].slice(0, 5),
        targetAudience: `Readers interested in ${topic} who want to learn more about this subject`,
        additionalContext: `This blog will cover the fundamentals and key aspects of ${topic}, providing valuable insights and practical information.`
      };
    }

    // Validate the suggestions
    const validatedSuggestions = SuggestMetadataOutputSchema.parse(suggestions);

    logger.info('Successfully generated metadata suggestions', {
      topic,
      keywordCount: validatedSuggestions.keywords.length
    });

    return {
      status: 200,
      body: validatedSuggestions
    };

  } catch (error) {
    logger.error('Failed to generate metadata suggestions', {
      topic,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Return fallback suggestions on error
    return {
      status: 200,
      body: {
        keywords: [
          topic.toLowerCase(),
          `${topic.toLowerCase()} guide`,
          `learn ${topic.toLowerCase()}`
        ],
        targetAudience: `Readers interested in ${topic}`,
        additionalContext: `Explore key concepts and insights about ${topic}.`
      }
    };
  }
};
