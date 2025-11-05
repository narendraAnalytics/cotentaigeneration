/**
 * Test script for Email Functionality
 *
 * Run with: node test-email.js YOUR_EMAIL_HERE REQUEST_ID
 * Example: node test-email.js user@example.com 5f50341d-9a72-419a-9ccb-bd9d72c0ac36
 */

const BASE_URL = 'http://localhost:3000';

async function testEmailSending() {
  // Get email and requestId from command line arguments
  const email = process.argv[2];
  const requestId = process.argv[3];

  if (!email || !requestId) {
    console.log('❌ Error: Missing arguments');
    console.log('\n📖 Usage:');
    console.log('   node test-email.js YOUR_EMAIL REQUEST_ID');
    console.log('\n📝 Example:');
    console.log('   node test-email.js user@example.com 5f50341d-9a72-419a-9ccb-bd9d72c0ac36');
    console.log('\n💡 Tip: Generate a blog first with test-complete-workflow.js to get a requestId');
    process.exit(1);
  }

  console.log('📧 Testing Email Sending...\n');
  console.log('='.repeat(60));
  console.log('📋 Request ID:', requestId);
  console.log('📨 Email To:', email);
  console.log('='.repeat(60));

  try {
    console.log('\n📤 Sending email request...');

    const response = await fetch(`${BASE_URL}/api/send-blog-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requestId,
        email
      })
    });

    const data = await response.json();

    console.log('\n📊 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ SUCCESS! Email has been sent!');
      console.log('📧 Check your inbox:', email);
      console.log('✉️  Message ID:', data.messageId);
      console.log('\n💡 The email contains:');
      console.log('   • Full blog article (HTML formatted)');
      console.log('   • Beautiful styling');
      console.log('   • All sections and content');
      console.log('   • SEO keywords');
    } else {
      console.log('\n❌ Failed to send email');
      console.log('Error:', data.error || 'Unknown error');

      if (response.status === 404) {
        console.log('\n💡 Troubleshooting:');
        console.log('   • The blog might still be generating (wait 60 seconds)');
        console.log('   • Check if the requestId is correct');
        console.log('   • Run: GET http://localhost:3000/api/content/' + requestId);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:');
    console.error('   Message:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Make sure the server is running: npm run dev');
    console.error('   2. Check RESEND_API_KEY is set in .env');
    console.error('   3. Verify the requestId is valid');
  }
}

testEmailSending();
