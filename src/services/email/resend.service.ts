import { Resend } from 'resend';
import { BlogArticle } from '../../types/content.types';

/**
 * Resend Email Service
 * Handles sending blog articles via email using Resend API
 */
export class ResendEmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(apiKey: string, fromEmail: string) {
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required');
    }
    if (!fromEmail) {
      throw new Error('RESEND_FROM_EMAIL is required');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = fromEmail;
  }

  /**
   * Send blog article via email
   */
  async sendBlogArticle(toEmail: string, article: BlogArticle): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Convert article to beautiful HTML
      const htmlContent = this.convertArticleToHTML(article);

      // Send email via Resend
      const data = await this.resend.emails.send({
        from: this.fromEmail,
        to: toEmail,
        subject: `Your AI-Generated Blog: ${article.title}`,
        html: htmlContent
      });

      return {
        success: true,
        messageId: data.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  }

  /**
   * Convert BlogArticle to beautiful HTML email
   */
  private convertArticleToHTML(article: BlogArticle): string {
    // Build sections HTML
    const sectionsHTML = article.sections
      .map(section => `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1a202c; font-size: 24px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            ${this.escapeHtml(section.heading)}
          </h2>
          <div style="color: #4a5568; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">
            ${this.markdownToHtml(section.content)}
          </div>
        </div>
      `)
      .join('');

    // Build full email HTML
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(article.title)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7fafc;">
  <div style="max-width: 680px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; line-height: 1.3;">
        ✨ Your AI-Generated Blog Article
      </h1>
      <p style="color: #e6e6ff; font-size: 16px; margin: 15px 0 0 0;">
        Generated with AI-powered research and Google Search insights
      </p>
    </div>

    <!-- Main Content -->
    <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

      <!-- Article Title -->
      <h1 style="color: #1a202c; font-size: 36px; font-weight: 700; margin-bottom: 20px; line-height: 1.2;">
        ${this.escapeHtml(article.title)}
      </h1>

      <!-- Metadata -->
      <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
        <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 14px; color: #4a5568;">
          <div>
            <strong>📝 Word Count:</strong> ${article.wordCount || 'N/A'}
          </div>
          <div>
            <strong>📅 Generated:</strong> ${article.generatedAt ? new Date(article.generatedAt).toLocaleDateString() : 'Today'}
          </div>
          <div>
            <strong>🔑 Keywords:</strong> ${article.metadata.keywords.slice(0, 5).join(', ')}
          </div>
        </div>
      </div>

      <!-- Introduction -->
      ${article.introduction ? `
        <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
          <p style="color: #334155; font-size: 18px; line-height: 1.8; margin: 0; white-space: pre-wrap;">
            ${this.markdownToHtml(article.introduction)}
          </p>
        </div>
      ` : ''}

      <!-- Sections -->
      <div style="margin: 30px 0;">
        ${sectionsHTML}
      </div>

      <!-- Conclusion -->
      ${article.conclusion ? `
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-top: 30px; border-radius: 4px;">
          <h3 style="color: #92400e; font-size: 20px; font-weight: 600; margin: 0 0 15px 0;">
            ✅ Conclusion
          </h3>
          <p style="color: #78350f; font-size: 16px; line-height: 1.8; margin: 0; white-space: pre-wrap;">
            ${this.markdownToHtml(article.conclusion)}
          </p>
        </div>
      ` : ''}

      <!-- SEO Keywords -->
      <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e2e8f0;">
        <h4 style="color: #64748b; font-size: 14px; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">
          SEO Keywords
        </h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${article.metadata.keywords.map(keyword => `
            <span style="background-color: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 16px; font-size: 13px; font-weight: 500;">
              ${this.escapeHtml(keyword)}
            </span>
          `).join('')}
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 30px 20px; color: #64748b; font-size: 14px;">
      <p style="margin: 0 0 10px 0;">
        This blog article was generated using AI-powered content creation with Google Search integration.
      </p>
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        Generated by AI Copywriting Platform
      </p>
    </div>

  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Basic markdown to HTML conversion
   */
  private markdownToHtml(text: string): string {
    return text
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.+?)`/g, '<code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 14px;">$1</code>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #3b82f6; text-decoration: underline;">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p style="margin: 15px 0;">')
      .replace(/\n/g, '<br>');
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }
}

/**
 * Factory function to create ResendEmailService
 */
export function createResendEmailService(): ResendEmailService {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  if (!fromEmail) {
    throw new Error('RESEND_FROM_EMAIL environment variable is not set');
  }

  return new ResendEmailService(apiKey, fromEmail);
}
