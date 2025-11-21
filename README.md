# AI Copywrite

<div align="center">
  <img src="./frontend/public/bannerImage.png" alt="AI Copywrite Banner" width="100%">

  <p><strong>AI-Powered Content Generation Platform</strong></p>
  <p>Create high-quality blog articles and marketing emails using Google's Gemini AI with integrated search capabilities, text-to-speech audio generation, and email delivery.</p>

  ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
  ![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
  ![Motia](https://img.shields.io/badge/Motia-0.8.3-green)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql)
</div>

---

## Live Demo

**[View Live Application](https://your-deployed-url.com)** (Update with your deployed URL)

---

## Features

- **AI-Powered Blog Generation** - Create comprehensive blog articles with 8 content templates (How-to, Listicles, Tutorials, Comparisons, Opinion, News, Guides, Case Studies)
- **Email Content Creation** - Generate marketing emails, cold outreach, newsletters, and follow-ups with industry-specific language
- **Google Search Integration** - Enhanced content with real-time web research and competitive analysis
- **Text-to-Speech Audio** - Automatic audio generation for blog posts using Gemini TTS (24kHz, professional voice)
- **Customization Options** - 6 tone styles, 6 writing styles, adjustable word count (100-10,000), and section configuration
- **Email Optimization** - A/B testing with 5 alternative subject lines, preheader text, HTML/plain-text versions
- **User Dashboard** - Manage, edit, search, and export all generated content
- **Email Delivery** - Send blog posts directly via Resend email service
- **Authentication** - Secure OAuth-based authentication with Stack Auth
- **Multi-User Support** - Per-user content isolation with PostgreSQL database

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16.0.1 with React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with PostCSS
- **Animation**: Framer Motion 12.23.24
- **Forms**: React Hook Form 7.66.0 with Zod validation
- **Authentication**: Stack Auth (@stackframe/stack)
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React, Tabler Icons, React Icons

### Backend
- **Framework**: Motia 0.8.3 (event-driven, type-safe backend framework)
- **Language**: TypeScript 5.7.3
- **Runtime**: Node.js
- **Plugins**:
  - @motiadev/plugin-endpoint (API endpoints)
  - @motiadev/plugin-states (State management)
  - @motiadev/plugin-logs (Logging)
  - @motiadev/plugin-observability (Monitoring)

### AI Services
- **Primary LLM**: Google Gemini 2.5-Pro with extended thinking
- **SDK**: @google/genai 1.28.0
- **Features**:
  - Blog content generation with Google Search integration
  - Email content generation with industry-specific language
  - Text-to-Speech using gemini-2.5-flash-preview-tts
  - Unlimited reasoning budget for extended thinking

### Database
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM 0.44.7
- **Authentication**: Neon Auth (automatic user sync)
- **Tables**: `blog_posts`, `neon_auth.users_sync`

### Additional Services
- **Email Provider**: Resend 6.4.0
- **Audio Processing**: lamejs 1.2.1 (MP3 encoding)
- **Validation**: Zod 3.24.4 (schema validation)

---

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (Neon account recommended)
- Google Gemini API key
- Resend API key
- Stack Auth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aicopywrite.git
   cd aicopywrite
   ```

2. **Install dependencies**
   ```bash
   # Backend
   npm install

   # Frontend
   cd frontend
   npm install
   cd ..
   ```

3. **Configure environment variables**

   **Backend** (`.env`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=your_sender_email@domain.com
   DATABASE_URL=postgresql://your_neon_connection_string
   NODE_ENV=development
   APP_PORT=3000
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
   NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
   NEXT_PUBLIC_STACK_PUBLIC_KEY=your_stack_public_key
   ```

4. **Run database migrations**
   ```bash
   cd frontend
   npm run db:push
   ```

5. **Start the application**
   ```bash
   # Terminal 1: Start backend
   npm run dev

   # Terminal 2: Start frontend
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000

---

## Motia Framework

AI Copywrite is built on **Motia**, an event-driven framework for building type-safe backend systems. The architecture uses steps that communicate through events:

### Event-Driven Architecture

```mermaid
graph TD
    A[HTTP POST /api/generate-content] --> B[GenerateContent API Step]
    B -->|emit: enhance-prompt| C[EnhancePrompt Event Step]
    C -->|emit: generate-content-with-search| D[GenerateContentWithSearch Event Step]
    D -->|emit: generate-tts| E[GenerateTTS Event Step]
    E --> F[Blog + Audio Stored in State]

    G[HTTP POST /api/generate-email] --> H[GenerateEmail API Step]
    H -->|emit: enhance-prompt| C
    C -->|emit: generate-content-with-search| I[GenerateEmailContent Event Step]
    I --> J[Email Stored in State]
```

### Step Types

1. **API Steps** - Entry points for HTTP requests
   - `GenerateContent` - POST /api/generate-content
   - `GenerateEmail` - POST /api/generate-email
   - `SendBlogEmail` - POST /api/send-blog-email

2. **Event Steps** - Background event processing
   - `EnhancePrompt` - Subscribes to "enhance-prompt" topic
   - `GenerateContentWithSearch` - Subscribes to "generate-content-with-search" topic (blog routing)
   - `GenerateEmailContent` - Subscribes to "generate-content-with-search" topic (email routing)
   - `GenerateTTS` - Subscribes to "generate-tts" topic

### State Management
- Uses Motia's state plugin for distributed state storage
- Keys: `blog:{requestId}`, `email:{requestId}`, `tts:{requestId}`
- Stores complete generated content with metadata
- Accessible across the workflow pipeline

### Workflow Process

1. **API Step** receives HTTP request, returns 202 Accepted immediately
2. Emits event to trigger **Event Step** pipeline
3. **Event Steps** process asynchronously (enhance, generate, audio)
4. Client polls `/api/get-content` or `/api/get-email` for status
5. Completed content retrieved from state and saved to database

---

## AI Functionalities

### Content Generation (Gemini 2.5-Pro)
- **Model**: gemini-2.5-pro with extended thinking (unlimited reasoning budget)
- **Features**:
  - Streaming responses aggregated into complete articles
  - 8 blog content templates with customizable parameters
  - Email generation with industry-specific language (SaaS, e-commerce, healthcare, real estate, finance, education)

### Google Search Integration
- Google Search tool integrated via Gemini API
- Used in both prompt enhancement and content generation steps
- Provides current information, trends, and competitive analysis
- Enhances content with keywords, search trends, and opportunities

### Text-to-Speech (Gemini TTS)
- **Model**: gemini-2.5-flash-preview-tts
- **Voice**: Kore (professional, natural sounding)
- **Output**: PCM audio, 24kHz sample rate, mono channel
- **Retry Logic**: Exponential backoff for rate limits
- **Graceful Degradation**: Blog still available if TTS fails

### Content Enhancement
- **Two-stage generation process**:
  1. **Stage 1**: Enhance user prompt with SEO research
  2. **Stage 2**: Generate polished content using enhanced brief
- Incorporates trending angles, targeted questions, and competitive insights

### Customization Options

**Blog Articles**:
- Tone: Professional, Casual, Formal, Friendly, Authoritative, Conversational
- Style: Informative, Persuasive, Educational, Storytelling, Technical, Creative
- Word Count: 100-10,000 words
- Sections: 1-20 sections
- Templates: How-to, Listicles, Tutorials, Comparisons, Opinion, News, Guides, Case Studies

**Emails**:
- Types: Marketing, Cold Outreach, Newsletter, Follow-up
- Industry: SaaS, E-commerce, Healthcare, Real Estate, Finance, Education
- Subject Lines: 5 A/B testing alternatives
- Preheader Text: 40-130 character optimization
- Formats: HTML and plain-text versions
- Optional Emoji Support

---

## Database Schema

### Blog Posts Table (`blog_posts`)
```sql
- id (UUID, PK)
- userId (FK to neon_auth.users_sync)
- type (varchar 10) - 'blog' or 'email'
- emailType (varchar 50) - optional email category
- subjectLine (text) - for emails
- requestId (varchar 100) - Motia request ID
- title (varchar 500)
- slug (varchar 600, unique)
- content (text)
- description (text)
- tone (varchar 100)
- audience (varchar 100)
- status (varchar 50, default: 'draft')
- industry (varchar 50) - optional
- preheaderText (text) - email optimization
- htmlContent (text) - email HTML version
- emojiUsed (varchar 10) - boolean flag
- audioData (text) - base64 encoded PCM
- audioUrl (text)
- audioDuration (integer) - seconds
- audioFileSize (integer) - bytes
- audioStatus (varchar 50)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### Neon Auth Users (Auto-synced by Stack Auth)
```sql
- id (text, PK)
- rawJson (text) - complete user profile
- name (text)
- email (text)
- createdAt (timestamp)
- deletedAt (timestamp)
- updatedAt (timestamp)
```

---

## API Endpoints

### Content Generation
- **POST** `/api/generate-content` - Generate blog article
- **POST** `/api/generate-email` - Generate marketing email
- **GET** `/api/get-content/:requestId` - Poll blog generation status
- **GET** `/api/get-email/:requestId` - Poll email generation status

### Email Delivery
- **POST** `/api/send-blog-email` - Send blog post via email

### Content Management (Frontend API Routes)
- **GET** `/api/blog-posts` - List all user's blog posts/emails
- **POST** `/api/blog-posts` - Create new blog post/email
- **GET** `/api/blog-posts/:id` - Get specific blog post/email
- **PATCH** `/api/blog-posts/:id` - Update blog post/email
- **DELETE** `/api/blog-posts/:id` - Delete blog post/email

---

## Project Structure

```
aicopywrite/
   src/                          # Backend source code
      config/
         templates.ts          # Content templates & prompts
      services/
         gemini/               # Google Gemini integration
            gemini.service.ts # Content generation
            tts.service.ts    # Text-to-speech
         email/
             resend.service.ts # Email delivery
      types/                    # TypeScript type definitions
         content.types.ts      # Blog/article schemas
         email.types.ts        # Email schemas
      utils/
          cors.ts               # CORS configuration
   steps/                        # Motia event/API steps
      generate-content.step.ts
      generate-email.step.ts
      enhance-prompt.step.ts
      generate-content-with-search.step.ts
      generate-email-content.step.ts
      generate-tts.step.ts
      send-blog-email.step.ts
   frontend/                     # Next.js frontend
      src/
         app/                  # Next.js app routes
         components/           # React components
         lib/                  # Utilities & API client
         db/                   # Database schema
         hooks/                # Custom React hooks
      package.json
   motia.config.ts               # Motia configuration
   package.json
   tsconfig.json
   railway.json                  # Railway deployment config
```

---

## Deployment

### Backend Deployment (Railway)
- **Platform**: Railway
- **Start Command**: `npm start` (runs `motia start`)
- **Build**: Nixpacks
- **Restart Policy**: ON_FAILURE with max 10 retries
- **Required Environment Variables**: See [Quick Start](#quick-start) section

### Frontend Deployment (Vercel/Railway)
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Required Environment Variables**: See [Quick Start](#quick-start) section

### Database Setup (Neon)
- Create a Neon serverless PostgreSQL database
- Configure Neon Auth for automatic user synchronization
- Run database migrations using Drizzle ORM

---

## Contributing

We welcome contributions to AI Copywrite! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow TypeScript best practices
   - Maintain Motia event-driven architecture patterns
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   # Backend
   npm test

   # Frontend
   cd frontend
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add: Brief description of your changes"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Include screenshots for UI changes

### Development Guidelines
- Use TypeScript for all new code
- Follow existing Motia step patterns (API steps, Event steps)
- Use Zod schemas for validation
- Implement proper error handling
- Add JSDoc comments for public functions
- Keep components small and focused

---

## Troubleshooting

### Common Issues

**1. Blog generation fails or times out**
- **Cause**: Gemini API rate limits or network issues
- **Solution**:
  - Check your GEMINI_API_KEY is valid
  - Retry the generation (rate limits reset quickly)
  - Reduce word count for faster generation

**2. Audio generation fails but blog is created**
- **Cause**: TTS rate limits or model availability
- **Solution**: This is expected behavior (graceful degradation). Blog content is still saved and usable. Try regenerating audio later.

**3. Email sending fails in testing mode**
- **Cause**: Resend testing mode restricts recipients
- **Solution**:
  - Verify recipient email in Resend dashboard
  - Upgrade to production mode for unrestricted sending
  - Check RESEND_API_KEY and RESEND_FROM_EMAIL are correct

**4. Database connection errors**
- **Cause**: Invalid DATABASE_URL or network issues
- **Solution**:
  - Verify Neon connection string format
  - Check database is active (Neon serverless may sleep)
  - Ensure IP allowlist includes your deployment IP

**5. Authentication redirect loops**
- **Cause**: Misconfigured Stack Auth credentials
- **Solution**:
  - Verify NEXT_PUBLIC_STACK_PROJECT_ID and NEXT_PUBLIC_STACK_PUBLIC_KEY
  - Check Stack Auth dashboard for correct redirect URLs
  - Clear browser cookies and try again

**6. CORS errors in development**
- **Cause**: Frontend and backend on different ports
- **Solution**:
  - Ensure NEXT_PUBLIC_BACKEND_URL points to correct backend URL
  - Check cors.ts configuration includes frontend origin
  - Restart both servers after environment variable changes

**7. TypeScript errors after updating dependencies**
- **Cause**: Type definition mismatches
- **Solution**:
  ```bash
  # Backend
  npx motia generate-types

  # Frontend
  cd frontend
  npm run db:push
  ```

**8. Polling never completes (stuck in "generating" status)**
- **Cause**: Event step failure or state not updating
- **Solution**:
  - Check backend logs for errors
  - Verify Motia state plugin is configured
  - Restart backend to clear stuck states

### Getting Help

If you encounter issues not covered here:
1. Check the [Motia documentation](https://motiadev.com/docs)
2. Review backend logs for error messages
3. Open an issue on GitHub with:
   - Error message and stack trace
   - Steps to reproduce
   - Environment details (Node version, OS, etc.)

---

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/aicopywrite/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/aicopywrite/discussions)
- **Motia Documentation**: [https://motiadev.com/docs](https://motiadev.com/docs)
- **Stack Auth Docs**: [https://docs.stack-auth.com](https://docs.stack-auth.com)

---

## Acknowledgments

Built with:
- [Motia](https://motiadev.com) - Event-driven backend framework
- [Google Gemini](https://ai.google.dev/) - AI content generation
- [Next.js](https://nextjs.org/) - React framework
- [Stack Auth](https://stack-auth.com/) - Authentication
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Resend](https://resend.com/) - Email delivery

---

<div align="center">
  Made with AI and Motia Framework
</div>
