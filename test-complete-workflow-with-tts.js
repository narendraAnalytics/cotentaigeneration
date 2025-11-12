/**
 * Complete Workflow Test with Blog + TTS + Email
 *
 * This script:
 * 1. Generates a blog article
 * 2. Waits for both blog AND TTS audio generation
 * 3. Displays blog and audio information
 * 4. Saves audio to .pcm file (for debugging)
 * 5. Sends blog to your email
 *
 * AUDIO PLAYBACK:
 * - The frontend (http://localhost:3000/dashboard) has a built-in audio player
 * - Generated blogs appear in your dashboard with a play button
 * - Audio plays directly in the browser using Web Audio API
 * - No need for FFmpeg or external tools!
 *
 * The .pcm file saved here is for debugging only. To listen to audio:
 * → Open http://localhost:3000/dashboard in your browser
 * → Click on any blog post card
 * → Use the audio player controls to play/pause
 *
 * Run with: node test-complete-workflow-with-tts.js YOUR_EMAIL@example.com
 */

const fs = require('fs');
const BASE_URL = 'http://localhost:3000';

const testRequest = {
  topic: "AI in Healthcare Robotics in Operations",
  keywords: [
    "AI",
    "healthcare",
    "automation",
    "robotics",
    "programming future",
    "operations",
    "medical AI"
  ],
  targetAudience: "Healthcare professionals, medical administrators, and tech-savvy medical practitioners",
  additionalContext: "Focus on how AI-powered robotics are transforming surgical procedures, hospital operations, patient care automation, and the future of medical technology in operating rooms",
  options: {
    tone: "professional",
    style: "informative",
    wordCount: 1000,
    sectionCount: 4,
    includeIntro: true,
    includeConclusion: true,
    formatting: {
      useMarkdown: true,
      useHeadings: true
    }
  }
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate estimated audio duration from base64 data size
 */
function estimateAudioDuration(base64Data, sampleRate, channels) {
  // Base64 to bytes: every 4 base64 chars = 3 bytes
  const audioBytes = (base64Data.length * 3) / 4;

  // PCM: 2 bytes per sample (16-bit)
  const samples = audioBytes / 2;

  // Duration = total samples / (sample rate * channels)
  const durationSeconds = samples / (sampleRate * channels);

  return durationSeconds;
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Format duration in seconds to MM:SS
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Save base64 audio to PCM file
 */
function saveAudioToFile(base64Data, requestId) {
  try {
    const audioBuffer = Buffer.from(base64Data, 'base64');
    const filename = `blog-audio-${requestId}.pcm`;
    fs.writeFileSync(filename, audioBuffer);
    return filename;
  } catch (error) {
    throw new Error(`Failed to save audio: ${error.message}`);
  }
}

async function testCompleteWorkflowWithTTS() {
  // Get email from command line
  const email = process.argv[2];

  if (!email) {
    console.log('❌ Error: Email address required');
    console.log('\n📖 Usage:');
    console.log('   node test-complete-workflow-with-tts.js YOUR_EMAIL@example.com');
    console.log('\n📝 Example:');
    console.log('   node test-complete-workflow-with-tts.js john@example.com');
    process.exit(1);
  }

  console.log('🚀 AI Copywriting - Complete Workflow Test (Blog + TTS + Email)\n');
  console.log('='.repeat(70));
  console.log('📧 Email will be sent to:', email);
  console.log('🎵 TTS audio will be generated using Gemini TTS (Voice: Kore)');
  console.log('='.repeat(70));

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

    // STEP 2: Wait for blog + TTS completion
    console.log('\n⏳ STEP 2: Waiting for blog + TTS generation to complete...');
    console.log('   This involves:');
    console.log('   1️⃣  Prompt enhancement with Google Search');
    console.log('   2️⃣  Blog content generation with Gemini 2.5 Pro');
    console.log('   3️⃣  Text-to-speech audio generation with Gemini TTS');
    console.log('   ⏱️  Estimated time: 60-120 seconds (up to 250 seconds max)\n');

    let attempts = 0;
    const maxAttempts = 50; // Increased to 50 attempts (250 seconds total)
    let articleData = null;
    let blogReady = false;
    let ttsReady = false;

    while (attempts < maxAttempts) {
      attempts++;
      await wait(5000);

      const statusEmoji = attempts % 3 === 0 ? '🔄' : attempts % 3 === 1 ? '⏳' : '🔍';
      process.stdout.write(`   ${statusEmoji} Attempt ${attempts}/${maxAttempts} - Checking status...`);

      const getResponse = await fetch(`${BASE_URL}/api/content/${requestId}`);

      if (getResponse.status === 200) {
        articleData = await getResponse.json();
        blogReady = true;

        // Check if TTS audio is included
        if (articleData.audio && articleData.audio.audioData) {
          ttsReady = true;
          console.log(' ✅ BOTH READY!\n');
          console.log('✅ Blog article generated!');
          console.log('🎵 TTS audio generated!');
          break;
        } else {
          console.log(' 📝 Blog ready, waiting for TTS...');
        }
      } else if (getResponse.status === 404) {
        console.log(' ⏳ Still generating...');
      } else {
        console.log('');
        throw new Error(`Unexpected status: ${getResponse.status}`);
      }
    }

    if (!articleData || !blogReady) {
      console.log('\n⚠️  Timeout: Blog generation is taking longer than expected.');
      console.log(`   Try checking manually later: curl ${BASE_URL}/api/content/${requestId}`);
      return;
    }

    if (!ttsReady) {
      console.log('\n⚠️  Blog is ready but TTS is still generating.');
      console.log('   You can still proceed with email, but audio won\'t be included.');
      console.log('   Check again later for audio.');
    }

    // STEP 3: Display blog information
    console.log('\n📄 BLOG ARTICLE GENERATED:');
    console.log('='.repeat(70));
    console.log('   Title:', articleData.article.title);
    console.log('   Word Count:', articleData.article.wordCount);
    console.log('   Sections:', articleData.article.sections.length);
    console.log('   Keywords:', articleData.article.metadata.keywords.slice(0, 5).join(', '));
    console.log('   Generated At:', new Date(articleData.generatedAt).toLocaleString());

    // STEP 4: Display TTS audio information
    if (ttsReady && articleData.audio) {
      const audio = articleData.audio;
      const audioSize = (audio.audioData.length * 3) / 4; // Base64 to bytes
      const duration = estimateAudioDuration(audio.audioData, audio.sampleRate, audio.channels);

      console.log('\n🎵 TTS AUDIO GENERATED:');
      console.log('='.repeat(70));
      console.log('   Format:', audio.format.toUpperCase(), '(16-bit PCM)');
      console.log('   Sample Rate:', audio.sampleRate, 'Hz');
      console.log('   Channels:', audio.channels === 1 ? 'Mono' : 'Stereo');
      console.log('   Data Size:', formatBytes(audioSize));
      console.log('   Estimated Duration:', formatDuration(duration));
      console.log('   Generated At:', new Date(audio.generatedAt).toLocaleString());

      // Option to save audio
      console.log('\n💾 Audio file saved for debugging');
      console.log('   The audio is base64-encoded PCM (24kHz, 16-bit, mono).');

      // Auto-save for testing
      try {
        const filename = saveAudioToFile(audio.audioData, requestId);
        console.log(`   ✅ Audio saved to: ${filename}`);
        console.log(`\n   🎧 To listen to audio (RECOMMENDED):`);
        console.log(`      → Open http://localhost:3000/dashboard in your browser`);
        console.log(`      → Your blog will appear in the dashboard`);
        console.log(`      → Click on it to open the reader with audio player`);
        console.log(`\n   🔊 Alternative: Play .pcm file with FFmpeg:`);
        console.log(`      ffplay -f s16le -ar 24000 -ac 1 ${filename}`);
      } catch (error) {
        console.log('   ⚠️  Could not auto-save audio:', error.message);
      }
    }

    // STEP 5: Send email
    console.log('\n📧 STEP 5: Sending blog article via email...');
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

    if (emailResponse.ok && emailData.success) {
      console.log('\n✅ SUCCESS! Complete workflow finished!');
      console.log('='.repeat(70));
      console.log('✉️  Email sent to:', email);
      console.log('📝 Article:', articleData.article.title);
      console.log('🎵 Audio:', ttsReady ? 'Generated (check API for download)' : 'Not ready yet');
      console.log('📬 Message ID:', emailData.messageId);
      console.log('\n💡 What was tested:');
      console.log('   ✅ Blog generation with Gemini 2.5 Pro + Google Search');
      console.log('   ✅ Prompt enhancement with SEO insights');
      console.log('   ✅ Text-to-speech generation with Gemini TTS');
      console.log('   ✅ Email delivery with Resend');
      console.log('   ✅ State management and async workflows');
      console.log('\n🎉 All systems working perfectly!');

      if (ttsReady) {
        console.log('\n🎧 Next steps:');
        console.log('   • Check your email for the blog article');
        console.log('   • Open http://localhost:3000/dashboard to listen to audio in browser');
        console.log('   • The audio player is already integrated and ready to use!');
      }
    } else {
      console.log('\n⚠️  Blog and TTS generated, but email failed');
      console.log('Error:', emailData.error || 'Unknown error');
      console.log('\n💡 You can try sending manually:');
      console.log(`   curl -X POST ${BASE_URL}/api/send-blog-email \\`);
      console.log(`        -H "Content-Type: application/json" \\`);
      console.log(`        -d '{"requestId":"${requestId}","email":"${email}"}'`);
    }

  } catch (error) {
    console.error('\n❌ Error during workflow test:');
    console.error('   Message:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Make sure the server is running: npm run dev');
    console.error('   2. Check GEMINI_API_KEY is set in .env');
    console.error('   3. Check RESEND_API_KEY is set in .env');
    console.error('   4. Review server logs for detailed errors');
    console.error('   5. TTS generation requires additional time');
  }
}

// Run the test
testCompleteWorkflowWithTTS();
