/**
 * Complete Workflow Test with Email
 *
 * This script:
 * 1. Generates a blog article
 * 2. Waits for completion
 * 3. Sends it to your email
 *
 * Run with: node test-complete-workflow-with-email.js YOUR_EMAIL@example.com
 */

const BASE_URL = 'http://localhost:3000';

const testRequest = {
  topic: "AI Changed Business Strategies in 2025",
  keywords: [
    "AI",
    "business strategies",
    "digital transformation",
    "AI adoption",
    "business innovation"
  ],
  targetAudience: "Tech enthusiasts and business professionals",
  additionalContext: "Focus on how AI is transforming business models, decision-making processes, and competitive advantages in 2025",
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

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testCompleteWorkflowWithEmail() {
  // Get email from command line
  const email = process.argv[2];

  if (!email) {
    console.log('❌ Error: Email address required');
    console.log('\n📖 Usage:');
    console.log('   node test-complete-workflow-with-email.js YOUR_EMAIL@example.com');
    console.log('\n📝 Example:');
    console.log('   node test-complete-workflow-with-email.js john@example.com');
    process.exit(1);
  }

  console.log('🚀 AI Copywriting - Complete Workflow + Email Test\n');
  console.log('='.repeat(60));
  console.log('📧 Email will be sent to:', email);
  console.log('='.repeat(60));

  try {
    // STEP 1: Generate blog
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

    const requestId = generateData.id;

    // STEP 2: Wait for completion
    console.log('\n⏳ STEP 2: Waiting for blog generation to complete...');
    console.log('   (This may take 30-60 seconds with Gemini AI + Google Search)');

    let attempts = 0;
    const maxAttempts = 30;
    let articleData = null;

    while (attempts < maxAttempts) {
      attempts++;
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
      } else {
        throw new Error(`Unexpected status: ${getResponse.status}`);
      }
    }

    if (!articleData) {
      console.log('\n⚠️  Timeout: Blog generation is taking longer than expected.');
      console.log(`   Try sending email manually later with: node test-email.js ${email} ${requestId}`);
      return;
    }

    // Display article preview
    console.log('\n📄 Blog Article Generated:');
    console.log('='.repeat(60));
    console.log('   Title:', articleData.article.title);
    console.log('   Word Count:', articleData.article.wordCount);
    console.log('   Sections:', articleData.article.sections.length);
    console.log('   Keywords:', articleData.article.metadata.keywords.slice(0, 5).join(', '));

    // STEP 3: Send email
    console.log('\n📧 STEP 3: Sending blog article via email...');
    console.log('   Email To:', email);
    console.log('   Request ID:', requestId);

    const emailResponse = await fetch(`${BASE_URL}/api/send-blog-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId,
        email
      })
    });

    const emailData = await emailResponse.json();

    console.log('\n📊 Email Response:', JSON.stringify(emailData, null, 2));

    if (emailResponse.ok && emailData.success) {
      console.log('\n✅ SUCCESS! Email has been sent!');
      console.log('='.repeat(60));
      console.log('📧 Check your inbox:', email);
      console.log('✉️  Message ID:', emailData.messageId);
      console.log('📝 Article Title:', articleData.article.title);
      console.log('\n💡 The email contains:');
      console.log('   • Full blog article (HTML formatted)');
      console.log('   • Beautiful gradient styling');
      console.log('   • All sections and content');
      console.log('   • SEO keywords');
      console.log('   • Word count and metadata');
      console.log('\n✨ Complete workflow test finished successfully!');
    } else {
      console.log('\n❌ Failed to send email');
      console.log('Error:', emailData.error || 'Unknown error');
      console.log('\n💡 You can try sending manually:');
      console.log(`   node test-email.js ${email} ${requestId}`);
    }

  } catch (error) {
    console.error('\n❌ Error during workflow test:');
    console.error('   Message:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Make sure the server is running: npm run dev');
    console.error('   2. Check GEMINI_API_KEY is set in .env');
    console.error('   3. Check RESEND_API_KEY is set in .env');
    console.error('   4. Review server logs for detailed errors');
  }
}

// Run the test
testCompleteWorkflowWithEmail();
