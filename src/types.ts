export interface ImageAnalysis {
  id: string;
  timestamp: string;
  width: number;
  height: number;
  format: string;
  description: string;
  labels: string[];
  rawAnalysis: any;
}

export interface DocumentContent {
  id: string;
  timestamp: string;
  filename: string;
  text: string;
  metadata: {
    pages?: number;
    title?: string;
    author?: string;
    [key: string]: any;
  };
}

export interface AudioTranscription {
  id: string;
  timestamp: string;
  text: string;
  duration?: number;
  language?: string;
}

export interface OCRResult {
  id: string;
  timestamp: string;
  text: string;
  confidence: number;
  boundingBoxes?: Array<{
    text: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
}
