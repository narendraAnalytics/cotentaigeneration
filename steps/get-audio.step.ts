import { ApiRouteConfig } from 'motia';
import type { ApiRouteHandler } from 'motia';
import { z } from 'zod';

/**
 * Response schemas for the audio endpoint
 */
const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string()
});

/**
 * Generate WAV header for PCM audio data
 * @param pcmData - Raw PCM audio data buffer
 * @param sampleRate - Sample rate in Hz (e.g., 24000)
 * @param channels - Number of channels (1 for mono, 2 for stereo)
 * @param bitsPerSample - Bits per sample (typically 16)
 * @returns WAV file buffer (header + PCM data)
 */
function createWavFile(
  pcmData: Buffer,
  sampleRate: number = 24000,
  channels: number = 1,
  bitsPerSample: number = 16
): Buffer {
  const headerSize = 44;
  const dataSize = pcmData.length;
  const fileSize = headerSize + dataSize - 8;

  const header = Buffer.alloc(headerSize);

  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);

  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28); // byte rate
  header.writeUInt16LE(channels * bitsPerSample / 8, 32); // block align
  header.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  // Combine header + PCM data
  return Buffer.concat([header, pcmData]);
}

/**
 * API Step Configuration
 * Download TTS audio by request ID
 */
export const config: ApiRouteConfig = {
  name: 'GetAudio',
  type: 'api',
  description: 'Download or stream TTS audio file by request ID',
  path: '/api/audio/:id',
  method: 'GET',
  emits: [],
  flows: ['content-generation'],
  responseSchema: {
    200: z.any(), // Binary audio data
    404: ErrorResponseSchema,
    500: ErrorResponseSchema
  }
};

/**
 * API Handler
 * Retrieves TTS audio from state and returns as downloadable file
 */
export const handler: ApiRouteHandler = async (req, { logger, state }) => {
  const { id } = req.pathParams;

  try {
    logger.info('Retrieving TTS audio', { requestId: id });

    // Get the TTS audio data from state
    const ttsData = await state.get<any>('tts', id);

    if (!ttsData) {
      logger.warn('TTS audio not found', { requestId: id });
      return {
        status: 404,
        body: {
          error: 'Not Found',
          message: `No TTS audio found for request ID: ${id}. The audio may still be generating, or the ID is invalid.`
        }
      };
    }

    // Check if TTS generation failed
    if (ttsData.error || ttsData.status === 'failed') {
      logger.error('TTS generation failed for this request', {
        requestId: id,
        error: ttsData.error
      });
      return {
        status: 500,
        body: {
          error: 'TTS Generation Failed',
          message: `Audio generation failed: ${ttsData.error || 'Unknown error'}`
        }
      };
    }

    // Check if audio data exists
    if (!ttsData.audioData) {
      logger.error('TTS data found but audioData is missing', { requestId: id });
      return {
        status: 500,
        body: {
          error: 'Invalid Data',
          message: 'Audio data is missing or corrupted.'
        }
      };
    }

    logger.info('TTS audio found, preparing download', {
      requestId: id,
      format: ttsData.format,
      sampleRate: ttsData.sampleRate,
      channels: ttsData.channels,
      dataLength: ttsData.audioData.length
    });

    // Decode base64 to binary buffer (raw PCM data)
    const pcmBuffer = Buffer.from(ttsData.audioData, 'base64');

    // Convert PCM to WAV format by adding WAV header
    const sampleRate = ttsData.sampleRate || 24000;
    const channels = ttsData.channels || 1;
    const wavBuffer = createWavFile(pcmBuffer, sampleRate, channels, 16);

    logger.info('Audio file prepared for download as WAV', {
      requestId: id,
      pcmSize: pcmBuffer.length,
      wavSize: wavBuffer.length,
      articleTitle: ttsData.articleTitle
    });

    // Return WAV audio file with proper headers
    return {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': `attachment; filename="blog-audio-${id}.wav"`,
        'Content-Length': wavBuffer.length.toString(),
        'X-Audio-Format': 'wav',
        'X-Audio-Sample-Rate': sampleRate.toString(),
        'X-Audio-Channels': channels.toString(),
        'X-Article-Title': ttsData.articleTitle || 'Unknown'
      },
      body: wavBuffer
    };

  } catch (error) {
    logger.error('Failed to retrieve TTS audio', {
      requestId: id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      status: 500,
      body: {
        error: 'Internal Server Error',
        message: 'Failed to retrieve audio. Please try again later.'
      }
    };
  }
};
