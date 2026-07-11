# CozanetOS Multimodal Engine (`cozanet-multimodal`)

> **AI-Native OS Perceptual Engine: Real-time Audio, Speech, Vision, and Document Understanding**

`cozanet-multimodal` is the unified perceptual pipeline of CozanetOS. It serves as the primary system interface for sensory inputs, allowing the OS to understand and interact with the physical and digital world in real-time through voice, images, video feeds, system screens, and complex multi-page document payloads.

---

## 🚀 Key Capabilities

- **Voice Conversation**: Sub-second, full-duplex spoken dialogue engine with natural turn-taking detection and interruption handling.
- **Speech Synthesis (TTS)**: Low-latency, expressive text-to-speech engine supporting custom voices, emotional tone variation, and multiple languages.
- **Speech Recognition (STT)**: Highly accurate, noise-resilient speech-to-text transcription with speaker diarization.
- **Image Understanding**: Advanced computer vision pipeline providing object detection, scene parsing, geometric layout classification, and high-fidelity captioning.
- **Video Understanding**: Frame-by-frame video stream analysis, spatial-temporal modeling, and instant event summarization.
- **Document Understanding**: Intelligent extraction from PDFs, Word documents, and spreadsheets, retaining layout structure, tables, and nested graphs.
- **Optical Character Recognition (OCR)**: Multilingual text extraction from low-contrast, skewed, or handwritten document scans and image frames.
- **Camera Input Integration**: Low-level drivers to consume real-time video feeds from system cameras or external video inputs.
- **Screen Understanding**: Real-time screen scraping and UI layout analysis, mapping pixel elements to interactive controls (buttons, links, text inputs).
- **Audio Analysis**: Tone, emotional sentiment, background noise classification, and voice-biometric speaker identification.
- **Multi-Language Support**: Simultaneous translation and transcription across 80+ spoken and written languages.
- **Real-Time Processing**: Designed for sub-100ms streaming audio inference and high-FPS video pipelines.
- **Extensive Format Support**: Native parsing for JPG, PNG, GIF, MP4, MOV, MP3, WAV, PDF, DOCX, XLSX, and more.
- **Optimized Vision Pipeline**: Fully parallelized architecture: Raw Data → Decollation & Pre-processing → Model Inference (VLM/CNN) → Layout Reconstruction & Post-processing.

---

## 🛠️ Architecture & Component Breakdown

```
        ┌────────────────────────────────────────────────────────┐
        │            Hardware Inputs (Mic, Camera, Screen)        │
        └───────────────────────────┬────────────────────────────┘
                                    ▼
        ┌────────────────────────────────────────────────────────┐
        │                 cozanet-multimodal Pipeline            │
        │                                                        │
        │  ┌───────────────────────┐    ┌──────────────────────┐ │
        │  │   Audio / TTS / STT   │    │  Vision & Screen OCR │ │
        │  └───────────────────────┘    └──────────────────────┘ │
        └───────────────────────────┬────────────────────────────┘
                                    ▼
        ┌────────────────────────────────────────────────────────┐
        │             CozanetOS Core Semantic Layer             │
        └────────────────────────────────────────────────────────┘
```

- **Audio Pipeline**: Controls low-latency WebSocket interfaces for microphone streams, performing real-time silence detection and routing audio chunks to Whisper/TTS engines.
- **Vision Pipeline**: Hardware-accelerated image and video decoding (utilizing GPU/NPU bounds), generating geometric coordinates for screen buttons and parsing tabular documents.

---

## 🔌 API & Interface Overview

`cozanet-multimodal` exposes a high-throughput WebSocket API for real-time streaming alongside standard REST endpoints.

### Process a Screen Image for Interactive Elements

```bash
curl -X POST http://localhost:8085/v1/multimodal/analyze-ui   -H "Authorization: Bearer $COZANET_TOKEN"   -F "file=@screen_capture.png"   -F "options={"ocr": true, "detect_buttons": true}"
```

**Response:**
```json
{
  "dimensions": {"width": 1920, "height": 1080},
  "ui_elements": [
    {
      "type": "button",
      "text": "Submit Payment",
      "bounding_box": [120, 450, 200, 500],
      "confidence": 0.99
    }
  ]
}
```

---

## 🔗 Integration with Other CozanetOS Modules

- `cozanet-agents`: Equips agents with environmental and user awareness, enabling them to "see" and "hear" what the user is doing.
- `cozanet-core`: Connects system-wide UI layouts directly to the operating system's main event loop and task scheduler.
- `cozanet-cx7`: Acts as the perceptual input-output layer for the primary Cozanet CX7 neural shell.
- `cozanet-device`: Translates high-level video and voice processing intents into raw hardware control (microphone arrays, display panels, GPU pipelines).

---

## ⚡ Quick-Start Notes

### Prerequisites
- Python >= 3.10 with pip, CUDA toolkit (highly recommended for local GPU acceleration).
- System-level libraries: `ffmpeg`, `libsndfile1`.

### Installation
```bash
git clone https://github.com/CozanetOS/cozanet-multimodal.git
cd cozanet-multimodal
pip install -r requirements.txt
```

### Start the Perception Server
```bash
python -m cozanet_multimodal.server --port 8085
# Perceptual endpoints ready at http://localhost:8085
```
