# Tech Posture Landing Page

A cinematic landing page for a posture technology concept, built around a full-screen typographic hero and a cursor-driven Gaussian blur reveal.

The page opens in a dark, high-contrast visual field where oversized `POSTURE` lettering floats between sharp focus and soft distortion. As the cursor moves, a glowing trail cuts through the scene like a biometric scanner, using blurred SVG masks to reveal a hidden second image layer beneath the portrait. The interaction feels less like a standard hover effect and more like uncovering an x-ray of the interface: precise, atmospheric, and quietly futuristic.

Small technical labels, status readouts, waveform details, and a clean CTA sit around the composition like instrument-panel typography. The result is a landing page that leans on motion, restraint, and crisp editorial type instead of heavy UI chrome.

## Tech Stack

- React 18
- Vite 6
- TypeScript
- Tailwind CSS 4 via `@tailwindcss/vite`
- Radix UI/shadcn-style component primitives
- MUI icon dependencies

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates a production build with Vite. |

## Folder Structure

```text
.
├── guidelines/
│   └── Guidelines.md
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── components/
│   │       ├── PostureLanding.tsx
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx
│   │       └── ui/
│   │           └── reusable UI primitives
│   ├── imports/
│   │   └── image assets exported from the design
│   ├── main.tsx
│   └── styles/
│       ├── fonts.css
│       ├── globals.css
│       ├── index.css
│       ├── tailwind.css
│       └── theme.css
├── index.html
├── package.json
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── default_shadcn_theme.css
├── ATTRIBUTIONS.md
├── vite.config.ts
└── README.md
```

## Key Files

- `src/main.tsx` mounts the React app into the `#root` element.
- `src/app/App.tsx` renders the landing page component.
- `src/app/components/PostureLanding.tsx` contains the main interactive hero, image reveal mask, cursor trail logic, typography overlays, and call-to-action content.
- `src/app/components/figma/ImageWithFallback.tsx` provides a wrapper for rendering imported image assets with fallback behavior.
- `src/app/components/ui/` contains reusable shadcn/Radix-style UI components that are available for future page sections or app features.
- `src/imports/` stores the visual assets used by the hero.
- `src/styles/index.css` is the main stylesheet entry point and imports font, Tailwind, and theme styles.
- `vite.config.ts` configures React, Tailwind, the `@` alias for `src`, and a Figma asset resolver.
- `postcss.config.mjs` is present for optional future PostCSS plugins; Tailwind v4 is already handled by Vite.
- `pnpm-workspace.yaml` keeps this folder configured as a one-package pnpm workspace.
- `ATTRIBUTIONS.md` documents third-party asset/component attribution.

## Current App Behavior

- Displays a full-screen black-background hero.
- Uses two imported portrait images: a base image and a helmet/posture overlay image.
- Tracks mouse movement inside the hero container.
- Builds a fading cursor trail using SVG masks and Gaussian blur.
- Reveals the overlay image only where the cursor trail passes.
- Dynamically blurs the central `POSTURE` headline based on cursor distance from the center.
- Includes positioned microcopy, metrics, a waveform graphic, and CTA text.

## Notes for Future Development

- The project currently has no test script configured.
- There is no package lockfile in the folder, so dependency versions are controlled by `package.json`.
- Most UI components in `src/app/components/ui/` are not used by the current single-page hero, but they are available if the landing page grows into a larger experience.
- The project name in `package.json` is still the generated Figma Make name, `@figma/my-make-file`; rename it if this becomes a production repository.
