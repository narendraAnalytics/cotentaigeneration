import { GoogleGenAI } from '@google/genai';
import {
  ContentRequest,
  BlogArticle,
  ArticleSection,
  GenerationOptions
} from '../../types/content.types';

/**
 * Gemini Service Configuration
 */
interface GeminiServiceConfig {
  apiKey: string;
  model?: string;
  thinkingBudget?: number;
}

/**
 * Gemini Service
 * Handles all interactions with Google Gemini AI for content generation
 */
export class GeminiService {
  private ai: GoogleGenAI;
  private model: string;
  private thinkingBudget: number;

  constructor(config: GeminiServiceConfig) {
    if (!config.apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.ai = new GoogleGenAI({
      apiKey: config.apiKey,
    });

    this.model = config.model || 'gemini-2.5-pro';
    this.thinkingBudget = config.thinkingBudget ?? -1;
  }

  /**
   * Generates blog content based on the provided request
   */
  async generateBlogContent(request: ContentRequest): Promise<BlogArticle> {
    try {
      const prompt = this.buildPrompt(request);

      const response = await this.ai.models.generateContentStream({
        model: this.model,
        config: {
          thinkingConfig: {
            thinkingBudget: this.thinkingBudget,
          },
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      // Collect streaming response
      let fullContent = '';
      for await (const chunk of response) {
        if (chunk && typeof chunk === 'object' && 'text' in chunk) {
          fullContent += chunk.text;
        }
      }

      // Parse the generated content into structured BlogArticle
      const article = this.parseContentToArticle(fullContent, request);

      return article;
    } catch (error) {
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Builds the prompt for Gemini based on the content request
   */
  private buildPrompt(request: ContentRequest): string {
    const options: Partial<GenerationOptions> = request.options || {};
    const tone = options.tone || 'professional';
    const style = options.style || 'informative';
    const wordCount = options.wordCount || 1000;
    const sectionCount = options.sectionCount || 5;

    const prompt = `You are an expert blog writer and content creator. Generate a comprehensive blog article with the following requirements:

**Topic**: ${request.topic}

**Keywords to include**: ${request.keywords.join(', ')}

${request.targetAudience ? `**Target Audience**: ${request.targetAudience}` : ''}

${request.additionalContext ? `**Additional Context**: ${request.additionalContext}` : ''}

**Writing Guidelines**:
- Tone: ${tone}
- Style: ${style}
- Target word count: approximately ${wordCount} words
- Number of main sections: ${sectionCount}

**Structure Requirements**:
${options.includeIntro !== false ? '1. Write an engaging introduction (50-150 words)' : ''}
2. Create ${sectionCount} main sections, each with:
   - A clear, descriptive heading
   - Well-developed content (${Math.floor(wordCount / sectionCount)} words per section)
   - Incorporate the keywords naturally
3. ${options.includeConclusion !== false ? 'Write a strong conclusion (50-150 words)' : 'End with the last section'}

**Formatting**:
${options.formatting?.useMarkdown !== false ? '- Use Markdown formatting' : '- Use plain text'}
${options.formatting?.useHeadings !== false ? '- Use proper heading levels (## for sections)' : ''}
- Make the content scannable and easy to read
- Use bullet points or numbered lists where appropriate

**Important**:
- Keep the content focused on the topic
- Make it valuable and actionable for the reader
- Ensure the content is original and engaging
- Incorporate all provided keywords naturally

Please generate the complete article now.`;

    return prompt;
  }

  /**
   * Parses the raw Gemini response into a structured BlogArticle object
   */
  private parseContentToArticle(
    content: string,
    request: ContentRequest
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

      // Extract title (usually first # or the first substantial line)
      if (!title && (line.startsWith('# ') || (i === 0 && line.length > 10))) {
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

        // Start new section
        currentSection = {
          heading: line.replace(/^#{2,3}\s*/, '').trim(),
          content: []
        };
        inIntro = false;
        continue;
      }

      // Check for conclusion section
      if (line.toLowerCase().includes('conclusion') && currentSection) {
        // Save current section
        sections.push({
          heading: currentSection.heading,
          content: currentSection.content.join('\n\n'),
          order: sectionOrder++
        });
        currentSection = null;

        // Start collecting conclusion
        const conclusionLines: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          conclusionLines.push(lines[j]);
        }
        conclusion = conclusionLines.join('\n\n').trim();
        break;
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

    // If no title was found, use the topic
    if (!title) {
      title = request.topic;
    }

    // Calculate word count
    const wordCount = content.split(/\s+/).length;

    return {
      title,
      introduction: introduction || undefined,
      sections,
      conclusion: conclusion || undefined,
      metadata: {
        keywords: request.keywords,
        targetAudience: request.targetAudience,
        primaryKeyword: request.keywords[0]
      },
      status: 'completed',
      generatedAt: new Date(),
      wordCount
    };
  }
}

/**
 * Factory function to create a GeminiService instance
 */
export function createGeminiService(apiKey?: string): GeminiService {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  return new GeminiService({
    apiKey: key,
    model: 'gemini-2.5-pro'
  });
}
