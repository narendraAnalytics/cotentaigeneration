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

