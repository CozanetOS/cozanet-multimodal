import fs from 'fs/promises';
import path from 'path';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { groqClientPool } from '../groq-client';
import { OCRResult } from '../types';

const logger = pino({ name: 'ocr-engine' });

export class OCREngine {
  public readonly id = 'multimodal:ocr';

  /**
   * Extracts text from an image utilizing Groq's high-capability vision models.
   */
  public async extractText(imagePath: string): Promise<OCRResult> {
    logger.info({ imagePath }, 'Starting OCR extract text operations');
    try {
      const buffer = await fs.readFile(imagePath);
      const base64Image = buffer.toString('base64');
      const ext = path.extname(imagePath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

      const response = await groqClientPool.chatCompletion({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Perform Optical Character Recognition (OCR) on this image. Extract all readable text exactly as it appears. Do not summarize or explain. If there are tables or structural text, preserve the visual structure as closely as possible.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
      });

      const extractedText = response.choices[0]?.message?.content || '';

      return {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        text: extractedText,
        confidence: extractedText.trim().length > 0 ? 0.95 : 0.0, // Model confidence estimation placeholder
      };
    } catch (error) {
      logger.error({ error, imagePath }, 'Failed to extract text from image');
      throw error;
    }
  }
}

export const ocrEngine = new OCREngine();
