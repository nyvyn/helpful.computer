# Repository Guidelines

- This is a Tauri app with NextJS, which means it's always SSG, never SSR.
- Always run `npm test` and ensure it succeeds before committing.
- The test-suite is executed with **Vitest** (invoked via `npm test`). Make sure all
  Vitest checks pass before committing.
- Put each test next to the file it validates (e.g. `Button.tsx` +
  `Button.test.tsx` in the same folder).  
  Do **not** place tests in a separate `__tests__` directory.
- Use the Excalidraw API via the global `api` when implementing canvas features.
- Keep components in TypeScript and follow the existing project structure.
