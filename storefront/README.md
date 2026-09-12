vLink is available as a hosted USDC payment option with manual receipt-based email delivery. See [vLink operations](docs/VLINK_PAYMENT.md). NOWPayments retains automatic delivery.

# Vladasana · The Developer Job Search Playbook

A standalone Next.js storefront in the approved **E — Quiet Ambition** direction: powder blue, oxblood, a sunlit folder, restrained editorial typography, and a functional 3D publication. Two landing sections, matched to the selected visual benchmark.

[Open the Production preview](https://vladasana.com/Job-bundle) · [Delivery email preview](https://vladasana.com/Job-bundle/email-preview)

**Current state: crypto checkout is live for the owner’s real $19 test.** Paddle remains unavailable. The branded email, support inbox and product attachment checks passed; real payment settlement and purchase-triggered delivery await testing. See [the live-checkout handover](docs/PUBLIC_CRYPTO_TEST.md).

## Experience

- Subtle pointer-responsive hero photography and reduced-motion support.
- Prominent $19 hero CTA opening an accessible payment dialog, with native focus trapping and keyboard method selection.
- A real 3D magazine with bending pages, touch/orbit interaction, keyboard navigation and a readable flat fallback.
- Thirteen selectable previews: actual covers and contents for the 12 supplied guides and the start-here roadmap.
- Local Terms, Privacy, Refund, Contact and full product-details pages; named seller and 7-day refund policy.
- Server-created Paddle checkout for cards, PayPal and eligible Apple/Google wallets; separate NOWPayments USDT/USDC invoices.
- Paid files uploaded to this project’s private Vercel Blob store; hashes and anonymous 403 responses verified.
- Verified payment events, durable SQL fulfillment, PDF/ZIP integrity checks, branded attachment emails, signed downloads and QStash retry support.

## Run locally

Use Node.js 22 LTS or newer supported LTS and npm. Dependencies are pinned by the lockfile.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000/Job-bundle`. No credentials are needed for the preview. The rendered email is at `/Job-bundle/email-preview`.

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

## Launch setup

For the running domain, ownership and email evidence, start with [DOMAIN_EMAIL_LAUNCH.md](docs/DOMAIN_EMAIL_LAUNCH.md). For a future `vladasanadev/techposture` deployment in a new account, also read [VERCEL_SETUP.md](docs/VERCEL_SETUP.md). It covers the isolated `storefront/` directory, exact environment variables, storage migration, callbacks and the read-only NOWPayments readiness command.

Read [the commerce guide](docs/COMMERCE.md) and [.env.example](.env.example). The dedicated Neon database is provisioned and migrated, and the current Vercel Pro project runs recovery every five minutes. The custom domain and Support@Vladasana.com sender are verified. Remaining activation is Paddle account/domain approval and credentials, and real purchase-to-inbox testing. Support-inbox receipt is also verified. Seller identity, final files and actual preview pages are supplied and configured. See [current delivery status](docs/DELIVERY_ACTIVATION.md). Supply secrets through private environment settings, never Git or browser code.

Live availability is gated by configuration and explicit launch flags. Actual account eligibility, sandbox purchases, inbox delivery and a seller-approved crypto purchase still need acceptance testing before those flags are enabled. Publishing the site does not enable collection of money.

## Project map

| Location                                                        | Purpose                                               |
| --------------------------------------------------------------- | ----------------------------------------------------- |
| `components/QuietLanding.tsx`, `app/globals.css`                | Visual direction and responsive landing               |
| `components/CheckoutDialog.tsx`, `components/CheckoutPanel.tsx` | Payment-method chooser and hosted-checkout transition |
| `components/magazine/`, `components/Magazine.tsx`               | Interactive 3D/flat PDF previews                      |
| `lib/commerce/`, `app/api/`                                     | Payment, verification, delivery, queue and recovery   |
| `lib/commerce/email.ts`, `app/email-preview/`                   | Branded HTML/text delivery template and preview       |
| `db/`, `scripts/commerce-*.ts`                  | Database migration and operator tools                 |
| `tests/`                                                        | Core trust-boundary and real SQL regression coverage  |
| `public/images/`                                                | Marketing artwork and actual guide cover/contents excerpts         |

## Provenance and rights

This is a new independent checkout and Git history. No Grid source, assets, secrets, database or deployment links were reused. Vlada's prototype, social profiles and supplied email examples informed the brand direction; the complete paid PDFs/ZIP are not in Git or the public deployment; they are in private authenticated storage.

The magazine adapts David McBacon's user-supplied Framer component under its free Limited Commercial License. Keep this repository **private** and retain [the attribution and license notes](docs/MAGAZINE.md). Do not redistribute the component as a standalone asset. Generated artwork provenance is recorded in [ASSET_PROMPTS.md](docs/ASSET_PROMPTS.md) and [ASSET_MANIFEST.json](docs/ASSET_MANIFEST.json).

See [HANDOVER.md](HANDOVER.md) for release status and continuation instructions.

The selected benchmark, asset provenance, and screenshot iteration record are in [docs/design/](docs/design/).

## Full-screen sales refinement

The landing uses two viewport-height sections with native scroll snapping, larger benefit-led copy, a purchase action in each section, a pointer-responsive hero light/photo, and a page-linked resource explanation. Reduced-motion users keep the same content with static presentation. Very short landscape viewports allow the second section to grow if needed to preserve readable controls.

For seller setup, follow [Activate sales and PDF delivery](docs/ACTIVATE_SALES.md). It covers each payment method separately, exact environment variables and callbacks, private Vercel Blob storage, Resend, Postgres, QStash, sandbox acceptance and the final live switch.
