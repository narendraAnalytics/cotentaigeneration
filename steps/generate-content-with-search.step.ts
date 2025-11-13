import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { BlogArticle, ArticleSection, GenerationOptionsSchema } from '../src/types/content.types';

/**
 * Input Schema for Event Step 2
 * Receives enhanced data from Event Step 1 (enhance-prompt)
 */
const GenerateContentInputSchema = z.object({
  requestId: z.string(),
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
 * Event Step 2 Configuration
 * Generates final blog content using enhanced prompt + Google Search
 */
export const config: EventConfig = {
  name: 'GenerateContentWithSearch',
  type: 'event',
  description: 'Generate final blog content using enhanced data and Google Search for up-to-date information',
  subscribes: ['generate-content-with-search'],
  emits: ['generate-tts'],
  input: GenerateContentInputSchema,
  flows: ['content-generation']
};

/**
 * Event Handler
 * Uses Gemini AI with Google Search to generate comprehensive blog article
 */
export const handler: Handlers['GenerateContentWithSearch'] = async (input, { emit, logger, state }) => {
  const { requestId, originalRequest, enhancedData, options } = input;

  try {
    logger.info('Starting blog content generation', {
      requestId,
      enhancedTitle: enhancedData.enhancedTitle,
      keywordCount: enhancedData.enhancedKeywords.length
    });

    // Initialize Gemini with Google Search
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Get options from input
    const tone = options?.tone || 'professional';
    const style = options?.style || 'informative';
    const wordCount = options?.wordCount || 1500;
    const sectionCount = options?.sectionCount || 5;
    const includeIntro = options?.includeIntro !== false;
    const includeConclusion = options?.includeConclusion !== false;

    // Build comprehensive generation prompt using enhanced data
    const generationPrompt = `You are an expert blog writer and content creator. Generate a comprehensive, SEO-optimized blog article using the research and insights provided.

**Enhanced Content Brief:**

**Title Options:**
- Primary: ${enhancedData.enhancedTitle}
- Alternatives: ${enhancedData.titleAlternatives.join(' | ')}

**SEO Research Insights:**
- Search Trends: ${enhancedData.seoInsights.searchTrends}
- Competitive Landscape: ${enhancedData.seoInsights.competitiveLandscape}
- Opportunities: ${enhancedData.seoInsights.opportunities}

**Enhanced Keywords (USE THESE):**
${enhancedData.enhancedKeywords.map(k => `- ${k}`).join('\n')}

**Key Points to Cover:**
${enhancedData.keyPointsToCover.map(p => `- ${p}`).join('\n')}

**Recommended Structure:**
${enhancedData.recommendedStructure.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Trending Angles:**
${enhancedData.trendingAngles.map(a => `- ${a}`).join('\n')}

**Questions to Answer:**
${enhancedData.targetedQuestions.map(q => `- ${q}`).join('\n')}

**Additional Context:**
${enhancedData.additionalContext}

**Original Request Context:**
${originalRequest.targetAudience ? `- Target Audience: ${originalRequest.targetAudience}` : ''}
${originalRequest.additionalContext ? `- User Notes: ${originalRequest.additionalContext}` : ''}

---

**Writing Guidelines:**
- Tone: ${tone}
- Style: ${style}
- Target Word Count: ${wordCount} words
- Number of Main Sections: ${sectionCount}

**Structure Requirements:**
${includeIntro ? '1. Write an engaging introduction (100-200 words) that hooks the reader and previews the value' : ''}
2. Create ${sectionCount} main sections, each with:
   - A clear, SEO-friendly heading (## format)
   - Well-developed, informative content (${Math.floor(wordCount / sectionCount)}-${Math.floor(wordCount / sectionCount) + 100} words)
   - Incorporate the enhanced keywords naturally
   - Include current data, statistics, examples where relevant
   - Answer the targeted questions identified in research
3. ${includeConclusion ? 'Write a strong conclusion (100-200 words) that summarizes key takeaways' : 'End with the final section'}

**Content Quality Requirements:**
✓ Use Google Search to find and include:
  - Latest statistics and data
  - Current trends and examples
  - Recent developments or news
  - Expert insights and quotes
✓ Make content actionable and valuable
✓ Use formatting: headings, bullet points, numbered lists
✓ Write in Markdown format
✓ Ensure all enhanced keywords are naturally incorporated
✓ Address the trending angles and questions identified
✓ Create content that stands out from competitors

**Output Format:**
Generate the complete blog article in Markdown format with:
- Main title (# H1)
- Introduction (if required)
- ${sectionCount} main sections (## H2 headings)
- Conclusion (if required)
- Natural keyword integration
- Professional formatting

**IMPORTANT:** Use Google Search to ensure all information is current and accurate. Include specific data points, statistics, and examples from your research.

Generate the article now:`;

    // Call Gemini with Google Search - following reference code structure
    logger.info('Calling Gemini AI with Google Search to generate content', { requestId });

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
              text: generationPrompt
            }
          ]
        }
      ]
    });

    // Collect streaming response
    let fullContent = '';
    for await (const chunk of response) {
      if (chunk && typeof chunk === 'object' && 'text' in chunk) {
        fullContent += chunk.text;
      }
    }

    logger.info('Received blog content from Gemini', {
      requestId,
      contentLength: fullContent.length,
      wordCount: fullContent.split(/\s+/).length
    });

    // Parse the generated content into BlogArticle structure
    const article = parseContentToArticle(fullContent, enhancedData, originalRequest);

    logger.info('Blog article generated successfully', {
      requestId,
      title: article.title,
      sectionCount: article.sections.length,
      wordCount: article.wordCount
    });

    // Store the complete article in state for retrieval
    const resultData = {
      id: requestId,
      article,
      status: 'completed',
      generatedAt: new Date().toISOString(),
      fullContent // Store the raw markdown content too
    };

    await state.set('blog', requestId, resultData);

    logger.info('Article stored in state', {
      requestId,
      stateKey: `blog:${requestId}`
    });

    // Emit event to generate TTS audio
    await emit({
      topic: 'generate-tts',
      data: {
        requestId
      }
    });

    logger.info('Emitted to generate-tts topic', { requestId });

    // Log preview for monitoring
    logger.info('Generated Article Preview', {
      requestId,
      article: {
        id: requestId,
        title: article.title,
        introduction: article.introduction?.substring(0, 100) + '...',
        sectionCount: article.sections.length,
        conclusion: article.conclusion?.substring(0, 100) + '...',
        metadata: article.metadata
      }
    });

  } catch (error) {
    logger.error('Failed to generate blog content', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    throw error; // Re-throw to trigger retry mechanisms
  }
};

/**
 * Parse raw content into structured BlogArticle
 */
function parseContentToArticle(
  content: string,
  enhancedData: any,
  originalRequest: any
): BlogArticle {
  const lines = content.split('\n').filter(line => line.trim());

  let title = '';
  let introduction = '';
  let conclusion = '';
  const sections: ArticleSection[] = [];

  let currentSection: { heading: string; content: string[] } | null = null;
  let inIntro = false;
  let sectionOrder = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Extract title (first # heading)
    if (!title && line.startsWith('# ')) {
      title = line.replace(/^#\s*/, '').trim();
      inIntro = true;
      continue;
    }

    // Detect section headings (## or ###)
    if (line.match(/^#{2,3}\s+/)) {
      // Save previous section
      if (currentSection) {
        sections.push({
          heading: currentSection.heading,
          content: currentSection.content.join('\n\n'),
          order: sectionOrder++
        });
      }

      // Check if this is conclusion section
      const heading = line.replace(/^#{2,3}\s*/, '').trim();
      if (heading.toLowerCase().includes('conclusion')) {
        currentSection = null;
        // Collect remaining content as conclusion
        const conclusionLines: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          if (!lines[j].match(/^#{1,3}\s+/)) {
            conclusionLines.push(lines[j]);
          }
        }
        conclusion = conclusionLines.join('\n\n').trim();
        break;
      }

      // Start new section
      currentSection = {
        heading,
        content: []
      };
      inIntro = false;
      continue;
    }

    // Add content to appropriate section
    if (line) {
      if (inIntro && !currentSection) {
        introduction += (introduction ? '\n\n' : '') + line;
      } else if (currentSection) {
        currentSection.content.push(line);
      }
    }
  }

  // Save last section if exists
  if (currentSection) {
    sections.push({
      heading: currentSection.heading,
      content: currentSection.content.join('\n\n'),
      order: sectionOrder++
    });
  }

  // Use enhanced title if original parsing failed
  if (!title) {
    title = enhancedData.enhancedTitle || originalRequest.topic;
  }

  // Calculate word count
  const wordCount = content.split(/\s+/).length;

  return {
    title,
    introduction: introduction || undefined,
    sections,
    conclusion: conclusion || undefined,
    metadata: {
      keywords: enhancedData.enhancedKeywords || originalRequest.keywords,
      targetAudience: originalRequest.targetAudience,
      primaryKeyword: enhancedData.enhancedKeywords?.[0] || originalRequest.keywords[0],
      seoDescription: `${title} - ${introduction?.substring(0, 150)}` || undefined
    },
    status: 'completed',
    generatedAt: new Date(),
    wordCount
  };
}
