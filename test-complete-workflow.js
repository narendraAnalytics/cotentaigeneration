/**
 * Complete Workflow Test for AI Copywriting API
 *
 * This script demonstrates:
 * 1. Sending a blog generation request
 * 2. Polling for the result
 * 3. Retrieving the completed blog article
 *
 * Run with: node test-complete-workflow.js
 */

const BASE_URL = 'http://localhost:3000';

const testRequest = {
  topic: "How to Use AI for Content Marketing in 2025",
  keywords: [
    "AI content marketing",
    "artificial intelligence",
    "content automation",
    "digital marketing trends"
  ],
  targetAudience: "Marketing professionals and business owners",
  additionalContext: "Focus on practical strategies and ROI benefits",
  options: {
    tone: "professional",
    style: "informative",
    wordCount: 1200,
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

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testCompleteWorkflow() {
  console.log('🚀 AI Copywriting API - Complete Workflow Test\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Send generation request
    console.log('\n📤 STEP 1: Sending blog generation request...');
    console.log('Topic:', testRequest.topic);
    console.log('Keywords:', testRequest.keywords.join(', '));

    const generateResponse = await fetch(`${BASE_URL}/api/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRequest)
    });

    if (!generateResponse.ok) {
      throw new Error(`HTTP ${generateResponse.status}: ${generateResponse.statusText}`);
    }

    const generateData = await generateResponse.json();

    console.log('\n✅ Request accepted!');
    console.log('📋 Request ID:', generateData.id);
    console.log('📊 Status:', generateData.status);
    console.log('💬 Message:', generateData.message);

    const requestId = generateData.id;

    // Step 2: Poll for result
    console.log('\n⏳ STEP 2: Waiting for blog generation to complete...');
    console.log('   (This may take 30-60 seconds with Gemini AI + Google Search)');

    let attempts = 0;
    const maxAttempts = 30; // 30 attempts = 2.5 minutes max wait
    let articleData = null;

    while (attempts < maxAttempts) {
      attempts++;

      // Wait before checking (5 seconds between checks)
      await wait(5000);

      console.log(`   Attempt ${attempts}/${maxAttempts} - Checking status...`);

      const getResponse = await fetch(`${BASE_URL}/api/content/${requestId}`);

      if (getResponse.status === 200) {
        articleData = await getResponse.json();
        console.log('\n✅ Blog article generation completed!');
        break;
      } else if (getResponse.status === 404) {
        const errorData = await getResponse.json();
        console.log(`   ⏳ ${errorData.message}`);
        // Continue polling
      } else {
        throw new Error(`Unexpected status: ${getResponse.status}`);
      }
    }

    if (!articleData) {
      console.log('\n⚠️  Timeout: Blog generation is taking longer than expected.');
      console.log('   The article may still be generating. Check server logs or try again later.');
      console.log(`   Retrieve with: GET ${BASE_URL}/api/content/${requestId}`);
      return;
    }

    // Step 3: Display results
    console.log('\n📄 STEP 3: Blog Article Generated Successfully!\n');
    console.log('='.repeat(60));
    console.log('📋 Article Details:');
    console.log('   ID:', articleData.id);
    console.log('   Status:', articleData.status);
    console.log('   Generated At:', articleData.generatedAt);
    console.log('   Title:', articleData.article.title);
    console.log('   Word Count:', articleData.article.wordCount);
    console.log('   Sections:', articleData.article.sections.length);
    console.log('   Keywords:', articleData.article.metadata.keywords.join(', '));

    console.log('\n📝 Article Preview:');
    console.log('='.repeat(60));

    if (articleData.article.introduction) {
      console.log('\n🎯 Introduction:');
      console.log(articleData.article.introduction.substring(0, 200) + '...\n');
    }

    console.log('📚 Sections:');
    articleData.article.sections.forEach((section, index) => {
      console.log(`\n${index + 1}. ${section.heading}`);
      console.log('   ' + section.content.substring(0, 150) + '...');
    });

    if (articleData.article.conclusion) {
      console.log('\n✅ Conclusion:');
      console.log(articleData.article.conclusion.substring(0, 200) + '...\n');
    }

    console.log('\n='.repeat(60));
    console.log('💾 Full Markdown Content Length:', articleData.fullContent.length, 'characters');
    console.log('\n💡 To see the full article, access:');
    console.log(`   GET ${BASE_URL}/api/content/${requestId}`);
    console.log('\n✨ Test completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during workflow test:');
    console.error('   Message:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Make sure the server is running: npm run dev');
    console.error('   2. Check that GEMINI_API_KEY is set in .env');
    console.error('   3. Review server logs for detailed error messages');
  }
}

// Run the test
console.log('Starting test in 2 seconds...\n');
setTimeout(testCompleteWorkflow, 2000);
