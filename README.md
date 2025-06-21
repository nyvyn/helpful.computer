# Helpful Computer

**Helpful Computer** is a real-time voice assistant powered by OpenAI. The project combines Next.js, React, and Tauri to provide a cross-platform desktop experience. Voice input is streamed directly to OpenAI's realtime APIs and responses are read back to you with minimal latency.

## Features

- Works as a desktop application via Tauri.
- Streams your microphone audio to OpenAI's `gpt-4o-realtime` model.
- Speaks responses aloud while also showing a visual audio indicator.
- The audio-visualizer sidebar starts at 350 px and can be resized by dragging
  the vertical divider, letting you allocate more or less space to the canvas.
- Includes an Excalidraw canvas controlled by the AI agent.
- The canvas agent can read the current drawing via the `canvas_state` tool.

## Getting Started

```bash
# Install dependencies
npm install

# Run the app in development mode
npm run dev

# For a native desktop build with Tauri
npm run tauri:dev
```

### Environment variables

Set `NEXT_PUBLIC_OPENAI_API_KEY` in your shell or `.env` file. This key is used to generate ephemeral session tokens for OpenAI.

### Running tests

Use `npm test` to execute the Vitest suite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) with the [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) extension and [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

