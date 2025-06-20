# Repository Guidelines

- This is a Tauri app with NextJS, which means it's always SSG, never SSR.
- Always run `npm test` and ensure it succeeds before committing.
- The test-suite is executed with **Vitest** (invoked via `npm test`). Make sure all
  Vitest checks pass before committing.
- Use the Excalidraw API via the global `api` when implementing canvas features.
- Keep components in TypeScript and follow the existing project structure.
