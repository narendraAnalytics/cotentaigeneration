import { GenerationOptions } from '../types/content.types';

/**
 * Content Type Templates
 * Predefined configurations for different types of blog content
 */
export type ContentType =
  | 'how-to'
  | 'listicle'
  | 'tutorial'
  | 'comparison'
  | 'opinion'
  | 'news'
  | 'guide'
  | 'case-study';

/**
 * Prompt Template Structure
 */
export interface PromptTemplate {
  systemPrompt: string;
  introGuidelines?: string;
  sectionGuidelines?: string;
  conclusionGuidelines?: string;
}

/**
 * Content Template Configuration
 */
export interface ContentTemplate {
  name: string;
  description: string;
  contentType: ContentType;
  options: GenerationOptions;
  promptTemplate?: PromptTemplate;
}

/**
 * Prompt Templates for Different Content Types
 */
export const PROMPT_TEMPLATES: Record<ContentType, PromptTemplate> = {
  'how-to': {
    systemPrompt: 'You are an expert instructional writer specializing in clear, step-by-step guides.',
    introGuidelines: 'Start with why this topic matters and what readers will learn.',
    sectionGuidelines: 'Break down each step clearly with actionable instructions. Use numbered lists where appropriate.',
    conclusionGuidelines: 'Summarize key takeaways and suggest next steps.'
  },

  'listicle': {
    systemPrompt: 'You are an engaging content writer skilled at creating compelling list-based articles.',
    introGuidelines: 'Hook the reader with the value of the list and preview what they will discover.',
    sectionGuidelines: 'Each list item should be a separate section with a descriptive heading and detailed explanation.',
    conclusionGuidelines: 'Tie the list items together and encourage reader action.'
  },

  'tutorial': {
    systemPrompt: 'You are a technical writer and educator who creates comprehensive tutorials.',
    introGuidelines: 'Set expectations about what will be covered and any prerequisites.',
    sectionGuidelines: 'Provide detailed explanations with examples, code snippets, or screenshots where relevant.',
    conclusionGuidelines: 'Review what was learned and point to additional resources.'
  },

  'comparison': {
    systemPrompt: 'You are an analytical writer who creates balanced, data-driven comparisons.',
    introGuidelines: 'Introduce what is being compared and why it matters to the reader.',
    sectionGuidelines: 'Compare features, benefits, drawbacks objectively. Use tables or bullet points for clarity.',
    conclusionGuidelines: 'Provide a clear recommendation or summary of trade-offs.'
  },

  'opinion': {
    systemPrompt: 'You are a thought leader sharing insightful perspectives on industry topics.',
    introGuidelines: 'State your position clearly and explain why this topic deserves attention.',
    sectionGuidelines: 'Support your viewpoint with reasoning, examples, and evidence.',
    conclusionGuidelines: 'Reinforce your main argument and call readers to consider your perspective.'
  },

  'news': {
    systemPrompt: 'You are a news writer delivering timely, factual information.',
    introGuidelines: 'Lead with the most important information (who, what, when, where, why).',
    sectionGuidelines: 'Provide context, background, and analysis in descending order of importance.',
    conclusionGuidelines: 'Summarize implications and what might happen next.'
  },

  'guide': {
    systemPrompt: 'You are an expert creating comprehensive guides for your audience.',
    introGuidelines: 'Explain the scope of the guide and what readers will gain.',
    sectionGuidelines: 'Cover each aspect thoroughly with practical advice and real-world examples.',
    conclusionGuidelines: 'Recap the main points and encourage implementation.'
  },

  'case-study': {
    systemPrompt: 'You are a business writer presenting real-world success stories and lessons.',
    introGuidelines: 'Introduce the subject, challenge, or opportunity being examined.',
    sectionGuidelines: 'Detail the situation, approach taken, results achieved, and lessons learned.',
    conclusionGuidelines: 'Extract key takeaways and how readers can apply these insights.'
  }
};

/**
 * Tone Presets
 */
export const TONE_PRESETS = {
  professional: {
    tone: 'professional' as const,
    description: 'Polished, business-appropriate language'
  },
  casual: {
    tone: 'casual' as const,
    description: 'Relaxed, conversational style'
  },
  formal: {
    tone: 'formal' as const,
    description: 'Academic or official writing style'
  },
  friendly: {
    tone: 'friendly' as const,
    description: 'Warm, approachable language'
  },
  authoritative: {
    tone: 'authoritative' as const,
    description: 'Expert, confident voice'
  },
  conversational: {
    tone: 'conversational' as const,
    description: 'Like talking to a friend'
  }
};

/**
 * Style Presets
 */
export const STYLE_PRESETS = {
  informative: {
    style: 'informative' as const,
    description: 'Focus on delivering facts and information'
  },
  persuasive: {
    style: 'persuasive' as const,
    description: 'Convince and influence the reader'
  },
  educational: {
    style: 'educational' as const,
    description: 'Teach concepts and skills'
  },
  storytelling: {
    style: 'storytelling' as const,
    description: 'Narrative-driven content'
  },
  technical: {
    style: 'technical' as const,
    description: 'In-depth, technical explanations'
  },
  creative: {
    style: 'creative' as const,
    description: 'Imaginative and original expression'
  }
};

/**
 * Predefined Content Templates
 */
export const CONTENT_TEMPLATES: Record<string, ContentTemplate> = {
  // Short Blog Post (500-800 words)
  shortBlog: {
    name: 'Short Blog Post',
    description: 'Quick, scannable blog post',
    contentType: 'opinion',
    options: {
      tone: 'conversational',
      style: 'informative',
      wordCount: 600,
      includeIntro: true,
      includeConclusion: true,
      sectionCount: 3,
      formatting: {
        useMarkdown: true,
        includeTOC: false,
        useHeadings: true
      }
    }
  },

  // Standard Blog Post (1000-1500 words)
  standardBlog: {
    name: 'Standard Blog Post',
    description: 'Comprehensive blog article',
    contentType: 'guide',
    options: {
      tone: 'professional',
      style: 'informative',
      wordCount: 1200,
      includeIntro: true,
      includeConclusion: true,
      sectionCount: 5,
      formatting: {
        useMarkdown: true,
        includeTOC: false,
        useHeadings: true
      }
    }
  },

  // Long-form Article (2000+ words)
  longFormArticle: {
    name: 'Long-form Article',
    description: 'In-depth, comprehensive article',
    contentType: 'guide',
    options: {
      tone: 'authoritative',
      style: 'educational',
      wordCount: 2500,
      includeIntro: true,
      includeConclusion: true,
      sectionCount: 8,
      formatting: {
        useMarkdown: true,
        includeTOC: true,
        useHeadings: true
      }
    }
  },

  // How-to Guide
  howToGuide: {
    name: 'How-to Guide',
    description: 'Step-by-step instructional content',
    contentType: 'how-to',
    options: {
      tone: 'friendly',
      style: 'educational',
      wordCount: 1500,
      includeIntro: true,
      includeConclusion: true,
      sectionCount: 6,
      formatting: {
        useMarkdown: true,
        includeTOC: true,
        useHeadings: true
      }
    }
  },

  // Listicle
  listicle: {
    name: 'Listicle',
    description: 'Numbered or bulleted list article',
    contentType: 'listicle',
    options: {
      tone: 'casual',
      style: 'informative',
      wordCount: 1000,
      includeIntro: true,
      includeConclusion: true,
      sectionCount: 7, // e.g., "7 Ways to..."
      formatting: {
        useMarkdown: true,
        includeTOC: false,
        useHeadings: true
      }
    }
  },

  // Technical Tutorial
  technicalTutorial: {
    name: 'Technical Tutorial',
    description: 'Detailed technical walkthrough',
    contentType: 'tutorial',
    options: {
      tone: 'professional',
      style: 'technical',
      wordCount: 2000,
      includeIntro: true,
      includeConclusion: true,
      sectionCount: 6,
      formatting: {
        useMarkdown: true,
        includeTOC: true,
        useHeadings: true
      }
    }
  },

  // Product Comparison
  productComparison: {
    name: 'Product Comparison',
    description: 'Side-by-side comparison article',
    contentType: 'comparison',
    options: {
      tone: 'professional',
      style: 'informative',
      wordCount: 1800,
      includeIntro: true,
      includeConclusion: true,
      sectionCount: 5,
      formatting: {
        useMarkdown: true,
        includeTOC: true,
        useHeadings: true
      }
    }
  },

  // Case Study
  caseStudy: {
    name: 'Case Study',
    description: 'Business case study or success story',
    contentType: 'case-study',
    options: {
      tone: 'authoritative',
      style: 'persuasive',
      wordCount: 2000,
      includeIntro: true,
      includeConclusion: true,
      sectionCount: 6,
      formatting: {
        useMarkdown: true,
        includeTOC: true,
        useHeadings: true
      }
    }
  }
};

/**
 * Default Generation Options
 */
export const DEFAULT_OPTIONS: GenerationOptions = {
  tone: 'professional',
  style: 'informative',
  wordCount: 1000,
  includeIntro: true,
  includeConclusion: true,
  sectionCount: 5,
  formatting: {
    useMarkdown: true,
    includeTOC: false,
    useHeadings: true
  }
};

/**
 * Word Count Recommendations by Content Type
 */
export const WORD_COUNT_RECOMMENDATIONS: Record<ContentType, { min: number; max: number; optimal: number }> = {
  'how-to': { min: 800, max: 2000, optimal: 1200 },
  'listicle': { min: 600, max: 1500, optimal: 1000 },
  'tutorial': { min: 1500, max: 3000, optimal: 2000 },
  'comparison': { min: 1200, max: 2500, optimal: 1800 },
  'opinion': { min: 500, max: 1500, optimal: 800 },
  'news': { min: 400, max: 1000, optimal: 600 },
  'guide': { min: 1500, max: 4000, optimal: 2500 },
  'case-study': { min: 1500, max: 3000, optimal: 2000 }
};

/**
 * Helper function to get a content template by name
 */
export function getTemplate(templateName: keyof typeof CONTENT_TEMPLATES): ContentTemplate {
  return CONTENT_TEMPLATES[templateName];
}

/**
 * Helper function to merge custom options with a template
 */
export function mergeTemplateOptions(
  templateName: keyof typeof CONTENT_TEMPLATES,
  customOptions: Partial<GenerationOptions>
): GenerationOptions {
  const template = CONTENT_TEMPLATES[templateName];
  return {
    ...template.options,
    ...customOptions,
    formatting: {
      ...template.options.formatting,
      ...customOptions.formatting
    }
  };
}

/**
 * Helper function to get prompt template for content type
 */
export function getPromptTemplate(contentType: ContentType): PromptTemplate {
  return PROMPT_TEMPLATES[contentType];
}
