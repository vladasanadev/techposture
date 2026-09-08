# Current Quiet Ambition viewer — September 6, 2026

The current landing renders `<Magazine initialPage={4} />`: the CV + outreach spread selected in the benchmark. Public controls expose resources 1–6, backed by seven physical leaves and fourteen textures (front cover, twelve sample pages, back cover). The six-option selector, previous/next arrows, page clicks and keyboard Left/Right/Home/End are synchronized. Initial bones are posed before paint; only user-driven page turns animate.

The camera is orthographic and the wide pages are 1.7 by 1.1 world units. Original source layouts and 1020 by 660 WebP textures are in `public/images/quiet/`; regenerate them with `node scripts/prepare-quiet-pages.mjs`. They are illustrative sample content, not the final paid PDF. Face textures preserve print colors; paper edges and the thirty-segment skeletal geometry retain actual depth and page deformation. Continuous decorative floating and the long contents sidebar were removed.

Read a sample opens a native dialog with full-size page links. Flat view remains available manually, reduced motion defaults to flat pages, and failed WebGL creation falls back automatically. Do not put purchased PDF files in public storage.

The attribution and license below remain applicable. The implementation details after this paragraph describe the original September 5 version for historical context.

---

# Vladasana interactive magazine

`components/Magazine.tsx` renders the preview viewer and its controls. Import its default export and render `<Magazine initialPage={1} />`. The optional `initialPage` is a physical spread, clamped to 0–4: cover, three interior spreads, back cover. The default is the first interior spread. An optional `className` extends its outer wrapper.

The viewer uses the **actual skeletal page geometry and page-turn algorithm adapted from 3D Magazine by David McBacon**, supplied by the user. This is not a CSS rotation of a flat card. Each physical leaf has 30 segments, 31 bones, front/back artwork, a thin edge, curved deformation, fold movement, lit surfaces and shadows. The camera supports constrained drag/orbit; a tap turns a leaf. Turning directly to another spread animates intermediate leaves. Arrow buttons, spread selector, and keyboard Left/Right/Home/End provide equivalent navigation.

## Source and attribution

- Creator: **David McBacon**. Ownership of the original component remains with the creator.
- Marketplace: https://www.framer.com/marketplace/components/3d-magazine/
- User-supplied entry: https://framerusercontent.com/modules/xpfsCNXm4cX0T4ERLhz8/I63BRL1qWumvTgL0EGs0/ThreeD_magazine.js
- Page algorithm: https://framerusercontent.com/modules/eFVi4BeJGrvceajiKEgK/8KEfwevBX1NE5pjHZVmX/Page.js
- Geometry: https://framerusercontent.com/modules/Mx9ld9PJG0VLqyoZNW5e/rgA0awVJuerG9098vgZH/Page_geometry.js
- Magazine sequencing: https://framerusercontent.com/modules/8uNpuLSFi1tp0Vp2nX9y/YYCelEVWJOpRzDcn1tQu/Magazine.js
- License: Framer Community Terms, **7.3.1 Limited Commercial License (Free Content)**, checked September 5, 2026: https://www.framer.com/legal/community-terms

The listing is free and marked Limited. That license permits modification and incorporation in a broader commercial or client end product. It does not permit standalone redistribution, reposting as an asset, competing templates/components, or claiming ownership. Keep the application source repository **private**; do not extract, publish, or offer these adapted files as a reusable standalone component. The delivered website incorporates it into the Vladasana landing-page end product. This application does not claim the original magazine as its own work.

## Changes for this end product

- Replaced the hosted Framer bundle and editor controls with local npm imports (`three`, `@react-three/fiber`, `@react-three/drei`, `maath`). No runtime requests to Framer or FramerCoder remain.
- Converted the relevant image-page runtime to TypeScript; omitted unused video, Framer editor and property-control facilities.
- Restyled the paper, lighting, orbit stage, controls and motion for Cherry Portal.
- Corrected the original geometry's terminal skin index to reference existing bones only.
- Added explicit geometry, material and skeleton disposal. Texture caching remains owned by Drei.
- Added constrained orbit, click-versus-drag discrimination, page centering and responsive camera framing.
- Added viewport-based lazy loading and stopped continuous rendering when the viewer leaves the viewport.
- Added accessible controls, keyboard navigation, live page announcement, static readable previews, error boundary and context-loss fallback.
- `prefers-reduced-motion` selects flat pages. The visitor can explicitly opt in to 3D using the visible view toggle. A WebGL failure switches to flat pages automatically.

## Artwork and replacement

The eight records in `components/magazine/data.ts` reference `/images/magazine-{cover,guide,interview,technical,outreach,tracker,salary,back}.webp`. They are paired in order into four physical leaves. Supply **2:3 portrait** images (768×1152 or larger) for distortion-free page textures. These are public, generated marketing placeholders, clearly disclosed below the viewer. Update both image paths and meaningful alt text when final approved PDF preview renders are ready. Remove the placeholder disclosure only after that substitution is complete.

Purchased PDFs must remain in private storage; these public images should show only the excerpts approved for marketing. Do not place the complete purchased files under `public/`.

## QA checklist

- At desktop and phone widths, verify no page clips outside the canvas.
- Tap/click right pages to turn forward and left pages to turn backward. Drag to orbit and check that releasing a drag does not turn a page.
- Verify all five spread selectors and previous/next boundaries.
- Focus the viewer and exercise Left/Right/Home/End.
- Choose Read flat pages and open a preview at full size; repeat with OS reduced motion enabled.
- Confirm the browser network contains local page images and no Framer runtime/asset requests.
- Close test browser sessions immediately after QA, per the user's instruction.

## Implementation verification, September 5, 2026

An isolated Next.js preview using an existing approved mockup as temporary geometry-test texture rendered the actual curved 3D pages in Chromium at 1200px and 390px viewport widths. The next-spread control advanced state; Home/End selected the first/last spread and disabled the corresponding boundary arrow; ArrowRight advanced one spread; releasing an orbit drag left the spread unchanged. At 390px there was no horizontal document overflow or page clipping. Emulated reduced motion switched to two readable flat preview images. Refusing WebGL2 context creation in the browser automatically switched to the flat view. Its browser session and temporary development server were both closed after QA.

Magazine ESLint passed. Full application TypeScript inspection reported no diagnostics in the magazine files; other agents' in-progress commerce tests still had unrelated diagnostics at that check. The remaining console notice was a Three.Clock deprecation inside the R3F dependency. Final generated-artwork QA belongs to the combined landing-page verification, since the initial isolated check deliberately used temporary textures.
