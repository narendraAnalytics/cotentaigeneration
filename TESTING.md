# Testing the AI Copywriting API

## Quick Start

### 1. Start the Server

```bash
npm run dev
```

Server runs on: **http://localhost:3000**

---

## Testing Methods

### Method 1: Automated Test Script (Recommended)

**Complete workflow with polling:**

```bash
node test-complete-workflow.js
```

This script will:
1. Send a blog generation request
2. Poll every 5 seconds for completion
3. Display the full article when ready

**Simple test (just send request):**

```bash
node test-api.js
```

---

### Method 2: cURL Commands

**Step 1: Generate Blog Content**

```bash
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d "{
    \"topic\": \"The Future of AI in Content Marketing\",
    \"keywords\": [\"AI\", \"content marketing\", \"automation\"],
    \"targetAudience\": \"Digital marketers\",
    \"options\": {
      \"tone\": \"professional\",
      \"style\": \"informative\",
      \"wordCount\": 1200,
      \"sectionCount\": 5
    }
  }"
```

Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "accepted",
  "message": "Your content generation request has been queued for processing"
}
```

**Step 2: Retrieve Generated Content**

Wait 30-60 seconds, then:

```bash
curl http://localhost:3000/api/content/YOUR_REQUEST_ID_HERE
```

---

### Method 3: Browser / Postman

**1. POST Request:**
- URL: `http://localhost:3000/api/generate-content`
- Method: POST
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "topic": "How to Build a Content Strategy with AI",
  "keywords": ["AI", "content strategy", "marketing"],
  "targetAudience": "Marketing professionals",
  "options": {
    "tone": "professional",
    "style": "informative",
    "wordCount": 1500
  }
}
```

**2. GET Request:**
- URL: `http://localhost:3000/api/content/{requestId}`
- Method: GET

---

## API Endpoints

### POST /api/generate-content
**Generate a new blog article**

**Request Body:**
```typescript
{
  topic: string,              // Main topic (required)
  keywords: string[],         // SEO keywords (required, 1-10)
  targetAudience?: string,    // Target audience
  additionalContext?: string, // Additional requirements
  options?: {
    tone?: 'professional' | 'casual' | 'formal' | 'friendly' | 'authoritative' | 'conversational',
    style?: 'informative' | 'persuasive' | 'educational' | 'storytelling' | 'technical' | 'creative',
    wordCount?: number,       // 100-10000, default: 1000
    sectionCount?: number,    // 1-20, default: 5
    includeIntro?: boolean,
    includeConclusion?: boolean,
    formatting?: {
      useMarkdown?: boolean,
      includeTOC?: boolean,
      useHeadings?: boolean
    }
  }
}
```

**Response (202 Accepted):**
```json
{
  "id": "uuid",
  "status": "accepted",
  "message": "Your content generation request has been queued for processing"
}
```

---

### GET /api/content/:id
**Retrieve a generated blog article**

**Path Parameter:**
- `id`: The request ID from the POST response

**Response (200 OK):**
```json
{
  "id": "uuid",
  "status": "completed",
  "generatedAt": "2025-11-04T...",
  "article": {
    "title": "Article Title",
    "introduction": "...",
    "sections": [
      {
        "heading": "Section 1",
        "content": "...",
        "order": 0
      }
    ],
    "conclusion": "...",
    "metadata": {
      "keywords": [...],
      "targetAudience": "...",
      "primaryKeyword": "..."
    },
    "wordCount": 1234,
    "status": "completed",
    "generatedAt": "2025-11-04T..."
  },
  "fullContent": "# Full markdown content..."
}
```

**Response (404 Not Found):**
```json
{
  "error": "Not Found",
  "message": "No blog content found for request ID: ..."
}
```

---

## Workflow Timeline

1. **POST request** → Returns immediately with request ID (< 1 second)
2. **Event Step 1: Enhance Prompt** → AI research (10-20 seconds)
3. **Event Step 2: Generate Content** → AI writing (20-40 seconds)
4. **Total time:** Approximately 30-60 seconds

---

## Monitoring Progress

### View Server Logs

The Motia dev server shows detailed logs:

```
✅ Received blog generation request
⏳ Starting prompt enhancement
✅ Prompt enhancement completed
⏳ Starting blog content generation
✅ Blog article generated successfully
💾 Article stored in state
```

### Workbench (Visual Interface)

```bash
npx motia workbench
```

Opens: http://localhost:3000

View the workflow diagram and step execution in real-time.

---

## Troubleshooting

### Request returns 500 error
- Check GEMINI_API_KEY is set in `.env`
- Verify API key is valid
- Check server logs for details

### Content not found (404)
- Wait longer (generation takes 30-60 seconds)
- Verify request ID is correct
- Check server logs for errors

### Server not starting
- Run `npm install`
- Check port 3000 is not in use
- Verify all dependencies installed

---

## Example Test Scenarios

### Short Blog Post
```json
{
  "topic": "5 Quick AI Marketing Tips",
  "keywords": ["AI", "marketing", "tips"],
  "options": { "wordCount": 600, "sectionCount": 3 }
}
```

### Long-form Article
```json
{
  "topic": "Complete Guide to AI-Powered Content Marketing",
  "keywords": ["AI", "content marketing", "automation", "strategy"],
  "options": { "wordCount": 2500, "sectionCount": 8 }
}
```

### Technical Tutorial
```json
{
  "topic": "How to Implement AI in Your Marketing Stack",
  "keywords": ["AI implementation", "marketing automation"],
  "options": {
    "tone": "professional",
    "style": "technical",
    "wordCount": 2000
  }
}
```
