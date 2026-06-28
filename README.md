# Tech Creator Portfolio Landing Page

A cinematic tech creator portfolio landing page built around a full-screen typographic hero, two layered images, and a cursor-driven Gaussian blur reveal.

The page opens in a dark, high-contrast visual field where oversized `PORTFOLIO` lettering floats between sharp focus and soft distortion. As the cursor moves, a glowing trail cuts through the scene like a biometric scanner, using blurred SVG masks to reveal a hidden second image layer beneath the portrait. The interaction feels precise, atmospheric, and quietly futuristic.

Small technical labels, status readouts, waveform details, and a clean CTA sit around the composition like instrument-panel typography. The landing page leans on motion, restraint, and crisp editorial type instead of heavy UI chrome.

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
├── package-lock.json
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
- Adds a small mouse-following radial-gradient spotlight, also called a torch or vignette effect.
- Dynamically blurs the central `PORTFOLIO` headline based on cursor distance from the center.
- Includes creator portfolio microcopy, content metrics, a waveform graphic, CTA text, and a second `AUDIENCE` section.

## AI Recreation Prompt

Copy this prompt into an AI website builder and attach two images: one base background image and one overlay image.

```text
Create a cinematic one-page landing page from 2 attached images.

Use image 1 as the full-screen base/background image.
Use image 2 as the exact same full-screen overlay image, hidden by default and revealed only on hover/mouse movement.

Style direction:
- Dark, futuristic, editorial tech portfolio aesthetic.
- Full-screen hero, black background, high contrast.
- Huge centered typography with the word "PORTFOLIO".
- Typography should feel sharp, cinematic, technical, and premium.
- Use a bold geometric sans font similar to Space Grotesk or Inter.
- Add a blurred ghost duplicate of the main title behind the sharp title.
- Main title should subtly blur depending on cursor distance from center.
- Keep UI minimal: tiny uppercase labels, status text, small dots, waveform-style detail, and thin decorative lines.

Image interaction:
- Layer image 1 and image 2 perfectly on top of each other using object-cover.
- The overlay image must only be revealed under the cursor trail.
- Use an SVG mask with circles following the mouse.
- Apply Gaussian blur to the mask edge for a soft reveal.
- Reveal brush radius should be around 2.6cm, about 98px base radius.
- Trail should fade out after about 900ms.
- Trail circles can expand up to about 1.4x while fading.
- Gaussian blur feather should be around 7px.
- Make sure the facial landmarks or key subject details in both images align pixel-perfectly so there is no jump when the overlay appears.

Torch / spotlight effect:
- Add a mouse-following radial gradient spotlight/vignette over the whole hero.
- This is the "torch effect": a radial-gradient centered at the mouse position.
- Use something like:
  radial-gradient(circle 90px at mouseX mouseY, transparent 0%, rgba(0,0,0,0.18) 50%, rgba(0,0,0,0.52) 100%)
- The torch should make the cursor area feel illuminated while the rest of the page stays dark and atmospheric.
- Keep the torch smaller and more precise, around 90px.

Hero text content:
Top-left tiny label:
"Craft tech content that
turns complex into
engaging"

Top-right link:
"Work with me ↗"

Left middle label:
"Tech storytelling
system active"

Right middle:
"Status"
green dot
"Content signal online +91.4%"

Bottom-left:
"Hello, I'm Vlada"
"Tech creator and strategist who uses a software developer background to help brands grow their presence online."
CTA button:
"Build the system"

Bottom-right:
"Content stack"
"Videos that convert"
"Sharp technical ideas packaged for reach, trust, and action"
"Branding system"
"Cohesive story, visuals, and positioning across every channel"

Main centered title:
"PORTFOLIO"

Footer micro text:
"·─────· ◈ VLADA.TECH ◈ ·─────·"

Second section:
- Add a second full-screen section below the hero.
- Keep the same black, technical, cinematic style.
- Use the same main font and oversized typography.
- Main title: "AUDIENCE"
- Add supporting copy:
  "With a software developer background, I know exactly what your target audience needs: clarity, proof, strong positioning, and videos that make complex technology feel useful fast."

Implementation notes:
- Use React/Vite or plain HTML/CSS/JS.
- Use absolute positioning for the hero typography overlays.
- Use requestAnimationFrame for smooth mouse-following movement.
- Store recent mouse points in state and remove points older than 900ms.
- Use SVG <mask> and <filter><feGaussianBlur /></filter> for the reveal.
- Use a mouse-following radial-gradient spotlight/vignette for the torch effect.
- The page should feel like an interactive scanner revealing a hidden layer beneath the image.
```

## Notes for Future Development

- The project currently has no test script configured.
- `package-lock.json` is present, so npm installs should use the locked dependency tree.
- Most UI components in `src/app/components/ui/` are not used by the current single-page hero, but they are available if the landing page grows into a larger experience.
- The project name in `package.json` is still the generated Figma Make name, `@figma/my-make-file`; rename it if this becomes a production repository.
