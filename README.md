# Helpful Computer: Your Real-Time AI Voice Assistant

**Helpful Computer** provides a seamless, low-latency voice interface for interacting with an AI assistant.

![Helpful Computer Overview](overview.gif)

## Key Features

- **Real-Time Voice Interaction**: Stream your voice directly to OpenAI's `gpt-4o-realtime` model and receive spoken
  responses with minimal delay.
- **AI-Controlled Canvas**: Includes an integrated Excalidraw canvas that the AI agent can use to draw diagrams and
  visualize concepts.
- **AI-Powered Text Editor**: A Lexical text editor pane allows the AI to write and edit text, from code snippets to
  long-form content.

## Getting Started

Follow these instructions to get a local copy of Helpful Computer up and running for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- [Rust](https://www.rust-lang.org/tools/install)

### Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/helpful-computer.git
   cd helpful-computer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**

   Create a `.env.local` file in the root of the project and add your OpenAI API key:

   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

   This key is used to generate ephemeral session tokens for making requests to the OpenAI API.

### Running the Application

- **Development Mode:**
  To run the app with hot-reloading and developer tools, use:
  ```bash
  npm run tauri:dev
  ```

### Running Tests

To run the test suite, use the following command:

```bash
  npm test
```
