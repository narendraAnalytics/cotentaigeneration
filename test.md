✅ **Phase 1: Setup** - COMPLETED
  - Removed pet store files
  - Installed Gemini SDK (@google/genai v1.28.0)
  - Created folder structure
  - Set up environment files (.env with GEMINI_API_KEY)

---

✅ **Phase 2: Foundation Services** - COMPLETED

  ✅ **Option A**: TypeScript Type Definitions
  - Created `src/types/content.types.ts`
  - Defined Zod schemas: ContentRequest, BlogArticle, GenerationOptions
  - All types compatible with Motia patterns

  ✅ **Option B**: Gemini Service
  - Created `src/services/gemini/gemini.service.ts`
  - Implemented `generateBlogContent()` method
  - Uses gemini-2.5-pro model with streaming
  - Includes prompt building and content parsing

  ✅ **Option C**: Template Configurations
  - Created `src/config/templates.ts`
  - 8 content type templates (how-to, listicle, tutorial, comparison, etc.)
  - Tone & style presets
  - Helper functions for template usage

---

🚀 **Phase 3: Motia Integration**

Next steps - Create Motia Steps:
  - **Option A**: Create API Step to handle blog generation requests (HTTP endpoint)
  - **Option B**: Create Event Step for async content generation
  - **Option C**: Create both and connect them (API triggers Event)

Which would you like to start with?

🚀 **Phase 3: Motia Integration** - IN PROGRESS

### Workflow Architecture:

**Complete Flow:**
```
User Request
  ↓
API Step (HTTP Endpoint)
  ↓
Event Step 1: Enhance Prompt (Gemini + Google Search)
  ↓
Event Step 2: Generate Content (Gemini + Google Search)
  ↓
BlogArticle Response
```

---

### Step-by-Step Implementation Plan:

#### **Step 3.1: API Step** - `steps/generate-content.step.ts`
**Status**: PENDING

**Purpose**: HTTP endpoint to receive blog generation requests

**Configuration:**
- Route: `POST /api/generate-content`
- Method: POST
- Body Schema: `ContentRequestSchema` (topic, keywords, options)
- Response Schema:
  - 202 Accepted: `{ id: string, status: string, message: string }`
  - 400 Bad Request: `{ error: string }`
  - 500 Internal Error: `{ error: string }`
- Emits to: `enhance-prompt` topic

**Handler Logic:**
1. Validate incoming request (Zod auto-validation)
2. Generate unique request ID
3. Log request details
4. Emit event to `enhance-prompt` topic with request data
5. Return 202 Accepted response (async processing)

**Type**: API Step (Entry Point)

---

#### **Step 3.2: Event Step 1** - `steps/enhance-prompt.step.ts`
**Status**: PENDING

**Purpose**: Enhance user prompt using Gemini AI + Google Search

**Configuration:**
- Type: Event Step
- Subscribes to: `enhance-prompt` topic
- Input Schema: `ContentRequestSchema`
- Emits to: `generate-content-with-search` topic

**Handler Logic:**
1. Receive original content request
2. Use Gemini AI + Google Search to:
   - Analyze the topic for SEO opportunities
   - Research current trends and latest information
   - Enhance keywords with related terms
   - Expand the prompt with context
3. Build enhanced prompt with research insights
4. Emit to `generate-content-with-search` with enhanced data

**Features:**
- Uses Google Search tool for latest info
- Enhances user input intelligently
- Adds SEO and trend insights

**Type**: Event Step (Background Task)

---

#### **Step 3.3: Event Step 2** - `steps/generate-content-with-search.step.ts`
**Status**: PENDING

**Purpose**: Generate final blog content using enhanced prompt + Google Search

**Configuration:**
- Type: Event Step
- Subscribes to: `generate-content-with-search` topic
- Input Schema: Enhanced content request
- Emits to: (optional) `content-generated` topic for notifications

**Handler Logic:**
1. Receive enhanced prompt and request data
2. Use Gemini AI + Google Search to:
   - Research latest information on the topic
   - Generate comprehensive blog article
   - Include current data, statistics, trends
   - Follow requested tone, style, word count
3. Parse response into `BlogArticle` structure
4. Save or return the generated content
5. (Optional) Emit completion event

**Features:**
- Uses Google Search for up-to-date information
- Generates SEO-optimized content
- Follows template configurations
- Returns structured BlogArticle

**Type**: Event Step (Background Task)

---

### Technical Details:

**Gemini Configuration for All Steps:**
```typescript
- Model: gemini-2.5-pro
- Tools: [{ googleSearch: {} }]
- Thinking Budget: -1 (unlimited reasoning)
```

**Topics/Events:**
1. `enhance-prompt` - Triggered by API Step
2. `generate-content-with-search` - Triggered by Step 1
3. `content-generated` - (Optional) Completion notification

**Files to Create:**
- `steps/generate-content.step.ts` (API Step)
- `steps/enhance-prompt.step.ts` (Event Step)
- `steps/generate-content-with-search.step.ts` (Event Step)

---

### Next Action:
Start with **Step 3.1**: Create API Step (`steps/generate-content.step.ts`)


Tech Stack Recommendations

  Option 1: Next.js + React (Recommended)
  - Modern, fast, SEO-friendly
  - Server-side rendering
  - Built-in routing
  - TypeScript support
  - Easy deployment (Vercel)

Frontend Pages/Components

  1. Home Page

  - Hero section with description
  - "Generate Blog" call-to-action button
  - Features overview (AI-powered, Google Search, Email delivery)
  - Example blog topics

  2. Blog Generator Page (Main Feature)

  - Input Form:
    - Topic (text input)
    - Keywords (tag input - add multiple)
    - Target audience (text input)
    - Additional context (textarea)
    - Options:
        - Tone (dropdown: professional, casual, friendly)
      - Style (dropdown: informative, persuasive, storytelling)
      - Word count (slider: 800-2000)
      - Section count (number input)
  - Generation Status:
    - Loading animation during generation (~60 seconds)
    - Progress indicator showing:
        - "Enhancing prompt with AI research..." ⏳
      - "Generating blog with Google Search..." 📝
      - "Complete!" ✅
  - Result Display:
    - Show generated blog article
    - Title, sections, introduction, conclusion
    - Keywords displayed as tags
    - Word count and metadata

  3. Blog Preview/Display Page

  - Full article view
  - Formatted with proper headings
  - Syntax highlighting for code (if any)
  - Action Buttons:
    - 📧 Send to Email (opens modal)
    - 📋 Copy to Clipboard
    - 💾 Download as Markdown
    - 🔄 Generate Another

  4. Email Modal/Dialog

  - Email input field (with validation)
  - Preview of what will be sent
  - "Send Email" button
  - Success/error feedback

  5. History/Dashboard (Optional)

  - List of previously generated blogs
  - Filter by date, topic
  - Quick actions (view, email, delete)

  User Flow

  Landing Page
      ↓
  [Generate Blog Button]
      ↓
  Blog Generator Form
      ↓
  Fill inputs & click "Generate"
      ↓
  Loading Screen (60 seconds)
      ↓
  Blog Preview Page
      ↓
  [Send to Email] → Email Modal → Success Message
  [Copy/Download] → Direct action
  [Generate Another] → Back to form

  Key Features

  1. Real-time Generation Status
  - WebSocket or polling to show live progress
  - Show which step is running (Enhance → Generate)
  - Estimated time remaining

  2. Form Validation
  - Validate email format
  - Require topic and at least 2 keywords
  - Character limits for inputs

  3. Responsive Design
  - Mobile-friendly
  - Tablet optimized
  - Desktop experience

  4. User Experience
  - Auto-save form inputs (localStorage)
  - Clear error messages
  - Loading states for all async operations
  - Toast notifications for success/errors

  5. Email Preview
  - Show sample of how email will look
  - Validate email before sending
  - Confirmation message after sending

  API Integration Points

  Your frontend will call these endpoints:

  POST /api/generate-content
    → Submit blog generation request
    → Returns requestId

  GET /api/content/:requestId
    → Poll for blog status
    → Returns blog when ready (or 404 if still generating)

  POST /api/send-blog-email
    → Send blog via email
    → Returns success/error

  UI Components Needed

  1. Header/Navigation
    - Logo
    - Navigation menu
    - "New Blog" button
  2. Blog Form
    - Text inputs
    - Tag input for keywords
    - Dropdowns for tone/style
    - Sliders for word count
    - Advanced options (collapsible)
  3. Loading Component
    - Animated spinner
    - Progress bar
    - Status messages
  4. Blog Display Card
    - Article title
    - Metadata badges
    - Action buttons
    - Formatted content
  5. Email Modal
    - Email input with validation
    - Send button
    - Loading state
  6. Toast Notifications
    - Success messages
    - Error messages
    - Info messages

  Styling Options

  Option 1: Tailwind CSS (Recommended)
  - Fast development
  - Utility-first
  - Highly customizable
  - Modern design

  Option 2: Material UI / shadcn/ui
  - Pre-built components
  - Consistent design system
  - Accessible

  Option 3: Custom CSS
  - Full control
  - Lighter weight
  - More work

  Additional Features to Consider

  1. Dark Mode Toggle
  2. Blog Templates (pre-fill common topics)
  3. Export Options (PDF, Word, Markdown)
  4. Social Sharing (LinkedIn, Twitter)
  5. Blog Analytics (word count, readability score)
  6. Multiple Language Support
  7. SEO Preview (how it looks in Google)
  8. Image Generation (AI-generated header images)

  Folder Structure (Example for Next.js)

  frontend/
  ├── app/
  │   ├── page.tsx              # Home page
  │   ├── generate/
  │   │   └── page.tsx          # Blog generator
  │   ├── blog/
  │   │   └── [id]/
  │   │       └── page.tsx      # Blog view page
  │   └── layout.tsx            # Root layout
  ├── components/
  │   ├── BlogForm.tsx
  │   ├── BlogPreview.tsx
  │   ├── EmailModal.tsx
  │   ├── LoadingStatus.tsx
  │   └── Header.tsx
  ├── lib/
  │   ├── api.ts               # API client
  │   └── types.ts             # TypeScript types
  └── public/
      └── assets/

  Deployment Options

  1. Vercel (Recommended for Next.js)
  2. Netlify (Good for React/Vite)
  3. GitHub Pages (Static sites)
  4. Same server as backend (Serve static files from Motia)

  ---
  Questions for You:

  1. Which tech stack do you prefer? (Next.js, React+Vite, or plain HTML/JS)
  2. Design style? (Modern/minimal, colorful, professional/corporate)
  3. Advanced features needed? (Dashboard, history, analytics)
  4. Single page or multiple pages?
  5. Do you want me to start building it?  

 Create a new /frontend folder with Next.js 15 + React + TypeScript + Tailwind CSS. Initialize the app with:                       │ ││ │ 1. Three pages: Home, Blog Generator, and Blog View                                                                               │ ││ │ 2. Five components: BlogForm, BlogPreview, EmailModal, LoadingStatus, Header                                                      │ ││ │ 3. API client configured to connect to backend at http://localhost:3000                                                           │ ││ │ 4. All features from test.md: real-time status, form validation, email modal, responsive design                                   │ ││ │ 5. Frontend will run on port 3001 (separate from backend on port 3000)                                                            │ ││ │                                                                                                                                   │ ││ │ Zero changes to backend - all existing files remain untouched and working.

---

# Deployment Guide

## Overview

Current Setup (Development):
```
Frontend (localhost:3001) → Backend (localhost:3000)
```

After Deployment:
```
Frontend (Vercel) → Backend (Motia Cloud)
```

---

## Backend Deployment to Motia Cloud

### What Motia Handles Automatically:
- ✅ Deploys your backend code
- ✅ Runs `motia build` and starts server
- ✅ Provides a production URL (e.g., `https://your-app.motia.cloud`)
- ✅ Manages scaling and infrastructure
- ✅ Environment variables management

### Backend Deployment Steps:

**Step 1: Deploy to Motia**
```bash
# In root directory
motia deploy

# Motia will give you a URL like:
# ✅ Deployed to: https://your-app.motia.cloud
```

**Step 2: Configure Environment Variables**
In Motia Cloud Dashboard, set:
```
GEMINI_API_KEY=your_key_here
RESEND_API_KEY=your_key_here
```
⚠️ Important: Do NOT commit `.env` file to git. Set these in Motia's dashboard.

**Step 3: Configure CORS (if needed)**
Update `motia.config.ts` if you need to allow frontend domain:
```typescript
// motia.config.ts
{
  cors: {
    allowedOrigins: ['https://your-frontend-domain.vercel.app']
  }
}
```

---

## Frontend Changes After Backend Deployment

### Only ONE File Needs Updating:

**File:** `frontend/lib/api.ts`

**Before (Development):**
```typescript
const API_BASE_URL = 'http://localhost:3000';
```

**After (Production):**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-app.motia.cloud';
```

### Frontend Environment Variable:

Create `frontend/.env.local`:
```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Production (set in Vercel dashboard)
NEXT_PUBLIC_API_URL=https://your-app.motia.cloud
```

---

## Frontend Deployment (Vercel)

**Step 1: Push to GitHub**
```bash
git add frontend/
git commit -m "Add Next.js frontend"
git push origin main
```

**Step 2: Deploy on Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set Root Directory to `frontend/`
4. Add environment variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-app.motia.cloud`
5. Deploy!

**Alternative: Vercel CLI**
```bash
cd frontend
npm install -g vercel
vercel deploy
```

---

## Summary of Changes Needed

| Component | What Changes | Where |
|-----------|-------------|-------|
| **Backend Code** | ❌ None | Already production-ready |
| **Backend .env** | ✅ Move to Motia Dashboard | Set GEMINI_API_KEY, RESEND_API_KEY |
| **Frontend API Client** | ✅ Update API URL | `frontend/lib/api.ts` or `.env.local` |
| **CORS** | ✅ Maybe add allowed origins | `motia.config.ts` (if needed) |

---

## Best Practice: Environment-Aware Configuration

### Backend (Already Works - No Changes Needed):
```typescript
// Your backend already uses process.env correctly
const apiKey = process.env.GEMINI_API_KEY;
const resendKey = process.env.RESEND_API_KEY;
```

### Frontend (Use Environment Variables):
```typescript
// frontend/lib/api.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||  // Production
  'http://localhost:3000';             // Development fallback

export const api = {
  async generateBlog(data: ContentRequest) {
    const response = await fetch(`${API_BASE_URL}/api/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async getBlogStatus(requestId: string) {
    const response = await fetch(`${API_BASE_URL}/api/content/${requestId}`);
    return response.json();
  },

  async sendEmail(requestId: string, email: string) {
    const response = await fetch(`${API_BASE_URL}/api/send-blog-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, email })
    });
    return response.json();
  }
};
```

**This way:**
- **Local dev**: Frontend uses `localhost:3000`
- **Production**: Frontend uses `https://your-app.motia.cloud`
- **No code changes** between environments

---

## Testing Before Full Deployment

You can test with deployed backend + local frontend:

**Step 1: Deploy Backend**
```bash
motia deploy
# Get URL: https://your-app.motia.cloud
```

**Step 2: Update Frontend Locally**
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://your-app.motia.cloud
```

**Step 3: Run Frontend Locally**
```bash
cd frontend
npm run dev
# Visit http://localhost:3001
```

**Test Flow:**
```
Frontend (localhost:3001) → Backend (Motia Cloud)
```

This allows you to:
- ✅ Test backend in production environment
- ✅ Debug frontend locally
- ✅ Verify API calls work with production URL
- ✅ Check CORS configuration
- ✅ Test email sending with production keys

---

## Deployment Checklist

### Before Deploying:
- [ ] Test backend locally: `npm run dev`
- [ ] Test frontend locally: `cd frontend && npm run dev`
- [ ] Test complete workflow with `test-complete-workflow-with-email.js`
- [ ] Verify `.env` has GEMINI_API_KEY and RESEND_API_KEY
- [ ] Check `.gitignore` includes `.env` (don't commit secrets!)

### Backend Deployment:
- [ ] Run `motia deploy`
- [ ] Copy production URL (e.g., `https://your-app.motia.cloud`)
- [ ] Set environment variables in Motia dashboard
- [ ] Test API endpoint: `curl https://your-app.motia.cloud/api/generate-content`
- [ ] Configure CORS if needed

### Frontend Deployment:
- [ ] Update `frontend/.env.local` with production API URL
- [ ] Test locally against production backend
- [ ] Push code to GitHub
- [ ] Deploy on Vercel
- [ ] Set `NEXT_PUBLIC_API_URL` in Vercel dashboard
- [ ] Test production frontend

### Post-Deployment:
- [ ] Test full workflow: Generate blog → View → Send email
- [ ] Check email delivery works
- [ ] Verify all form validations
- [ ] Test on mobile/tablet/desktop
- [ ] Monitor Motia logs for errors

---

## Common Issues & Solutions

### Issue: CORS errors in production
**Solution:** Add frontend domain to CORS config in `motia.config.ts`
```typescript
cors: {
  allowedOrigins: ['https://your-app.vercel.app']
}
```

### Issue: API calls fail with 404
**Solution:** Check `NEXT_PUBLIC_API_URL` is set correctly in Vercel

### Issue: Environment variables not working
**Solution:**
- Backend: Set in Motia dashboard (not `.env`)
- Frontend: Must start with `NEXT_PUBLIC_` in Next.js

### Issue: Email not sending in production
**Solution:** Verify `RESEND_API_KEY` is set in Motia dashboard

---

## Running Locally After Setup

### Terminal 1 - Backend
```bash
npm run dev
# Runs on http://localhost:3000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3001
```

### Test Script
```bash
node test-complete-workflow-with-email.js your-email@example.com
```

---

## Useful Commands

```bash
# Backend
npm run dev              # Start development server
motia deploy            # Deploy to Motia Cloud
motia logs              # View production logs
motia generate-types    # Regenerate TypeScript types
motia workbench         # Open visual workflow designer

# Frontend
cd frontend
npm run dev             # Start development server
npm run build           # Build for production
npm run start           # Run production build locally
vercel deploy           # Deploy to Vercel

# Testing
node test-api.js                                      # Test API endpoint
node test-complete-workflow.js                        # Test full workflow
node test-complete-workflow-with-email.js email@test.com  # Test with email
node test-email.js email@test.com REQUEST_ID         # Test email only
```

---

**TL;DR for Deployment:**

1. **Backend**: Run `motia deploy`, set env vars in dashboard → Get production URL
2. **Frontend**: Update API URL in `frontend/lib/api.ts` → Deploy to Vercel
3. **Zero backend code changes required!** 🎉

---

# 🎯 Next Steps: What to Build Next?

## Current Status ✅

**What's Working:**
- ✅ Blog generation with Gemini AI + Google Search
- ✅ TTS audio generation with Gemini TTS
- ✅ Email delivery with Resend
- ✅ Event-driven workflow with Motia
- ✅ State storage for blogs and audio
- ✅ Audio download endpoint (WAV format)
- ✅ Complete backend API ready

**Current Limitations:**
- ❌ No user interface (only test scripts)
- ❌ No user authentication
- ❌ No persistent database (using state storage)
- ❌ No user history/dashboard
- ❌ No multi-user support

---

## Decision Point: What's Next?

### Option 1: Build Frontend First ⭐ RECOMMENDED

**Pros:**
- ✅ See results immediately (working UI)
- ✅ Backend already fully functional
- ✅ Can use existing state storage
- ✅ Add database/auth later when needed
- ✅ Faster to MVP

**Cons:**
- ⚠️ No user accounts initially
- ⚠️ Limited to single-user testing
- ⚠️ Blog history not persistent

**Best For:**
- Quick prototype/demo
- Testing user experience
- Iterating on UI/UX
- Getting feedback fast

**Timeline:** 1-2 days to working frontend

---

### Option 2: Database & Auth First

**Pros:**
- ✅ Production-ready architecture
- ✅ Multi-user support from start
- ✅ Persistent blog history
- ✅ User accounts and profiles
- ✅ Better for scalability

**Cons:**
- ⚠️ More setup time
- ⚠️ No visual results yet
- ⚠️ Requires migration from state storage

**Best For:**
- Production deployment
- Multi-user platform
- SaaS business model
- Enterprise use case

**Timeline:** 2-3 days for db setup + frontend

---

### Option 3: Hybrid Approach (Recommended) 🎯

**Phase A: Basic Frontend (1-2 days)**
- Build UI with existing backend
- Use current state storage
- Test user experience
- Get working prototype

**Phase B: Add Database (1-2 days)**
- Set up Neon database
- Add authentication
- Migrate to persistent storage
- Add user dashboard/history

**Benefits:**
- ✅ Fast initial results
- ✅ Gradual complexity increase
- ✅ Can pivot based on feedback
- ✅ Production-ready end result

---

# Phase 4: Database & Authentication with Neon

## 4.1 Why Neon Database?

**Neon Benefits:**
- ⚡ Serverless Postgres (no server management)
- 🔄 Automatic scaling
- 💰 Free tier available
- 🚀 Fast cold starts
- 🔐 Built-in connection pooling
- 🌐 Edge-ready
- 📊 Branching for dev/staging/prod

**Use Cases:**
- User authentication & profiles
- Persistent blog storage
- User blog history
- TTS audio library
- Analytics & metrics
- Favorites/bookmarks

---

## 4.2 Neon Setup Guide

### Step 1: Create Neon Account & Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up / Log in
3. Create new project:
   - Project name: `aicopywrite`
   - Region: Choose closest to users
   - Postgres version: Latest (16)
4. Copy connection string:
   ```
   postgresql://user:password@host/database?sslmode=require
   ```

### Step 2: Install Dependencies

```bash
# Choose your ORM:

# Option A: Drizzle ORM (Recommended - TypeScript-first)
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Option B: Prisma ORM (More features, heavier)
npm install prisma @prisma/client
npx prisma init

# For Auth (later)
npm install next-auth @auth/drizzle-adapter
```

### Step 3: Environment Variables

Add to `.env`:
```bash
# Existing
GEMINI_API_KEY=your_key
RESEND_API_KEY=your_key

# New - Neon Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@host/database?sslmode=require&pgbouncer=false
```

---

## 4.3 Database Schema Design

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255), -- if using email/password auth
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  credits_remaining INT DEFAULT 10, -- for usage limits
  preferences JSONB DEFAULT '{}' -- user settings
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Blog Posts Table

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Request data
  topic VARCHAR(500) NOT NULL,
  keywords TEXT[], -- Postgres array
  target_audience VARCHAR(255),
  additional_context TEXT,

  -- Generation options
  tone VARCHAR(50),
  style VARCHAR(50),
  word_count INT,
  section_count INT,

  -- Generated content
  title VARCHAR(500),
  introduction TEXT,
  sections JSONB, -- Array of {heading, content, order}
  conclusion TEXT,
  full_content TEXT, -- Markdown
  metadata JSONB, -- {keywords, seo_description, etc}

  -- Status & timestamps
  status VARCHAR(50) DEFAULT 'pending', -- pending, generating, completed, failed
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  generation_duration INT, -- seconds

  -- Usage tracking
  word_count_actual INT,
  tokens_used INT,
  model_used VARCHAR(50) DEFAULT 'gemini-2.5-pro'
);

CREATE INDEX idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_keywords ON blog_posts USING GIN(keywords);
```

### TTS Audio Table

```sql
CREATE TABLE tts_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Audio data (consider object storage for production)
  audio_data TEXT, -- Base64 or URL to cloud storage (S3, Cloudflare R2)
  format VARCHAR(10) DEFAULT 'wav',
  sample_rate INT DEFAULT 24000,
  channels INT DEFAULT 1,
  duration_seconds FLOAT,
  file_size_bytes INT,

  -- TTS config
  voice_name VARCHAR(50) DEFAULT 'Kore',
  model_used VARCHAR(50) DEFAULT 'gemini-2.5-flash-preview-tts',

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, generating, completed, failed
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT
);

CREATE INDEX idx_tts_audio_blog_post_id ON tts_audio(blog_post_id);
CREATE INDEX idx_tts_audio_user_id ON tts_audio(user_id);
CREATE INDEX idx_tts_audio_created_at ON tts_audio(created_at);
```

### Usage Analytics Table (Optional)

```sql
CREATE TABLE usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  action_type VARCHAR(50) NOT NULL, -- generate_blog, generate_tts, send_email
  resource_id UUID, -- blog_post_id or tts_audio_id

  metadata JSONB, -- {topic, word_count, duration, etc}

  credits_consumed INT DEFAULT 1,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX idx_usage_analytics_timestamp ON usage_analytics(timestamp);
CREATE INDEX idx_usage_analytics_action_type ON usage_analytics(action_type);
```

---

## 4.4 Drizzle ORM Setup (Recommended)

### Step 1: Create Schema File

**File:** `src/db/schema.ts`

```typescript
import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, real, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLogin: timestamp('last_login'),
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'),
  creditsRemaining: integer('credits_remaining').default(10),
  preferences: jsonb('preferences').default({}),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
}));

// Blog posts table
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),

  topic: varchar('topic', { length: 500 }).notNull(),
  keywords: text('keywords').array(),
  targetAudience: varchar('target_audience', { length: 255 }),
  additionalContext: text('additional_context'),

  tone: varchar('tone', { length: 50 }),
  style: varchar('style', { length: 50 }),
  wordCount: integer('word_count'),
  sectionCount: integer('section_count'),

  title: varchar('title', { length: 500 }),
  introduction: text('introduction'),
  sections: jsonb('sections'),
  conclusion: text('conclusion'),
  fullContent: text('full_content'),
  metadata: jsonb('metadata'),

  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  generationDuration: integer('generation_duration'),

  wordCountActual: integer('word_count_actual'),
  tokensUsed: integer('tokens_used'),
  modelUsed: varchar('model_used', { length: 50 }).default('gemini-2.5-pro'),
}, (table) => ({
  userIdIdx: index('idx_blog_posts_user_id').on(table.userId),
  statusIdx: index('idx_blog_posts_status').on(table.status),
}));

// TTS audio table
export const ttsAudio = pgTable('tts_audio', {
  id: uuid('id').primaryKey().defaultRandom(),
  blogPostId: uuid('blog_post_id').references(() => blogPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),

  audioData: text('audio_data'),
  format: varchar('format', { length: 10 }).default('wav'),
  sampleRate: integer('sample_rate').default(24000),
  channels: integer('channels').default(1),
  durationSeconds: real('duration_seconds'),
  fileSizeBytes: integer('file_size_bytes'),

  voiceName: varchar('voice_name', { length: 50 }).default('Kore'),
  modelUsed: varchar('model_used', { length: 50 }).default('gemini-2.5-flash-preview-tts'),

  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),
}, (table) => ({
  blogPostIdIdx: index('idx_tts_audio_blog_post_id').on(table.blogPostId),
  userIdIdx: index('idx_tts_audio_user_id').on(table.userId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  blogPosts: many(blogPosts),
  ttsAudio: many(ttsAudio),
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [blogPosts.userId],
    references: [users.id],
  }),
  ttsAudio: many(ttsAudio),
}));

export const ttsAudioRelations = relations(ttsAudio, ({ one }) => ({
  blogPost: one(blogPosts, {
    fields: [ttsAudio.blogPostId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [ttsAudio.userId],
    references: [users.id],
  }),
}));
```

### Step 2: Database Client

**File:** `src/db/client.ts`

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

### Step 3: Drizzle Config

**File:** `drizzle.config.ts` (in root)

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Step 4: Run Migrations

```bash
# Generate migration files
npx drizzle-kit generate

# Push to database
npx drizzle-kit push

# Or migrate
npx drizzle-kit migrate
```

---

## 4.5 Authentication Setup

### Option A: NextAuth.js (Recommended)

**Install:**
```bash
npm install next-auth @auth/drizzle-adapter
```

**File:** `frontend/app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db/client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
});

export { handlers as GET, handlers as POST };
```

### Option B: Neon Authorize (Simpler)

**Install:**
```bash
npm install @neondatabase/authorize
```

**Use Neon's built-in auth** - simpler but less flexible than NextAuth.

---

## 4.6 Migration Strategy: State Storage → Database

### Current State (Using Motia State):
```typescript
await state.set('blog', requestId, blogData);
await state.get('blog', requestId);
```

### After Database:
```typescript
import { db } from '../db/client';
import { blogPosts } from '../db/schema';

// Save blog
await db.insert(blogPosts).values({
  userId: user.id,
  topic: input.topic,
  keywords: input.keywords,
  // ... other fields
});

// Get blog
const blog = await db.query.blogPosts.findFirst({
  where: eq(blogPosts.id, requestId),
  with: {
    ttsAudio: true,
  },
});
```

### Migration Steps:

**1. Add database alongside state (gradual migration)**
**2. Keep both during transition**
**3. Update steps to write to database**
**4. Remove state storage once verified**

---

## 4.7 Database vs State Storage Comparison

| Feature | State Storage | Neon Database |
|---------|--------------|---------------|
| **Speed** | ⚡ Very fast | ⚡ Fast |
| **Persistence** | ⚠️ May be cleared | ✅ Permanent |
| **Querying** | ❌ Limited | ✅ Full SQL |
| **Multi-user** | ❌ Not designed for it | ✅ Perfect |
| **Relationships** | ❌ Manual | ✅ Foreign keys |
| **History** | ⚠️ Manual tracking | ✅ Built-in |
| **Auth** | ❌ None | ✅ User accounts |
| **Scale** | ⚠️ Single instance | ✅ Serverless |
| **Cost** | ✅ Free (included) | ✅ Free tier |

---

# Phase 5: Frontend Development

## 5.1 Tech Stack

**Framework:** Next.js 15 (App Router)
**UI Library:** React 18+
**Styling:** Tailwind CSS
**Language:** TypeScript
**Forms:** React Hook Form + Zod
**State:** React Context / Zustand (light)
**HTTP Client:** Fetch API (native)

---

## 5.2 Quick Start

### Create Frontend

```bash
# In project root
npx create-next-app@latest frontend
# ✔ TypeScript? Yes
# ✔ ESLint? Yes
# ✔ Tailwind CSS? Yes
# ✔ src/ directory? No
# ✔ App Router? Yes
# ✔ Turbopack? Yes
# ✔ Import alias? @/*

cd frontend
npm run dev # Runs on port 3000 by default
```

**Change port to 3001** (backend uses 3000):

```json
// frontend/package.json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001"
  }
}
```

---

## 5.3 Folder Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page
│   ├── generate/
│   │   └── page.tsx          # Blog generator
│   ├── blog/
│   │   └── [id]/
│   │       └── page.tsx      # Blog view
│   ├── dashboard/            # User dashboard (if auth added)
│   │   └── page.tsx
│   └── layout.tsx            # Root layout
├── components/
│   ├── BlogForm.tsx          # Blog generation form
│   ├── BlogPreview.tsx       # Blog display
│   ├── AudioPlayer.tsx       # TTS audio player
│   ├── EmailModal.tsx        # Send email modal
│   ├── LoadingStatus.tsx     # Generation status
│   └── Header.tsx            # Navigation
├── lib/
│   ├── api.ts                # API client
│   └── types.ts              # TypeScript types
└── public/
    └── assets/
```

---

## 5.4 API Client Setup

**File:** `frontend/lib/api.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ContentRequest {
  topic: string;
  keywords: string[];
  targetAudience?: string;
  additionalContext?: string;
  options?: {
    tone?: string;
    style?: string;
    wordCount?: number;
    sectionCount?: number;
  };
}

export const api = {
  // Generate blog
  async generateBlog(data: ContentRequest) {
    const response = await fetch(`${API_BASE_URL}/api/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to generate blog');
    return response.json();
  },

  // Get blog status
  async getBlog(requestId: string) {
    const response = await fetch(`${API_BASE_URL}/api/content/${requestId}`);

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch blog');

    return response.json();
  },

  // Download audio
  async getAudioUrl(requestId: string) {
    return `${API_BASE_URL}/api/audio/${requestId}`;
  },

  // Send email
  async sendEmail(requestId: string, email: string) {
    const response = await fetch(`${API_BASE_URL}/api/send-blog-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, email }),
    });

    if (!response.ok) throw new Error('Failed to send email');
    return response.json();
  },
};
```

---

## 5.5 Environment Setup

**File:** `frontend/.env.local`

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000

# Production (set in Vercel)
# NEXT_PUBLIC_API_URL=https://your-app.motia.cloud

# If adding auth later
# NEXTAUTH_URL=http://localhost:3001
# NEXTAUTH_SECRET=your-secret-here
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 5.6 Next Steps - Frontend Implementation

**Immediate Next Steps:**

1. **Create Basic UI** (1 day)
   - Home page with hero section
   - Blog generator form
   - Loading states
   - Blog preview page

2. **Connect to Backend** (0.5 day)
   - Integrate API client
   - Test blog generation flow
   - Test TTS audio playback
   - Test email sending

3. **Polish UX** (0.5 day)
   - Error handling
   - Validation
   - Responsive design
   - Animations

4. **Optional: Add Auth** (1-2 days)
   - User signup/login
   - Protected routes
   - User dashboard
   - Blog history

---

## 5.7 Recommended Path Forward

### Week 1: Frontend MVP
```
Day 1: Set up Next.js + Create UI components
Day 2: Connect to backend API + Test workflow
Day 3: Polish UX + Deploy to Vercel
```

### Week 2: Database & Auth (Optional)
```
Day 4-5: Set up Neon database + Drizzle ORM
Day 6: Add NextAuth.js authentication
Day 7: Migrate to database + User dashboard
```

---

## 🎯 Decision Time

### Recommended Next Action:

**Start with Frontend MVP** ✨

**Why?**
1. Backend is complete and working perfectly
2. You can see visual results immediately
3. Test user experience and get feedback
4. Add database/auth later based on needs
5. Faster path to usable product

**Command:**
```bash
npx create-next-app@latest frontend
cd frontend
npm run dev -p 3001
```

Then follow Phase 5 documentation to build the UI!

---

**Ready to build?** Let me know if you want to:
- ✅ **Option A**: Start frontend development now
- ✅ **Option B**: Set up Neon database first
- ✅ **Option C**: Both in parallel

---

# 🎨 Phase 6: Frontend Development with Animated Icons & Beautiful UI

## 6.1 Tech Stack & Dependencies

### Core Framework & Libraries
```bash
Framework: Next.js 15 (App Router)
UI Library: React 18+
Language: TypeScript (Strict Mode)
Styling: Tailwind CSS v3.4+
Component Library: shadcn/ui
Animations: Framer Motion v11+
Forms: React Hook Form v7+ with Zod validation
HTTP Client: Native Fetch API
State Management: React Context (light state only)
```

### Complete Package Installation

**Step 1: Create Next.js Project**
```bash
# In project root
npx create-next-app@latest frontend
# ✔ TypeScript? Yes
# ✔ ESLint? Yes
# ✔ Tailwind CSS? Yes
# ✔ src/ directory? No
# ✔ App Router? Yes
# ✔ Turbopack? Yes
# ✔ Import alias? @/*

cd frontend
```

**Step 2: Install Animated Icon Libraries**
```bash
# Primary icon library (beautiful, consistent, tree-shakeable)
npm install lucide-react

# Animation library (smooth, physics-based animations)
npm install framer-motion

# Additional icon sets (Font Awesome, Material Icons, etc.)
npm install react-icons

# Modern animated icons (specialized animations)
npm install @tabler/icons-react

# Icon animation utilities
npm install clsx tailwind-merge
```

**Step 3: Install shadcn/ui**
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add card
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add label
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tooltip
```

**Step 4: Install Form & Validation**
```bash
npm install react-hook-form zod @hookform/resolvers
```

**Step 5: Install Toast Notifications**
```bash
npm install react-hot-toast
```

**Step 6: Install Utilities**
```bash
npm install nanoid date-fns
```

### Package.json Configuration
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.3.0",
    "lucide-react": "^0.441.0",
    "framer-motion": "^11.5.0",
    "react-icons": "^5.3.0",
    "@tabler/icons-react": "^3.14.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "nanoid": "^5.0.7",
    "date-fns": "^3.6.0"
  }
}
```

---

## 6.2 Animated Icons Setup & Configuration

### Lucide React - Primary Icon Library

**Why Lucide?**
- ✅ 1,500+ beautiful, consistent icons
- ✅ Tree-shakeable (only import what you use)
- ✅ TypeScript support
- ✅ Customizable size, color, stroke
- ✅ Works seamlessly with Tailwind
- ✅ Active development & maintained

**Usage Example:**
```typescript
import { Sparkles, Wand2, Mail, Download, Play, Pause } from 'lucide-react';

// Basic usage
<Sparkles className="w-6 h-6 text-blue-500" />

// With Tailwind animations
<Loader2 className="w-8 h-8 animate-spin text-purple-600" />

// Customizable props
<CheckCircle size={32} strokeWidth={2.5} color="#10b981" />
```

### Framer Motion - Advanced Animations

**Animation Patterns for Icons:**

**1. Spin Animation**
```typescript
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
>
  <RefreshCw className="w-6 h-6" />
</motion.div>
```

**2. Bounce Animation**
```typescript
<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{ duration: 0.5, repeat: Infinity }}
>
  <Sparkles className="w-8 h-8 text-yellow-500" />
</motion.div>
```

**3. Scale Pulse Animation**
```typescript
<motion.div
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ duration: 1, repeat: Infinity }}
>
  <Bell className="w-6 h-6 text-red-500" />
</motion.div>
```

**4. Fade In Animation**
```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.5 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5, type: "spring" }}
>
  <CheckCircle className="w-12 h-12 text-green-500" />
</motion.div>
```

**5. Icon Morph (Menu → X)**
```typescript
<motion.div
  animate={{ rotate: isOpen ? 90 : 0 }}
  transition={{ duration: 0.3 }}
>
  {isOpen ? <X /> : <Menu />}
</motion.div>
```

**6. Hover Effects**
```typescript
<motion.button
  whileHover={{ scale: 1.1, rotate: 15 }}
  whileTap={{ scale: 0.95 }}
>
  <Sparkles className="w-6 h-6" />
</motion.button>
```

### Tailwind Built-in Animations

**Available Classes:**
```css
animate-spin      /* Continuous rotation */
animate-ping      /* Ping effect (scale + fade) */
animate-pulse     /* Gentle opacity pulse */
animate-bounce    /* Bounce up and down */
```

**Usage:**
```tsx
<Loader2 className="animate-spin" />
<div className="animate-ping"><div className="w-4 h-4 bg-blue-500 rounded-full" /></div>
<Heart className="animate-pulse text-red-500" />
<ChevronDown className="animate-bounce" />
```

### Custom Tailwind Animations

**Add to `tailwind.config.ts`:**
```typescript
module.exports = {
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
}
```

**Usage:**
```tsx
<Wand2 className="animate-wiggle text-purple-500" />
<div className="animate-fade-in">
  <Sparkles />
</div>
```

---

## 6.3 Icon Mapping for All Features

### Feature Icons (Lucide React)

**Blog Generation:**
```typescript
import {
  Sparkles,      // AI magic
  Wand2,         // Content generation
  Brain,         // AI thinking
  Zap,           // Fast generation
  FileText,      // Blog article
  PenTool,       // Writing
  Lightbulb,     // Ideas
  TrendingUp,    // SEO optimization
} from 'lucide-react';
```

**Audio & Media:**
```typescript
import {
  Mic,           // Recording/TTS
  Volume2,       // Audio volume
  Play,          // Play audio
  Pause,         // Pause audio
  Download,      // Download audio
  Headphones,    // Listen
  Music,         // Audio file
  Speaker,       // Sound output
} from 'lucide-react';
```

**Email & Communication:**
```typescript
import {
  Mail,          // Email
  Send,          // Send action
  Inbox,         // Received
  AtSign,        // Email address
  CheckCircle,   // Success
  AlertCircle,   // Warning
  XCircle,       // Error
} from 'lucide-react';
```

**Progress & Status:**
```typescript
import {
  Loader2,       // Loading spinner
  Clock,         // Time/waiting
  TrendingUp,    // Progress
  CheckCircle2,  // Completed
  Circle,        // Pending
  AlertTriangle, // Warning
  Info,          // Information
  HelpCircle,    // Help
} from 'lucide-react';
```

**Actions & Controls:**
```typescript
import {
  Copy,          // Copy to clipboard
  Download,      // Download file
  Share2,        // Share content
  Trash2,        // Delete
  Edit,          // Edit
  Save,          // Save
  RefreshCw,     // Refresh/regenerate
  ArrowLeft,     // Back navigation
  ExternalLink,  // Open external
} from 'lucide-react';
```

**Navigation:**
```typescript
import {
  Home,          // Home page
  FileText,      // Blog/content
  Settings,      // Settings
  Menu,          // Menu toggle
  X,             // Close
  ChevronDown,   // Dropdown
  ChevronRight,  // Next/forward
  Search,        // Search
  User,          // User profile
} from 'lucide-react';
```

**Form & Input:**
```typescript
import {
  Tag,           // Keywords/tags
  Type,          // Text input
  MessageSquare, // Comments/description
  Sliders,       // Adjust settings
  Eye,           // Preview
  EyeOff,        // Hide
  Filter,        // Filter options
} from 'lucide-react';
```

---

## 6.4 Project Structure

```
frontend/
├── app/
│   ├── page.tsx                      # Home/Landing page
│   ├── generate/
│   │   └── page.tsx                  # Blog Generator page
│   ├── blog/
│   │   └── [id]/
│   │       └── page.tsx              # Blog View page
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles
│   └── favicon.ico
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   ├── slider.tsx
│   │   ├── skeleton.tsx
│   │   └── toast.tsx
│   │
│   ├── BlogForm.tsx                  # Blog generation form
│   ├── BlogPreview.tsx               # Article display component
│   ├── AudioPlayer.tsx               # TTS audio player
│   ├── EmailModal.tsx                # Send email dialog
│   ├── LoadingStatus.tsx             # Real-time generation progress
│   ├── Header.tsx                    # Navigation header
│   ├── Footer.tsx                    # Footer component
│   ├── AnimatedIcon.tsx              # Reusable animated icon wrapper
│   └── StatusBadge.tsx               # Status indicator with icon
│
├── lib/
│   ├── api.ts                        # Backend API client
│   ├── types.ts                      # TypeScript types/interfaces
│   ├── utils.ts                      # Utility functions
│   └── constants.ts                  # App constants
│
├── hooks/
│   ├── usePolling.ts                 # Polling hook for status
│   ├── useClipboard.ts               # Copy to clipboard
│   └── useLocalStorage.ts            # localStorage hook
│
├── public/
│   └── assets/
│       ├── logo.svg
│       └── hero-bg.svg
│
├── .env.local                        # Environment variables
├── tailwind.config.ts                # Tailwind configuration
├── components.json                   # shadcn/ui config
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
└── package.json                      # Dependencies
```

---

## 6.5 Page Development Specifications

### Page 1: Home/Landing Page (`app/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│         Header (Navigation)         │
├─────────────────────────────────────┤
│                                     │
│         🎨 Hero Section             │
│   "AI-Powered Blog Generation"      │
│   [Animated gradient background]    │
│   [CTA Button with icon]            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│       ✨ Features Showcase          │
│   [3-4 cards with animated icons]   │
│   - AI Generation                   │
│   - Google Search                   │
│   - TTS Audio                       │
│   - Email Delivery                  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│      📝 Example Topics              │
│   [Cards with topic suggestions]    │
│   [Click to auto-fill generator]    │
│                                     │
├─────────────────────────────────────┤
│            Footer                   │
└─────────────────────────────────────┘
```

**Key Features:**
- Animated gradient background (CSS or Framer Motion)
- Hero section with fade-in animation
- Feature cards with hover effects
- Icons that animate on hover/scroll
- CTA button with icon and pulse effect
- Smooth scroll to sections

**Icon Usage:**
```tsx
// Hero section
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", delay: 0.2 }}
>
  <Sparkles className="w-16 h-16 text-purple-500" />
</motion.div>

// Feature cards
<Brain className="w-12 h-12 text-blue-500 animate-pulse" />
<Zap className="w-12 h-12 text-yellow-500" />
<Mic className="w-12 h-12 text-green-500" />
<Mail className="w-12 h-12 text-red-500" />
```

---

### Page 2: Blog Generator Page (`app/generate/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│         Header (Navigation)         │
├─────────────────────────────────────┤
│                                     │
│         📝 Blog Generator            │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  Form Fields:               │   │
│   │  • Topic (input)            │   │
│   │  • Keywords (tag input)     │   │
│   │  • Target Audience          │   │
│   │  • Additional Context       │   │
│   │                             │   │
│   │  Advanced Options:          │   │
│   │  • Tone (select)            │   │
│   │  • Style (select)           │   │
│   │  • Word Count (slider)      │   │
│   │  • Section Count            │   │
│   │                             │   │
│   │  [Generate Button] ✨       │   │
│   └─────────────────────────────┘   │
│                                     │
│   OR (when generating)              │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  ⏳ Generation Progress      │   │
│   │  [Progress Bar]             │   │
│   │  🔍 Enhancing prompt...     │   │
│   │  (Animated status)          │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Key Features:**
- Multi-step form with validation
- Tag input for keywords (add/remove chips)
- Slider for word count with live value
- Collapsible advanced options
- Real-time validation feedback
- Loading state during generation
- Auto-redirect when complete

**Icon Usage:**
```tsx
// Form field icons
<Tag className="w-4 h-4 text-gray-400" />
<Type className="w-4 h-4 text-gray-400" />
<MessageSquare className="w-4 h-4 text-gray-400" />
<Sliders className="w-4 h-4 text-gray-400" />

// Generate button
<Button>
  <Sparkles className="w-5 h-5 mr-2" />
  Generate Blog
</Button>

// Loading state
<Loader2 className="w-6 h-6 animate-spin" />
```

---

### Page 3: Blog View Page (`app/blog/[id]/page.tsx`)

**Layout:**
```
┌─────────────────────────────────────┐
│         Header (Navigation)         │
├─────────────────────────────────────┤
│                                     │
│   📄 Blog Article Title             │
│   [Metadata badges]                 │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  Action Buttons:            │   │
│   │  📧 Email  📋 Copy          │   │
│   │  💾 Download  🔊 Audio      │   │
│   │  🔄 Generate Another        │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🎤 Audio Player            │   │
│   │  [Play/Pause | Progress]    │   │
│   │  [Download Audio]           │   │
│   └─────────────────────────────┘   │
│                                     │
│   📖 Introduction                   │
│   [Formatted text]                  │
│                                     │
│   📑 Section 1                      │
│   [Content...]                      │
│                                     │
│   📑 Section 2                      │
│   [Content...]                      │
│                                     │
│   ✅ Conclusion                     │
│   [Formatted text]                  │
│                                     │
│   🏷️ Keywords: [tag] [tag] [tag]  │
│                                     │
└─────────────────────────────────────┘
```

**Key Features:**
- Full article with beautiful typography
- Action buttons with icons
- Audio player with custom controls
- Copy to clipboard functionality
- Download as markdown
- Email modal
- Smooth scroll animations
- Table of contents (optional)
- Reading progress indicator

**Icon Usage:**
```tsx
// Action buttons
<Button><Mail className="w-4 h-4 mr-2" />Email</Button>
<Button><Copy className="w-4 h-4 mr-2" />Copy</Button>
<Button><Download className="w-4 h-4 mr-2" />Download</Button>
<Button><RefreshCw className="w-4 h-4 mr-2" />Generate Another</Button>

// Audio player
<Button>{isPlaying ? <Pause /> : <Play />}</Button>
<Volume2 className="w-5 h-5" />
<Download className="w-5 h-5" />

// Metadata
<Clock className="w-4 h-4" />
<FileText className="w-4 h-4" />
<Tag className="w-4 h-4" />
```

---

## 6.6 Component Development Specifications

### Component 1: AnimatedIcon.tsx (Reusable Wrapper)

**Purpose:** Reusable wrapper for animated icons

```typescript
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedIconProps {
  Icon: LucideIcon;
  animation?: 'spin' | 'bounce' | 'pulse' | 'wiggle' | 'scale';
  className?: string;
  size?: number;
}

export function AnimatedIcon({
  Icon,
  animation = 'pulse',
  className,
  size = 24
}: AnimatedIconProps) {
  const animations = {
    spin: { rotate: 360 },
    bounce: { y: [0, -10, 0] },
    pulse: { scale: [1, 1.1, 1] },
    wiggle: { rotate: [-5, 5, -5, 5, 0] },
    scale: { scale: [0.8, 1.2, 1] },
  };

  return (
    <motion.div
      animate={animations[animation]}
      transition={{
        duration: animation === 'spin' ? 1 : 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      className={cn('inline-block', className)}
    >
      <Icon size={size} />
    </motion.div>
  );
}

// Usage
<AnimatedIcon Icon={Sparkles} animation="pulse" size={32} />
```

---

### Component 2: LoadingStatus.tsx (Real-time Progress)

**Purpose:** Display generation progress with animated icons

```typescript
import { motion } from 'framer-motion';
import { Loader2, Search, FileText, Mic, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LoadingStatusProps {
  stage: 'enhancing' | 'generating' | 'tts' | 'complete';
  progress: number;
}

export function LoadingStatus({ stage, progress }: LoadingStatusProps) {
  const stages = {
    enhancing: {
      icon: Search,
      label: 'Enhancing prompt with AI research...',
      color: 'text-blue-500',
    },
    generating: {
      icon: FileText,
      label: 'Generating blog with Google Search...',
      color: 'text-purple-500',
    },
    tts: {
      icon: Mic,
      label: 'Creating audio narration...',
      color: 'text-green-500',
    },
    complete: {
      icon: CheckCircle,
      label: 'Complete!',
      color: 'text-emerald-500',
    },
  };

  const currentStage = stages[stage];
  const Icon = currentStage.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg"
    >
      <div className="flex items-center justify-center mb-6">
        {stage === 'complete' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <CheckCircle className="w-16 h-16 text-green-500" />
          </motion.div>
        ) : (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Icon className={`w-16 h-16 ${currentStage.color}`} />
          </motion.div>
        )}
      </div>

      <h3 className="text-2xl font-semibold text-center mb-4">
        {currentStage.label}
      </h3>

      <Progress value={progress} className="mb-4" />

      <p className="text-center text-gray-500">
        {progress}% complete • Estimated time: {Math.ceil((100 - progress) / 2)}s
      </p>

      {/* Stage indicators */}
      <div className="flex justify-between mt-8">
        {Object.entries(stages).map(([key, stageInfo]) => (
          <div key={key} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                key === stage
                  ? 'bg-blue-500 text-white'
                  : progress >= getStageProgress(key)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <stageInfo.icon className="w-5 h-5" />
            </div>
            <span className="text-xs mt-2 text-gray-600">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
```

---

### Component 3: AudioPlayer.tsx (TTS Playback)

**Purpose:** Custom audio player with controls and animations

```typescript
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  audioUrl: string;
  requestId: string;
}

export function AudioPlayer({ audioUrl, requestId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Audio control logic...

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl shadow-lg"
    >
      <audio ref={audioRef} src={audioUrl} />

      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            variant="ghost"
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </Button>
        </motion.div>

        {/* Progress bar */}
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </Button>
        </div>

        {/* Download button */}
        <Button size="icon" variant="ghost" asChild>
          <a href={audioUrl} download={`blog-audio-${requestId}.wav`}>
            <Download className="w-5 h-5 text-white" />
          </a>
        </Button>
      </div>

      {/* Waveform visualization (optional) */}
      <div className="flex items-center justify-center gap-1 h-16 mt-4">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scaleY: isPlaying ? [0.5, 1, 0.5] : 0.3,
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.02,
            }}
            className="w-1 bg-white/60 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}
```

---

### Component 4: EmailModal.tsx (Send Email Dialog)

**Purpose:** Modal for sending blog via email

```typescript
import { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface EmailModalProps {
  requestId: string;
}

export function EmailModal({ requestId }: EmailModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSendEmail = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.sendEmail(requestId, email);
      setIsSuccess(true);
      toast.success('Email sent successfully!');
      setTimeout(() => setOpen(false), 2000);
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Send to Email
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Send Blog via Email
          </DialogTitle>
          <DialogDescription>
            Enter your email address to receive this blog article
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold text-green-600">
              Email sent successfully!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
              />
            </div>

            <Button
              onClick={handleSendEmail}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                  </motion.div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

## 6.7 API Integration (`lib/api.ts`)

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ContentRequest {
  topic: string;
  keywords: string[];
  targetAudience?: string;
  additionalContext?: string;
  options?: {
    tone?: string;
    style?: string;
    wordCount?: number;
    sectionCount?: number;
  };
}

export interface BlogArticle {
  id: string;
  title: string;
  introduction?: string;
  sections: Array<{
    heading: string;
    content: string;
    order: number;
  }>;
  conclusion?: string;
  metadata: {
    keywords: string[];
    wordCount?: number;
  };
  generatedAt?: string;
}

export const api = {
  // Generate blog
  async generateBlog(data: ContentRequest) {
    const response = await fetch(`${API_BASE_URL}/api/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate blog');
    }

    return response.json() as Promise<{ id: string; status: string }>;
  },

  // Get blog status/content
  async getBlog(requestId: string) {
    const response = await fetch(`${API_BASE_URL}/api/content/${requestId}`);

    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch blog');

    return response.json() as Promise<{
      article: BlogArticle;
      tts?: { available: boolean };
    }>;
  },

  // Get audio URL
  getAudioUrl(requestId: string) {
    return `${API_BASE_URL}/api/audio/${requestId}`;
  },

  // Send email
  async sendEmail(requestId: string, email: string) {
    const response = await fetch(`${API_BASE_URL}/api/send-blog-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, email }),
    });

    if (!response.ok) throw new Error('Failed to send email');

    return response.json();
  },
};
```

---

## 6.8 Custom Hooks

### usePolling.ts (Poll for Blog Status)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function usePolling(requestId: string | null, interval = 2000) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!requestId) return;

    try {
      const result = await api.getBlog(requestId);
      if (result) {
        setData(result);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to fetch blog');
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (!requestId) return;

    setIsLoading(true);
    fetchData();

    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [requestId, interval, fetchData]);

  return { data, isLoading, error };
}
```

### useClipboard.ts (Copy to Clipboard)

```typescript
import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

export function useClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success('Copied to clipboard!', {
        icon: <CheckCircle className="text-green-500" />,
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return { isCopied, copyToClipboard };
}
```

---

## 6.9 Environment Configuration

**File: `frontend/.env.local`**

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# For production (set in Vercel):
# NEXT_PUBLIC_API_URL=https://your-app.motia.cloud
```

---

## 6.10 Implementation Steps & Timeline

### Day 1: Project Setup & Basic Structure (4-5 hours)

**Step 1: Initialize Project** (30 min)
```bash
npx create-next-app@latest frontend
cd frontend
```

**Step 2: Install All Dependencies** (15 min)
```bash
# Icons & animations
npm install lucide-react framer-motion react-icons @tabler/icons-react

# shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input textarea select dialog badge card separator skeleton progress slider switch label tabs toast tooltip dropdown-menu

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# Utilities
npm install react-hot-toast clsx tailwind-merge nanoid date-fns
```

**Step 3: Configure Tailwind** (30 min)
- Add custom animations to `tailwind.config.ts`
- Set up color palette
- Configure typography

**Step 4: Create Project Structure** (30 min)
- Create all folders: `components/`, `components/ui/`, `lib/`, `hooks/`
- Set up `lib/api.ts`, `lib/types.ts`, `lib/utils.ts`
- Create `.env.local`

**Step 5: Build Header Component** (1 hour)
- Logo, navigation, mobile menu
- Animated icons for menu toggle

**Step 6: Build Home Page** (2 hours)
- Hero section with gradient background
- Feature cards with animated icons
- CTA button
- Animations with Framer Motion

---

### Day 2: Generator Page & Form (5-6 hours)

**Step 7: Build BlogForm Component** (3 hours)
- Form fields with React Hook Form
- Zod validation
- Tag input for keywords
- Slider for word count
- Dropdowns for tone/style
- Advanced options collapsible
- Animated icons for each field

**Step 8: Build LoadingStatus Component** (1 hour)
- Real-time progress display
- Animated stage indicators
- Progress bar
- Spinning/animated icons

**Step 9: Create Generator Page** (1 hour)
- Integrate BlogForm
- Handle form submission
- Show LoadingStatus during generation
- Poll for completion
- Redirect to blog view

**Step 10: Build usePolling Hook** (30 min)
- Polling logic
- Error handling
- Auto-stop when complete

---

### Day 3: Blog View Page & Components (5-6 hours)

**Step 11: Build BlogPreview Component** (2 hours)
- Article layout with typography
- Section rendering
- Markdown formatting
- Keywords display
- Metadata badges

**Step 12: Build AudioPlayer Component** (2 hours)
- Custom audio controls
- Play/pause button with icon animation
- Progress slider
- Volume control
- Download button
- Waveform visualization (optional)

**Step 13: Build EmailModal Component** (1 hour)
- Dialog with form
- Email validation
- Send email API call
- Success/error states with animated icons

**Step 14: Build Blog View Page** (1 hour)
- Integrate BlogPreview, AudioPlayer, EmailModal
- Action buttons (copy, download, email)
- Copy to clipboard functionality
- Download markdown
- Animations

---

### Day 4: Polish, Testing & Deployment (4-5 hours)

**Step 15: Add Animations & Transitions** (2 hours)
- Page transitions with Framer Motion
- Component entrance animations
- Hover effects on buttons/cards
- Icon animations
- Loading skeletons

**Step 16: Responsive Design** (1 hour)
- Test on mobile, tablet, desktop
- Fix layout issues
- Optimize touch interactions

**Step 17: Error Handling & Edge Cases** (1 hour)
- Error boundaries
- Empty states
- Loading states
- Network error handling
- Toast notifications

**Step 18: Testing & Fixes** (1 hour)
- Test complete workflow
- Test audio playback
- Test email sending
- Test copy/download
- Fix bugs

**Step 19: Final Polish** (30 min)
- Optimize animations
- Check accessibility
- Verify all icons
- Clean up console warnings

---

## 6.11 Animated Icon Showcase

### Icon Animation Examples by Use Case

**1. Loading States**
```tsx
<Loader2 className="w-6 h-6 animate-spin text-blue-500" />
<RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
<Clock className="w-6 h-6 animate-pulse text-gray-500" />
```

**2. Success States**
```tsx
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
  transition={{ type: "spring", stiffness: 200 }}
>
  <CheckCircle className="w-12 h-12 text-green-500" />
</motion.div>
```

**3. Error States**
```tsx
<motion.div
  animate={{ x: [-5, 5, -5, 5, 0] }}
  transition={{ duration: 0.5 }}
>
  <AlertCircle className="w-8 h-8 text-red-500" />
</motion.div>
```

**4. Interactive Buttons**
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
>
  <Sparkles className="w-5 h-5" />
  Generate
</motion.button>
```

**5. Notification Badges**
```tsx
<motion.div
  animate={{ scale: [1, 1.2, 1] }}
  transition={{ repeat: Infinity, duration: 2 }}
>
  <Bell className="w-6 h-6 text-red-500" />
  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
</motion.div>
```

**6. Menu Toggle**
```tsx
<motion.button
  whileTap={{ rotate: 90 }}
  transition={{ duration: 0.2 }}
>
  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
</motion.button>
```

---

## 6.12 Complete Package Reference

### Final package.json Dependencies

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-slider": "^1.2.1",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@tabler/icons-react": "^3.14.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.5.0",
    "lucide-react": "^0.441.0",
    "nanoid": "^5.0.7",
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-hook-form": "^7.53.0",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^5.3.0",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.4.20",
    "eslint": "^8",
    "eslint-config-next": "^15.0.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---

## 🎯 Quick Start Command

```bash
# Run this in project root to start building the frontend:

# Step 1: Create Next.js app
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir

# Step 2: Navigate to frontend
cd frontend

# Step 3: Install all dependencies at once
npm install lucide-react framer-motion react-icons @tabler/icons-react react-hook-form zod @hookform/resolvers react-hot-toast clsx tailwind-merge nanoid date-fns

# Step 4: Initialize shadcn/ui
npx shadcn@latest init


# Step 5: Add all shadcn components
npx shadcn-ui@latest add button input textarea select dialog dropdown-menu badge card separator skeleton progress slider switch label tabs toast tooltip

# Step 6: Update package.json port
# Edit package.json: "dev": "next dev -p 3001"

# Step 7: Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

# Step 8: Start development
npm run dev
```

**Your frontend will be running at:** `http://localhost:3001` 🚀

---

**This completes the comprehensive frontend development plan with animated icons!** ✨

