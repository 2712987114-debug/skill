# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Selected visual direction

- The user selected Product Design ideation option 3 on 2026-08-21.
- Preserve the quiet black-box cinema/gallery direction: matte black surfaces, oversized Chinese typography, full-bleed cinematic imagery, near-invisible UI chrome, hairline dividers, and a single acid-lime playback accent.
- Keep the page image-led and restrained. Avoid template-like card grids, decorative gradients, glassmorphism, neon cyberpunk styling, and excessive rounded corners.
- The intended surface is desktop-first React + Vite with a maximum content width of 1700px.
