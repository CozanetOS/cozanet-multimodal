# Cozanet Multimodal

A robust multi-modal processing engine built with TypeScript. Leveraging state-of-the-art AI models, Groq vision capabilities, and local utility libraries.

## Philosophy
- **Groq Vision Models**: Uses model `llama-3.2-11b-vision-preview` for high-fidelity image analysis and Optical Character Recognition (OCR).
- **Production-Ready Utilities**: Uses standard libraries like `sharp` for image resizing and manipulation, `pdf-parse` for PDF document extraction, and `mammoth` for DOCX parsing.
- **Round-Robin Client Pool**: Rotates through API keys (`GROQ_API_KEY_1`, `GROQ_API_KEY_2`, `GROQ_API_KEY_3`) to ensure high availability and rate limit mitigation.

## Features
- **Image Processing (`multimodal:images`)**:
  - `analyze(imagePath, prompt)` - Uses Groq's Vision LLMs to describe and inspect images.
  - `resize(input, width, height)` - Uses `sharp` to scale images.
  - `toBase64(imagePath)` - Utility to convert local images to Base64 data strings.
- **Document Processing (`multimodal:documents`)**:
  - `parsePDF(path)` - Extracts full text and metadata using `pdf-parse`.
  - `parseDocx(path)` - Parses Microsoft Word files via `mammoth`.
  - `summarize(content)` - Crafts high-quality summaries of text using Groq.
- **OCR Engine (`multimodal:ocr`)**:
  - `extractText(imagePath)` - Leverages vision models to extract structured or layout-preserved text.
- **Stubs & Extensibility**: Includes fully typed engines for audio (`multimodal:audio`), screen capturing (`multimodal:screen`), and voice translation/synthesis (`multimodal:voice`).

## Installation

```bash
npm install
```

## Setup API Keys
Ensure you configure at least one Groq API key:
```bash
export GROQ_API_KEY_1="gsk_..."
export GROQ_API_KEY_2="gsk_..."
export GROQ_API_KEY_3="gsk_..."
```
