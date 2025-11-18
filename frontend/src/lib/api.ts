/**
 * API Service for Blog Generation
 * Handles communication with the backend blog generation API
 */

// Backend URL - update this if your backend runs on a different port
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export interface BlogGenerationRequest {
  topic: string;
  keywords: string[];
  targetAudience?: string; // Optional to match backend schema
  additionalContext?: string; // Optional to match backend schema
  options?: {
    tone: 'professional' | 'casual' | 'formal' | 'friendly' | 'authoritative' | 'conversational';
    style: 'informative' | 'persuasive' | 'educational' | 'storytelling' | 'technical' | 'creative';
    wordCount: number;
    sectionCount: number;
    includeIntro: boolean;
    includeConclusion: boolean;
    formatting: {
      useMarkdown: boolean;
      useHeadings: boolean;
      includeTOC?: boolean;
    };
  };
}

export interface BlogGenerationResponse {
  id: string;
  status: string;
  message?: string;
}

export interface BlogArticle {
  title: string;
  content: string;
  wordCount: number;
  introduction?: string;
  conclusion?: string;
  sections: Array<{
    heading: string;
    content: string;
    order?: number;
  }>;
  metadata: {
    topic?: string;
    keywords: string[];
    tone?: string;
    style?: string;
    targetAudience?: string;
    primaryKeyword?: string;
    seoDescription?: string;
  };
}

export interface AudioData {
  audioData: string; // Base64 encoded audio (PCM or MP3)
  format: 'pcm' | 'mp3';
  sampleRate: number;
  channels: number;
  generatedAt: string;
}

export interface BlogContentResponse {
  id: string;
  status: string;
  article: BlogArticle;
  audio?: AudioData;
  generatedAt: string;
}

/**
 * Start blog generation
 */
export async function generateBlog(
  request: BlogGenerationRequest
): Promise<BlogGenerationResponse> {
  try {
    console.log('🚀 Sending blog generation request:', {
      url: `${BACKEND_URL}/api/generate-content`,
      payload: request
    });

    const response = await fetch(`${BACKEND_URL}/api/generate-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend error response:', errorData);
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('✅ Blog generation started:', data);
    return data;
  } catch (error) {
    console.error("❌ Error generating blog:", error);
    throw error;
  }
}

/**
 * Get blog content by request ID
 * Returns 200 when ready, 404 when still processing
 */
export async function getBlogContent(
  requestId: string
): Promise<BlogContentResponse | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/content/${requestId}`);

    if (response.status === 404) {
      // Still generating
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching blog content:", error);
    throw error;
  }
}

/**
 * Poll for blog content until ready
 * @param requestId The request ID to poll
 * @param maxAttempts Maximum number of polling attempts (default: 50)
 * @param intervalMs Polling interval in milliseconds (default: 5000)
 */
export async function pollBlogContent(
  requestId: string,
  maxAttempts = 50,
  intervalMs = 5000,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<BlogContentResponse> {
  let attempts = 0;
  let blogReady = false;
  let ttsReady = false;

  while (attempts < maxAttempts) {
    attempts++;

    if (onProgress) {
      onProgress(attempts, maxAttempts);
    }

    const content = await getBlogContent(requestId);

    if (content) {
      blogReady = true;

      // Check if TTS audio is also ready
      if (content.audio && content.audio.audioData) {
        ttsReady = true;
        console.log('✅ BOTH blog and TTS audio ready!');
        return content;
      } else {
        // Blog is ready, but TTS still generating
        console.log(`📝 Blog ready, waiting for TTS audio... (attempt ${attempts}/${maxAttempts})`);
      }
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  // Timeout reached
  if (blogReady && !ttsReady) {
    throw new Error(
      `Blog generated successfully, but TTS audio timed out after ${maxAttempts} attempts. ` +
      `You can still view the blog, but audio may not be available.`
    );
  }

  throw new Error(
    `Blog generation timed out after ${maxAttempts} attempts (${
      (maxAttempts * intervalMs) / 1000
    } seconds)`
  );
}

/**
 * Send blog to email
 */
export async function sendBlogEmail(
  requestId: string,
  email: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/send-blog-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to send email",
      };
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Suggest blog metadata (keywords, target audience, additional context)
 * Uses AI to generate suggestions based on the topic
 */
export async function suggestBlogMetadata(
  topic: string
): Promise<{
  keywords: string[];
  targetAudience: string;
  additionalContext: string;
}> {
  try {
    console.log('🤖 Requesting metadata suggestions for:', topic);

    const response = await fetch(`${BACKEND_URL}/api/suggest-blog-metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Metadata suggestion error:', errorData);
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('✅ Metadata suggestions received:', data);
    return data;
  } catch (error) {
    console.error("❌ Error getting metadata suggestions:", error);
    throw error;
  }
}

// ========================================
// EMAIL GENERATION API FUNCTIONS
// ========================================

export interface EmailGenerationRequest {
  topic: string;
  emailType: 'marketing' | 'cold-outreach' | 'newsletter' | 'follow-up';
  keywords: string[];
  targetAudience?: string;
  additionalContext?: string;
  tone: 'professional' | 'casual' | 'formal' | 'friendly';
  // NEW: Optional enhancement fields
  industry?: 'saas' | 'ecommerce' | 'healthcare' | 'realestate' | 'finance' | 'education' | 'general';
  emojiEnabled?: boolean;
}

export interface EmailGenerationResponse {
  id: string;
  status: string;
  message?: string;
}

export interface EmailContentResponse {
  id: string;
  status: string;
  subject: string;
  subjectAlternatives: string[];
  body: string;
  emailType: string;
  callToAction?: string;
  metadata: {
    emailType: string;
    estimatedReadTime?: string;
    tone: string;
    keywords: string[];
  };
  generatedAt: string;
  // NEW: Optional enhancement fields
  preheaderText?: string;
  htmlBody?: string;
  emojiUsed?: boolean;
}

/**
 * Start email generation
 */
export async function generateEmail(
  request: EmailGenerationRequest
): Promise<EmailGenerationResponse> {
  try {
    console.log('🚀 Sending email generation request:', {
      url: `${BACKEND_URL}/api/generate-email`,
      payload: request
    });

    const response = await fetch(`${BACKEND_URL}/api/generate-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Backend error response:', errorData);
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('✅ Email generation started:', data);
    return data;
  } catch (error) {
    console.error("❌ Error generating email:", error);
    throw error;
  }
}

/**
 * Get email content by request ID
 * Returns 200 when ready, 404 when still processing
 */
export async function getEmailContent(
  requestId: string
): Promise<EmailContentResponse | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/email/${requestId}`);

    if (response.status === 404) {
      // Still generating
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching email content:", error);
    throw error;
  }
}

/**
 * Poll for email content until ready
 * No TTS for emails, so faster than blog polling
 * @param requestId The request ID to poll
 * @param maxAttempts Maximum number of polling attempts (default: 30)
 * @param intervalMs Polling interval in milliseconds (default: 3000)
 */
export async function pollEmailContent(
  requestId: string,
  maxAttempts = 30,
  intervalMs = 3000,
  onProgress?: (attempt: number, maxAttempts: number) => void
): Promise<EmailContentResponse> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;

    if (onProgress) {
      onProgress(attempts, maxAttempts);
    }

    const content = await getEmailContent(requestId);

    if (content) {
      console.log('✅ Email content ready!');
      return content;
    }

    console.log(`⏳ Email generating... (attempt ${attempts}/${maxAttempts})`);

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  // Timeout reached
  throw new Error(
    `Email generation timed out after ${maxAttempts} attempts (${
      (maxAttempts * intervalMs) / 1000
    } seconds)`
  );
}

/**
 * Send generated email to any recipient
 */
export async function sendGeneratedEmail(params: {
  requestId: string;
  recipientEmail: string;
  subjectLine: string;
  fromName?: string;
  body: string; // Plain text email body
  htmlBody?: string; // HTML email body (optional)
}): Promise<{ success: boolean; message?: string; messageId?: string; error?: string }> {
  try {
    console.log('📧 Sending generated email:', {
      ...params,
      bodyLength: params.body.length,
      hasHtml: !!params.htmlBody
    });

    const response = await fetch(`${BACKEND_URL}/api/send-generated-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to send email",
      };
    }

    console.log('✅ Email sent successfully:', data);
    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
