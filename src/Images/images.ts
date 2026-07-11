import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { groqClientPool } from '../groq-client';
import { ImageAnalysis } from '../types';

const logger = pino({ name: 'image-engine' });

export class ImageEngine {
  public readonly id = 'multimodal:images';

  /**
   * Resizes an input image buffer to custom width and height.
   */
  public async resize(input: Buffer, width: number, height: number): Promise<Buffer> {
    logger.info({ width, height }, 'Resizing image');
    try {
      return await sharp(input).resize(width, height).toBuffer();
    } catch (error) {
      logger.error({ error }, 'Failed to resize image');
      throw error;
    }
  }

  /**
   * Converts a local image file to a base64 string suitable for Groq vision models.
   */
  public async toBase64(imagePath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(imagePath);
      return buffer.toString('base64');
    } catch (error) {
      logger.error({ error, imagePath }, 'Failed to convert image to Base64');
      throw error;
    }
  }

  /**
   * Analyzes an image using Groq vision models (e.g. llama-3.2-11b-vision-preview).
   */
  public async analyze(imagePath: string, prompt: string = 'Describe this image in detail.'): Promise<ImageAnalysis> {
    logger.info({ imagePath }, 'Starting image analysis');
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const metadata = await sharp(imageBuffer).metadata();
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);

      const response = await groqClientPool.chatCompletion({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
      });

      const description = response.choices[0]?.message?.content || 'No description returned.';

      // Get high-level labels based on description via an extra quick completion or parsing
      const labelResponse = await groqClientPool.chatCompletion({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an image labeling assistant. Based on the description, provide a comma-separated list of up to 5 simple, high-level labels/tags describing the subject matter. Return ONLY the comma-separated labels and nothing else.',
          },
          {
            role: 'user',
            content: `Description: ${description}`,
          },
        ],
      });

      const labelsText = labelResponse.choices[0]?.message?.content || '';
      const labels = labelsText
        .split(',')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      return {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        description,
        labels,
        rawAnalysis: response,
      };
    } catch (error) {
      logger.error({ error, imagePath }, 'Error analyzing image');
      throw error;
    }
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }
}

export const imageEngine = new ImageEngine();
