import fs from 'fs';
import fsPromises from 'fs/promises';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { groqClientPool } from '../groq-client';
import { DocumentContent } from '../types';

const logger = pino({ name: 'document-engine' });

export class DocumentEngine {
  public readonly id = 'multimodal:documents';

  /**
   * Parses text and metadata from PDF file using pdf-parse.
   */
  public async parsePDF(filePath: string): Promise<DocumentContent> {
    logger.info({ filePath }, 'Parsing PDF file');
    try {
      const dataBuffer = await fsPromises.readFile(filePath);
      const data = await pdfParse(dataBuffer);

      return {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        filename: filePath.split('/').pop() || 'unknown',
        text: data.text,
        metadata: {
          pages: data.numpages,
          info: data.info,
          metadata: data.metadata,
          version: data.version,
        },
      };
    } catch (error) {
      logger.error({ error, filePath }, 'Failed to parse PDF');
      throw error;
    }
  }

  /**
   * Parses text and metadata from a Word (.docx) document using mammoth.
   */
  public async parseDocx(filePath: string): Promise<DocumentContent> {
    logger.info({ filePath }, 'Parsing Docx file');
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        filename: filePath.split('/').pop() || 'unknown',
        text: result.value,
        metadata: {
          warnings: result.messages,
        },
      };
    } catch (error) {
      logger.error({ error, filePath }, 'Failed to parse Docx');
      throw error;
    }
  }

  /**
   * Summarizes parsed document text content using Groq.
   */
  public async summarize(content: string): Promise<string> {
    logger.info('Summarizing document content');
    try {
      const response = await groqClientPool.chatCompletion({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert document summarization assistant. Provide a structured, comprehensive summary highlighting the key points, main conclusions, and critical details of the text below. Keep the output organized with appropriate headings or bullet points.',
          },
          {
            role: 'user',
            content: `Document Content:\n\n${content}`,
          },
        ],
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Failed to generate summary.';
    } catch (error) {
      logger.error({ error }, 'Error during summarization');
      throw error;
    }
  }
}

export const documentEngine = new DocumentEngine();
