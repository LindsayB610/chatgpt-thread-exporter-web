# chatgpt-thread-exporter web

This repo is the v1.3 frontend for `chatgpt-thread-exporter`.

It is intentionally separate from the Hugo site and shaped for Netlify deployment.

## Current state

The first scaffold includes:

- Vite + React + TypeScript app shell
- Netlify config with `dist` as the publish directory
- MVP export form for shared-link input and Markdown/PDF choice
- local mock export flow to prove download UX before the real engine bridge lands

## Local run

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

For a Netlify-shaped local run:

```bash
npm run dev:netlify
```

## Next step

Replace the mock export service in `src/lib/exporter.ts` with a thin backend call or a direct shared-engine integration, depending on which path we choose for the production export runtime.
