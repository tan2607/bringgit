## Setup

Make sure to install dependencies:

```bash
# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# bun
bun run dev -o
```

## Production

Build the application for production:

```bash
# bun
bun run build
```

Locally preview production build:

```bash
# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Voice Translation Feature

### Prerequisites
- Obtain API keys for the following services:
  1. [Groq API Key](https://console.groq.com/keys) - For speech transcription and translation
  2. [Cartesia API Key](https://www.cartesia.ai/) - For text-to-speech (optional)

### Configuration
1. Copy `.env.example` to `.env`
2. Replace the placeholders with your actual API keys:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   CARTESIA_API_KEY=your_cartesia_api_key_here
   ```

### Feature Overview
The voice translation feature allows users to:
- Record audio in the source language
- Transcribe the audio to text
- Translate the transcribed text to the target language
- Optionally generate speech in the target language

### Supported Languages
- Transcription: Multiple languages supported via Groq's Whisper model
- Translation: Powered by Groq's language models
- Text-to-Speech: Supports multiple languages via Cartesia

### Private models that are small and high performance
- Computer use: UI-TAR 7B/72B (ByteDance) + Midscene.js
- Phi-4 (14b)
- Reasoning (Deepseek r1)
- OCR (Gemini 2 Flash)