/**
 * Download Latest Generated Audio
 *
 * Usage: node download-latest-audio.js [requestId]
 *
 * If requestId is provided, downloads that specific audio.
 * Otherwise, you'll need to provide the requestId from your test run.
 */

const fs = require('fs');
const BASE_URL = 'http://localhost:3000';

async function downloadAudio() {
  const requestId = process.argv[2];

  if (!requestId) {
    console.log('❌ Error: RequestId required');
    console.log('\n📖 Usage:');
    console.log('   node download-latest-audio.js YOUR_REQUEST_ID');
    console.log('\n💡 Find your requestId from the test output (look for "Request ID: ...")');
    console.log('\n📝 Example:');
    console.log('   node download-latest-audio.js f20c245d-9ebc-498d-bd7b-f7d2b121fe38');
    process.exit(1);
  }

  console.log('🎵 Downloading TTS Audio...\n');
  console.log('Request ID:', requestId);
  console.log('='.repeat(70));

  try {
    // Download audio
    console.log('\n📥 Fetching audio from server...');
    const response = await fetch(`${BASE_URL}/api/audio/${requestId}`);

    if (!response.ok) {
      if (response.status === 404) {
        const error = await response.json();
        console.log('\n❌ Audio Not Found');
        console.log('Message:', error.message);
        console.log('\n💡 Possible reasons:');
        console.log('   • TTS is still generating (wait a few more seconds)');
        console.log('   • RequestId is incorrect');
        console.log('   • TTS generation failed (check server logs)');
        return;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Get audio metadata from headers
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    const sampleRate = response.headers.get('x-audio-sample-rate');
    const channels = response.headers.get('x-audio-channels');
    const articleTitle = response.headers.get('x-article-title');

    console.log('\n✅ Audio Found!');
    console.log('='.repeat(70));
    console.log('Article:', articleTitle || 'Unknown');
    console.log('Format:', contentType);
    console.log('Sample Rate:', sampleRate, 'Hz');
    console.log('Channels:', channels === '1' ? 'Mono' : 'Stereo');
    console.log('Size:', (parseInt(contentLength) / 1024).toFixed(2), 'KB');

    // Estimate duration
    const bytes = parseInt(contentLength);
    const samples = bytes / 2; // 16-bit = 2 bytes per sample
    const durationSeconds = samples / (parseInt(sampleRate) * parseInt(channels));
    const mins = Math.floor(durationSeconds / 60);
    const secs = Math.floor(durationSeconds % 60);
    console.log('Estimated Duration:', `${mins}:${secs.toString().padStart(2, '0')}`);

    // Save to file
    const filename = `audio-${requestId}.pcm`;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(filename, buffer);

    console.log('\n💾 Audio Saved!');
    console.log('='.repeat(70));
    console.log('Filename:', filename);
    console.log('Location:', process.cwd());
    console.log('Full Path:', `${process.cwd()}\\${filename}`);

    console.log('\n🔊 To Play the Audio:');
    console.log('='.repeat(70));
    console.log('Using FFplay (recommended):');
    console.log(`   ffplay -f s16le -ar ${sampleRate} -ac ${channels} ${filename}`);
    console.log('\nConvert to WAV:');
    console.log(`   ffmpeg -f s16le -ar ${sampleRate} -ac ${channels} -i ${filename} output.wav`);
    console.log('\n✨ Download complete!');

  } catch (error) {
    console.error('\n❌ Error downloading audio:');
    console.error('Message:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Make sure the server is running: npm run dev');
    console.error('   2. Check if the requestId is correct');
    console.error('   3. Verify TTS generation completed (check server logs)');
    console.error('   4. Try accessing: ' + `${BASE_URL}/api/audio/${requestId}`);
  }
}

downloadAudio();
