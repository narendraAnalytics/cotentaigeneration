/**
 * Test script for the AI Copywriting API
 * Run with: node test-api.js
 */

const testRequest = {
  topic: "The Future of AI in Content Marketing",
  keywords: [
    "AI content marketing",
    "artificial intelligence",
    "content automation",
    "SEO optimization"
  ],
  targetAudience: "Digital marketers and content creators",
  additionalContext: "Focus on practical applications and real-world examples",
  options: {
    tone: "professional",
    style: "informative",
    wordCount: 1500,
    sectionCount: 5,
    includeIntro: true,
    includeConclusion: true,
    formatting: {
      useMarkdown: true,
      includeTOC: false,
      useHeadings: true
    }
  }
};

async function testAPI() {
  console.log('🚀 Testing AI Copywriting API...\n');
  console.log('📝 Request:', JSON.stringify(testRequest, null, 2));
  console.log('\n📤 Sending POST request to http://localhost:3000/api/generate-content\n');

  try {
    const response = await fetch('http://localhost:3000/api/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });

    const data = await response.json();

    console.log('✅ Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));
    console.log('\n✨ Request accepted! Check server logs for generation progress.');
    console.log('🔍 Request ID:', data.id);
    console.log('\n💡 The blog is being generated in the background.');
    console.log('   Watch the server logs to see the progress and final article.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
