# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Helpful Computer**, a real-time AI voice assistant desktop application built as a Tauri app with Next.js frontend. The app provides seamless voice interaction with OpenAI's `gpt-4o-realtime` model and features AI-controlled tools for drawing, writing, browsing, and computer interaction.

## Tech Stack

- **Frontend**: Next.js 15+ with React 19, TypeScript
- **Desktop**: Tauri 2.x (Rust backend)
- **AI**: OpenAI Agents Realtime SDK (`@openai/agents-realtime`)
- **Drawing**: Excalidraw integration
- **Text Editor**: Lexical editor
- **Testing**: Vitest with jsdom
- **Styling**: Tailwind CSS 4+
- **Build**: Static export (`output: "export"`) to `dist/` directory

## Essential Commands

### Development
```bash
npm run tauri:dev    # Start Tauri development server
npm run dev          # Start Next.js dev server only (for web testing)
```

### Building
```bash
npm run build        # Build Next.js static export to dist/
npm run tauri        # Run Tauri CLI commands
```

### Testing
```bash
npm test             # Run Vitest test suite (MUST pass before commits)
npm run lint         # Run Next.js ESLint
```

## Architecture

### Core Application Flow
1. **App Entry**: `app/page.tsx` → requests microphone permissions → renders `Dashboard`
2. **Main Dashboard**: `components/dashboard/Dashboard.tsx` manages the resizable sidebar and view switching
3. **Realtime Agent**: `hooks/useRealtimeAgent.ts` handles OpenAI session, tool routing, and view state
4. **Context**: `components/context/AppContext.tsx` provides shared state for editors and browser view

### View System
The app uses a tab-based view system with 5 main views:
- `DRAWING`: Excalidraw canvas (`components/excalidraw/ExcalidrawView.tsx`)
- `WRITING`: Lexical text editor (`components/lexical/LexicalView.tsx`)
- `COMPUTING`: Computer interaction view (`components/computer/ComputerView.tsx`)
- `BROWSING`: Browser iframe view (`components/browser/BrowserView.tsx`)
- `SETTINGS`: Settings panel (`components/settings/SettingsView.tsx`)

### Tool Architecture
Each view has corresponding tool hooks in `hooks/`:
- `useDrawingTools.ts`: Excalidraw canvas manipulation
- `useWritingTools.ts`: Lexical editor operations
- `useComputingTools.ts`: Computer interaction and screenshots
- `useBrowsingTools.ts`: Browser navigation and control

Tools are registered with the OpenAI agent and automatically switch views when called.

## Configuration Requirements

### Environment Variables
- `NEXT_PUBLIC_OPENAI_API_KEY`: Required for generating session tokens

### OpenAI API Key Management
- Keys are managed through `lib/manageOpenAIKey.ts`
- First checks `NEXT_PUBLIC_OPENAI_API_KEY` environment variable
- Falls back to Tauri store (`settings.json`) for runtime configuration
- Session tokens are generated ephemeral for realtime API

## Development Guidelines

### Testing Requirements
- **CRITICAL**: Always run `npm test` and ensure all tests pass before committing
- Tests use Vitest with jsdom environment
- Place test files next to source files (e.g., `Component.tsx` + `Component.test.tsx`)
- Do NOT use separate `__tests__` directories

### Code Style
- TypeScript strict mode enabled
- Use existing component patterns and imports
- Follow Next.js App Router conventions
- SSG only (no SSR) - this is a Tauri app

### File Structure
- Components organized by feature in `components/`
- Custom hooks in `hooks/`
- Utilities in `lib/`
- Tauri backend code in `src-tauri/`

### Tauri Integration
- Frontend runs as static files in Tauri webview
- Microphone permissions handled via `tauri-plugin-macos-permissions-api`
- Settings storage via `@tauri-apps/plugin-store`
- Build command: `npm run build` → exports to `dist/` for Tauri

## Key Dependencies

- `@openai/agents-realtime`: Core AI agent functionality
- `@excalidraw/excalidraw`: Drawing canvas
- `@lexical/react`: Rich text editor
- `@tauri-apps/api`: Tauri frontend APIs
- `sonner`: Toast notifications
- `clsx`: Conditional className utility