# Release evidence

The site is a public review preview; checkout is disabled until the actual product and seller services pass activation checks.

- Canonical Production: https://vladasana-job-bundle.vercel.app
- Email template: https://vladasana-job-bundle.vercel.app/email-preview
- Private repository: https://github.com/TheDudeCommits/vladasana-job-bundle
- Vercel project: `prj_ebjuksuNLAxtPtYolO9WDsYBsJkO`.
- First tested application commit: `6abe4747862599b71fca70909074aaaa5206510e`.
- First verified release after environment-upload exclusion: `75200128e1457e125941d1c93b44d2893014e628`, Production **Ready**, `dpl_3rN9GJHzx7Dc4PEJzgTNfnXhstXN`.
- Automatic GitHub-main to Vercel-Production deployment is connected for this independent project.

Validation: ESLint, TypeScript, Next.js production build and **100 tests in seven files** passed. The tests include real SQL execution with PGlite, official QStash JWT verification and mocked payment-provider HTTP contracts. No live-money transaction or actual email was sent.

Production Chromium QA at 1440×1000 and 390×844 verified the hero, first-screen buy CTA, generated book pages and next-spread navigation, prominent purchase panel, crypto chooser, disabled preview checkout, and the responsive email preview. No browser errors were reported. One Three.Clock deprecation notice comes from the R3F dependency. A pause-control issue identified in this pass is fixed in the next release: stopping motion now also disposes the prior repeating cherry animation. Browser sessions were closed immediately after the pass.

Local visual evidence is under ignored `output/playwright/`; it is not shipped as application content. The interactive magazine's reduced-motion, WebGL refusal and keyboard/orbit behavior were also verified locally. The Mac became locked before final Production CUA verification; an isolated headless Chromium session was used successfully instead.

## Final application verification

- Application commit: `1c2d5cef61c7d4bce5939103b636af2264d055b3`.
- Verified Production deployment: `dpl_6ZRKoT7yBpqSuHMhyQ2fPpebauag`, **Ready**.
- Immutable deployment: https://vladasana-job-bundle-aol7v5ec7-amirs-projects-d9680079.vercel.app
- Canonical alias verified on this deployment: https://vladasana-job-bundle.vercel.app
- Final lint and production build passed after the motion correction; the production build also completed TypeScript checks. The commerce code remains the same code covered by all 100 passing tests.
- Browser assertions confirmed paused cherry transform remained `none`, clicking returned “you’ve got this.”, and the mobile 3D book completed loading and turned to pages 4–5. At 390px the document remained exactly 390px wide with zero broken images and zero console errors. Its screenshot was visually inspected after all page textures had loaded.
- Both named headless browser sessions were closed. No browser session from this task is intentionally left open.

This release-record update changes documentation only. A later GitHub-triggered deployment may carry the documentation commit while retaining the exact application implementation verified above. Compare application paths, not just the top-level Git commit, when reconciling that metadata.

Production environment contains the canonical `SITE_URL`, explicit preview/false launch flags, and a new project-specific random `CRON_SECRET`. Payment, storage, database and sending credentials were not inferred or copied from another project. See `COMMERCE.md` for activation and real-provider acceptance requirements.

## Quiet Ambition redesign — September 6, 2026

The user selected direction E and requested implementation with iterative real-screenshot comparison. The landing now has two sections, a centered photographic hero, a prominent $19 purchase dialog, and six wide interactive magazine spreads. Email and order-page branding use the same artwork and a more restrained tone.

The selected benchmark and iteration record are in `docs/design/`. At the benchmark width, the production-build screenshot measures 1448×1086, with a 654px hero and the primary CTA at y=353px. Mobile, tablet, and wide-screen checks passed alongside actual page-click, keyboard, focus, reduced-motion and WebGL-refusal checks. All 100 tests, lint, typecheck, production build and `git diff --check` passed. No actual payment or email was attempted; commerce remains deliberately in preview mode.

### Verified Production release

- Application commit: `cb5bd9be15fc8c1e471a1b297aea9e0f54ec8792`.
- Production deployment: `dpl_bVxMgVEyZmaqyU12n9c9sV9so4vb`, **READY**.
- Immutable URL: https://vladasana-job-bundle-k3ujrxc9p-amirs-projects-d9680079.vercel.app
- The Vercel deployment API confirmed this exact GitHub commit and the canonical alias https://vladasana-job-bundle.vercel.app.
- Real Production Chromium screenshots were inspected at 1448px, 390px and 1920px widths. The 1448px capture has a 1086px document height, 654px hero, CTA at y=353px and exactly two sections. No horizontal overflow was found on phone or wide desktop.
- Production assertions passed for clicking an actual magazine page, payment keyboard selection, disabled preview checkout, full-size sample links, a navigable WebGL-refusal fallback, email artwork loading and missing-order protection. There were zero browser exceptions. The existing Three.Clock dependency deprecation warning remains non-blocking.
- Evidence: ignored `output/playwright/quiet-ambition/production-desktop.png`, `production-mobile.png`, `production-wide.png`, `production-page-turn.png` and `checkout-production-mobile.png`.
- The browser was closed immediately after verification. Both local servers were stopped.

This final release-record commit changes documentation only; a subsequent automatic deployment contains the same tested application files. The benchmark's generated artwork and type are approximated with real HTML, generated folder photography and an interactive skeletal magazine; the result is not claimed to be pixel-identical.

## Full-screen sales refinement — September 6, 2026

The follow-up request replaces the benchmark's fixed canvas with two device-height sections. The hero now leads with the buying outcomes; each resource has a readable benefit explanation beside the magazine and a second purchase action. Decorative labels and repeated checkout headings were removed. Hero entry, pointer-following light/photo, button sheen, section entry and page-linked copy transitions support the existing real page-turn interaction. Narrow viewers show a larger single-page crop with the same resource controls and full-size reader.

Local Chromium verified native scroll snapping, first-screen and second-screen purchase access, keyboard navigation, all six resources, focus restoration and the sample reader at desktop, tablet, small phone and landscape sizes. Full-screen sizing was measured at 1448×900, 390×844, 320×568, 768×1024 and 1280×720. Short landscape content may grow to remain usable. A mobile heading overflow and reduced-motion hydration mismatch were found during iteration and corrected; the corrected reduced-motion pass had no console errors. Browsers were closed after each pass. All 100 tests, lint, typecheck, build and whitespace checks passed.

`docs/ACTIVATE_SALES.md` supplies seller-facing activation instructions for Stripe, Apple Pay, Google Pay, PayPal, each implemented stablecoin network, optional Revolut Pay, Postgres, private Vercel Blob storage, Resend and QStash. Provider setup was checked against official documentation. No real payment, email, account setup, or launch-flag change was performed.

### Production acceptance

- Tested application commit: `d8efc4055b35d7e9e74e142b4bed8f15a3a1a232`.
- Verified deployment: `dpl_7mmN17SSz68Rc1vFDtXJba6mMrod`, **READY**, https://vladasana-job-bundle-ebpt45suk-amirs-projects-d9680079.vercel.app.
- Vercel API confirmed the exact GitHub SHA and canonical alias https://vladasana-job-bundle.vercel.app.
- Live Chromium confirmed both sections exactly match the viewport height at **all six** sizes: 1448×900, 390×844, 320×568, 768×1024, 1280×720 and 844×390. Native wheel snapping reached section two; both purchase actions were accessible with no horizontal overflow or footer overlap.
- The pointer changed the hero transform. All six resource choices, keyboard navigation, sample reader, checkout focus restoration, reduced-motion behavior and WebGL-refusal fallback passed. There were no console errors or browser exceptions. Commerce remained preview with all methods unavailable.
- Production screenshots are under ignored `output/playwright/fullscreen/production/`. Browser sessions were closed after QA; no local server remains running.

A subsequent documentation-only deployment contains the same tested application code.


## Paddle and supplied playbook — September 8, 2026

New sales use Paddle Billing for non-crypto payments and NOWPayments for stablecoins. Local required legal/contact pages now publish Vladyslava Kandyba, Ukraine, support@vladasana.com and 7-day refunds while preserving mandatory rights. The two-screen landing identifies the actual 12-guide product; `/bundle` itemises all deliverables and clarifies duplicate formats. Real covers/contents replace illustrated previews.

The 281-page PDF (1,067,944 bytes) and complete delivery ZIP (2,539,601 bytes) are uploaded to dedicated private Blob storage, hashes verified against `BUNDLE_MANIFEST.json`, with anonymous requests denied (403). Production file configuration and a download secret are set. Seller credentials, domain approval, email/database/retry setup and real payment-to-inbox acceptance are still required. Checkout remains preview; no payment or real email has been made.

Local checks: 141 tests across eight files, lint, typecheck, production build and whitespace checks. PostgreSQL execution covers immutable order/outbox behavior, duplicate events, refund-before-payment ordering, ambiguous Paddle creation, both email attachments, and changed-archive refusal. Provider transport is mocked. Paddle-specific verification rejects changed product/price, total, currency, capture, customer email, version, file hashes, subscription/discount and stale/forged signatures.

Browser QA at 1448×900, 390×844, 320×568, 768×1024 and 844×390 confirms both sections match viewport height, no horizontal overflow or footer/purchase overlap, all legal pages return 200, the 13-preview selector and full-size reader work, and reduced motion uses flat pages. No browser exceptions; the existing Three.Clock deprecation warning remains. Browser sessions were closed after each pass. Evidence: ignored `output/playwright/paddle/`. Production-specific results are recorded alongside screenshots after publication.
