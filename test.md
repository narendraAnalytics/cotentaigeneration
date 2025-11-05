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

