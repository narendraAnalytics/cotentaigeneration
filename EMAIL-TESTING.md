# 📧 Email Functionality Testing Guide

## Overview

The email feature allows you to send generated blog articles to any email address using Resend API.

---

## Setup (Already Done ✅)

Your `.env` file contains:
```env
RESEND_API_KEY=re_CGxpiEyL_3y3ik9Q85z2yGWRL3imgVccv
RESEND_FROM_EMAIL=onboarding@resend.dev
```

---

## How It Works

### **Two-Step Process:**

**Step 1: Generate Blog** (existing workflow - unchanged)
```bash
POST /api/generate-content
  ↓
Returns requestId
  ↓
Blog generates in background (50-60 seconds)
```

**Step 2: Send Email** (NEW feature)
```bash
POST /api/send-blog-email
  { requestId, email }
  ↓
Email sent with full blog article ✅
```

---

## Testing Methods

### **Method 1: Test Script (Easiest)**

```bash
node test-email.js YOUR_EMAIL REQUEST_ID
```

**Example:**
```bash
node test-email.js john@example.com 5f50341d-9a72-419a-9ccb-bd9d72c0ac36
```

**Output:**
```
📧 Testing Email Sending...
📋 Request ID: 5f50341d-9a72-419a-9ccb-bd9d72c0ac36
📨 Email To: john@example.com
✅ SUCCESS! Email has been sent!
```

---

### **Method 2: Complete Workflow Test**

**Generate blog first, then send email:**

```bash
# Step 1: Generate blog
node test-complete-workflow.js

# Output includes:
# Request ID: 5f50341d-9a72-419a-9ccb-bd9d72c0ac36

# Step 2: Send email with that ID
node test-email.js your@email.com 5f50341d-9a72-419a-9ccb-bd9d72c0ac36
```

---

### **Method 3: cURL Commands**

**Send Email:**
```bash
curl -X POST http://localhost:3000/api/send-blog-email \
  -H "Content-Type: application/json" \
  -d "{
    \"requestId\": \"5f50341d-9a72-419a-9ccb-bd9d72c0ac36\",
    \"email\": \"your@email.com\"
  }"
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Blog article \"Title\" has been sent to your@email.com",
  "messageId": "abc123..."
}
```

**Response (404 - Not Found):**
```json
{
  "success": false,
  "error": "No blog article found for request ID: ..."
}
```

---

## API Endpoint Reference

### **POST /api/send-blog-email**

**Request Body:**
```typescript
{
  requestId: string (UUID),  // Required
  email: string (valid email) // Required
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| 200 OK | Email sent successfully |
| 400 Bad Request | Invalid email or requestId format |
| 404 Not Found | Blog not found (still generating or invalid ID) |
| 500 Server Error | Resend API error or server issue |

---

## Email Format

The email contains:

### **Beautiful HTML Template:**
- ✨ Professional styling with gradient header
- 📝 Full blog article (title, intro, sections, conclusion)
- 🎨 Color-coded sections
- 📊 Metadata (word count, keywords, generated date)
- 🔑 SEO keywords as styled tags
- 📱 Mobile-responsive design

### **Email Subject:**
```
Your AI-Generated Blog: [Article Title]
```

### **From Address:**
```
onboarding@resend.dev
```

---

## Troubleshooting

### **404 Error - Blog Not Found**

**Possible causes:**
1. Blog is still generating (wait 60 seconds)
2. Invalid requestId
3. Typo in requestId

**Solution:**
```bash
# Check if blog is ready
curl http://localhost:3000/api/content/YOUR_REQUEST_ID
```

---

### **500 Error - Failed to Send**

**Possible causes:**
1. Invalid Resend API key
2. Invalid email address
3. Resend API limits reached

**Solution:**
- Check `.env` file has correct `RESEND_API_KEY`
- Verify email format is valid
- Check Resend dashboard for limits

---

### **Email Not Received**

**Check:**
1. ✅ Spam/junk folder
2. ✅ Email address is correct
3. ✅ Resend logs (check Resend dashboard)
4. ✅ Server logs for errors

---

## Complete Example Workflow

```bash
# 1. Generate blog
node test-complete-workflow.js

# Wait for completion message:
# ✅ Blog article generation completed!
# 📋 Request ID: 5f50341d-9a72-419a-9ccb-bd9d72c0ac36

# 2. Send email
node test-email.js myemail@example.com 5f50341d-9a72-419a-9ccb-bd9d72c0ac36

# 3. Check your inbox! 📬
```

---

## Testing with Your Own Email

**Replace with your real email:**
```bash
node test-email.js YOUR_REAL_EMAIL@gmail.com 5f50341d-9a72-419a-9ccb-bd9d72c0ac36
```

**You'll receive a beautifully formatted email with the full blog article!** ✨

---

## Notes

- ✅ **Existing workflow unchanged** - blog generation works exactly as before
- ✅ **Email is optional** - you can still use GET /api/content/:id
- ✅ **No email storage** - emails are sent directly via Resend
- ✅ **HTML formatted** - beautiful, professional email template
- ✅ **Separate endpoint** - complete isolation from generation workflow
