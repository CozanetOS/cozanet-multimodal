import Groq from 'groq-sdk';
import pino from 'pino';

const logger = pino({ name: 'groq-client' });

export class GroqClient {
  private clients: Groq[] = [];
  private currentIndex = 0;

  constructor() {
    const keys = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
    ].filter((key): key is string => !!key);

    if (keys.length === 0) {
      logger.warn('No Groq API keys found in GROQ_API_KEY_1, GROQ_API_KEY_2, or GROQ_API_KEY_3. Falling back to GROQ_API_KEY.');
      if (process.env.GROQ_API_KEY) {
        keys.push(process.env.GROQ_API_KEY);
      } else {
        logger.error('No Groq API keys available at all. Requests will fail.');
      }
    }

    this.clients = keys.map(key => new Groq({ apiKey: key }));
    logger.info({ keyCount: this.clients.length }, 'Initialized GroqClient round-robin pool');
  }

  public getClient(): Groq {
    if (this.clients.length === 0) {
      throw new Error('No Groq API keys configured. Please set GROQ_API_KEY_1, GROQ_API_KEY_2, or GROQ_API_KEY_3.');
    }
    const client = this.clients[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.clients.length;
    return client;
  }

  public async chatCompletion(params: Parameters<Groq['chat']['completions']['create']>[0]) {
    const client = this.getClient();
    return client.chat.completions.create(params);
  }
}

export const groqClientPool = new GroqClient();
