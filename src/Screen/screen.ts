import pino from 'pino';

const logger = pino({ name: 'screen-engine' });

export class ScreenEngine {
  public readonly id = 'multimodal:screen';

  /**
   * Captures screen contents. (Placeholder stub)
   */
  public async capture(): Promise<Buffer> {
    logger.info('Capturing screen (Stub)');
    return Buffer.from('Screen capture stub buffer');
  }
}

export const screenEngine = new ScreenEngine();
