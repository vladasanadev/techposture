# Quiet Ambition — screenshot acceptance

The user selected E on September 6, 2026 and requested iteration against real browser screenshots. The original 1448×1086 benchmark is preserved as `quiet-ambition-benchmark.png`.

## Refinements from browser evidence

1. Replaced the long Cherry Portal page with exactly two sections. Recreated the folder artwork as a separate background, keeping all navigation, headline, description and purchase controls in real HTML.
2. Replaced the narrow initial headline face with Bodoni Moda; adjusted glyph scale, line spacing and margins against the selected image. Instrument Serif remains on the small wordmark and byline.
3. Moved the folder photograph below the price and delivery microcopy so neither overlaps the product.
4. Reworked the actual skeletal magazine into six wide sample spreads. Changed camera projection, leaf curvature, paper colors and gutter shading; removed continuous floating and unrelated decoration.
5. Posed the initial page bones before paint to avoid the book opening from a distorted first frame. Preserved user-driven page bending, click-versus-drag handling and constrained orbit.
6. Removed an experimental backing mesh after screenshots showed an intrusive border. The actual physical leaves now supply the edges. Adjusted the wide-screen image crop to retain the full folder.
7. Refined the phone heading to two lines, retained a visible first-screen purchase button, and showed the complete folder. Added larger sample reading with full-size image links. Corrected the mobile checkout heading spacing.

## Measured final local rendering

Production build in Chromium at 1448×900 viewport:

| Measurement        | Result    |
| ------------------ | --------- |
| Full page          | 1448×1086 |
| Hero height        | 654px     |
| Buy button top     | 353px     |
| Main sections      | 2         |
| Browser exceptions | 0         |

These measurements confirm layout alignment, not pixel identity. The folder is a generated reconstruction, publication samples are authored placeholders, and the real magazine geometry and fonts retain minor differences from the generated concept. No conversion-rate claim is made.

## Behavior verified

- 320, 390, 768, 1448 and 1920px layouts: no horizontal overflow and a purchase CTA visible in the first viewport.
- Subtle pointer response in the hero; reduced motion uses static art and flat publication previews.
- All six resource choices, previous/next limits, Home/End/Left/Right, actual page click, and orbit drag without accidentally changing a page.
- Accessible native checkout and sample dialogs, Escape dismissal and focus restoration; keyboard payment-method selection.
- Stripe, PayPal and crypto choices remain in preview mode, with submission and unavailable token networks disabled.
- WebGL context refusal falls back to navigable flat pages. Full-size sample links work without exposing the paid product.
- Email artwork loads in its sandboxed preview; an order page without a private reference does not invent an order.
- All 100 tests in seven files, ESLint, TypeScript, production build and whitespace checks pass. Provider tests do not constitute live-payment or inbox-delivery acceptance.

Local evidence and browser verification scripts are in ignored `output/playwright/quiet-ambition/`. Intermediate captures are retained. Browsers were closed after every verification session. See `docs/RELEASE.md` for the deployed commit and Production evidence.
