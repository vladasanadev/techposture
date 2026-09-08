# Current handover — database, retries and email activation, September 9, 2026

**Latest delivery setup:** dedicated Neon Free `vladasana-commerce` (`store_kp5KqLBis5rLtksu`, `iad1`) is connected to this storefront's Production environment. Both migrations and actual database read/write/rollback checks passed; zero orders or emails were created. The existing Vercel Pro project now schedules `/api/cron/commerce` every five minutes; its first verified scheduled invocation returned 200, and an unauthenticated call returned 401. `COMMERCE_RETRY_SCHEDULE_APPROVED=true` is configured. Resend Free installation is blocked by Vercel's explicit account-owner marketplace terms step; the test recipient is also pending. See [docs/DELIVERY_ACTIVATION.md](docs/DELIVERY_ACTIVATION.md) for evidence, the exact resume command and remaining acceptance. No purchase-to-inbox result is claimed.

**Latest network approval:** the seller has added API/IPN secrets to Vercel. Authenticated checks inside Vercel approved nine stablecoin networks at the $19 price with explicit fixed-rate/seller-paid-fee minimums. `NOWPAYMENTS_NETWORKS_APPROVED=true`; `usdcmatic` is excluded because it is not selected for this key. Provider-selected symbols are uppercase and now normalized. See [the recorded results](docs/NOWPAYMENTS_NETWORK_REVIEW.md). Storewide launch remains closed pending email activation and actual acceptance; no payment or customer email was sent.

The user confirmed NOWPayments API for crypto and requested a push to `vladasanadev/techposture`; they will add Vercel keys. The destination already has a Vite portfolio. Prepare the storefront in `storefront/` on `codex/vladasana-storefront`, based on the destination's existing history, preserving all root application files. The destination is currently public and the authenticated account has push permission but no admin permission. Do not publish the adapted magazine source until the destination meets this project's private-repository instruction. No push or deployment is claimed by this local preparation.

Read [docs/VERCEL_SETUP.md](docs/VERCEL_SETUP.md) for the new-project handoff: separate Vercel project, `storefront` root, environment values, private-storage connection, callbacks and acceptance. The existing Vercel project and private Blob data do not transfer automatically with GitHub source. Keep existing Production unchanged and payments closed while setup is incomplete.

The operator checker now includes provider-specific missing configuration and supports `--provider=crypto` or `--provider=paddle`. `npm run commerce:check-crypto` makes only live merchant GET requests (network selection, estimate and minimum); it can run while the store is closed and cannot create invoices or send emails. The payment path shares that network check and still requires live mode, the common delivery services and explicit launch approval. Vercel Secret values cannot be pulled locally; run the read-only probe inside a staged Vercel build when needed. Payment-to-inbox acceptance has not been performed.

## Previous deployed release — September 8, 2026

Repository: `/Users/amir/Codex-Vladasana-Bundle`, private GitHub `TheDudeCommits/vladasana-job-bundle`. Canonical Production: https://vladasana-job-bundle.vercel.app.

The approved Quiet Ambition design remains a two-screen landing. New checkout uses Paddle Billing for cards/PayPal/eligible wallets and NOWPayments for crypto. The actual supplied product replaces six illustrative resources: 12 guides, 22-page roadmap, 281-page combined playbook and two CSV worksheets. Magazine samples are actual covers/contents. Full PDFs and the clean delivery ZIP are uploaded to dedicated PRIVATE Vercel Blob store `store_GX6IXp65l4JDPX5O`; bytes/hashes verified; anonymous requests return 403. Production file settings and a new download secret are configured. No paid files are in Git or public assets.

Seller details explicitly supplied by owner: **Vladyslava Kandyba, Ukraine, support@vladasana.com, 7-day refunds**. Local `/terms`, `/privacy`, `/refunds`, `/contact` and `/bundle` are accessible from navigation. Mandatory buyer rights are preserved. Paddle has not approved an account/domain here and sales remain closed (`COMMERCE_MODE=preview`, launch approval false). No live payment or customer email was sent.

Read `docs/PADDLE_DOMAIN_REVIEW.md` for the complete requirement/evidence matrix; `docs/ACTIVATE_SALES.md` for current setup, replacing older Stripe/PayPal activation instructions. `docs/BUNDLE_MANIFEST.json` identifies supplied files. Local QA covers five sizes, both sections exactly viewport height, legal pages, real sample reader, checkout and reduced motion; no JS exceptions or horizontal overflow. Final release evidence belongs under ignored `output/playwright/paddle/`.

Remaining seller/services activation: Paddle identity/business/domain approval, product and one-time tax-inclusive price, live keys/webhook, separate Postgres and both migrations, verified Resend + inbox/reply mailbox, QStash/retries, provider and delivery acceptance; optional seller-approved crypto live tests. Use owner-controlled dashboards for banking, DNS, wallet and refund actions. Ambiguous Paddle creation has a verified operator recovery route; never blindly create another transaction or manually mark paid.

The following records are historical and describe earlier versions.

---

# Release handover

## Approved scope

Vlada's Get a Job Bundle, direction E **Quiet Ambition**, selected September 6, 2026 after two rounds of previews. The user approved building the full storefront, adding interactive hero motion, making purchase controls prominent, adapting the actual supplied Framer 3D magazine, generating placeholder artwork, creating a new GitHub repository and deploying to Vercel Production.

## Source and ownership

- Independent checkout: `/Users/amir/Codex-Vladasana-Bundle`.
- Repository must remain private because the incorporated magazine component is licensed for an end product, not standalone redistribution.
- Original cwd `/Users/amir/Codex-Grid` and its user-owned `.media/` were not modified.
- This app has no borrowed project history, credentials, database or Grid branding.
- Source inspiration: [prototype](https://www.vladasana.com/get-a-job-bundle), [Instagram](https://www.instagram.com/vlada.asana/), [X](https://x.com/vladasanadev), and two user-supplied email PDFs. The email PDFs are reference material only and are not distributed.

## Behavior delivered

The landing has exactly two viewport-height sections with native scroll snapping: a benefit-led hero with pointer-responsive folder photography/light and a prominent $19 purchase action; then a six-resource magazine preview with readable benefit copy and its own purchase action. The native checkout dialog retains Stripe, PayPal and crypto choices. The real skeletal WebGL magazine has a wide editorial format, sample reader, page clicking, constrained orbit, keyboard navigation, reduced-motion support and WebGL-refusal fallback. Public samples remain labeled as illustrative. Delivery email and order-page branding follow Quiet Ambition.

Checkout adapters support Stripe, PayPal and exact approved USDT/USDC networks through NOWPayments. Apple Pay and Google Pay are eligible Stripe-hosted wallet methods. Revolut Pay is not advertised because eligibility/currency setup has not been established. Payments, refunds, disputes and fulfillment are provider-verified on the server. Postgres records durable outbox jobs; Resend sends the PDF attachment with a private recovery link; QStash provides authenticated retries. Operator recovery is documented in `docs/COMMERCE.md`.

## Current commercial status

**Preview mode. No real charge or email was attempted.** No seller accounts, final sellable PDF, production database, file storage or verified sending domain were supplied. Missing configuration cannot open checkout or grant a download. The public landing explicitly says purchases are not open yet. Metadata stays noindex until launch.

The displayed early price is $19 USD from the prototype. There are six resources, delivered as one combined PDF in the initial fulfillment implementation. Confirm the final packaging, price, seller details and applicable policies before activation. This is not a promise of a job offer.

## Acceptance evidence

Latest full-screen application commit `d8efc4055b35d7e9e74e142b4bed8f15a3a1a232` was verified on Production deployment `dpl_7mmN17SSz68Rc1vFDtXJba6mMrod` (**READY**) at https://vladasana-job-bundle.vercel.app. All six tested viewport sizes have exactly two full screens. All 100 tests and live interaction checks passed. A subsequent documentation-only commit can trigger a deployment with the same application code.

Exact deployment and tested commit evidence is recorded in [docs/RELEASE.md](docs/RELEASE.md) after publication. Automated provider HTTP contracts use mocks; Postgres transaction/outbox tests execute real SQL with PGlite. No mocked test is evidence of a real payment account or actual inbox delivery. Browser QA covers desktop and phone layouts, hero interaction, book turning, checkout visibility, preview-mode behavior and the HTML email. Browser sessions are closed after QA.

Read [the step-by-step activation guide](docs/ACTIVATE_SALES.md) for separate Stripe, Apple Pay, Google Pay, PayPal, stablecoin and optional Revolut setup, plus the full shared delivery pipeline.

## Inputs needed for paid launch

1. Final combined PDF and approved public excerpts; immutable file version, filename and SHA-256.
2. Seller legal name/country, support mailbox, final price, domain and current terms/privacy/refund/tax decisions.
3. Seller-owned Stripe and PayPal credentials plus webhook/account IDs; NOWPayments API/IPN credentials and approved stablecoin networks.
4. A separate production Postgres database, authenticated private PDF storage, verified Resend sender/domain and email webhook secret.
5. QStash credentials/signing keys, or a genuinely active authenticated five-minute scheduler, plus monitoring ownership.

Follow `.env.example` and `docs/COMMERCE.md`. Complete real sandbox card/PayPal, webhook-retry/refund, PDF inbox and recovery-link checks. Crypto requires a separately seller-approved live test because this implementation does not simulate a provider sandbox. Keep live launch flags false until acceptance succeeds. Replace sample page art and remove preview/noindex language only as part of that launch.

## Continue here

> Continue in `/Users/amir/Codex-Vladasana-Bundle`. Read AGENTS.md, this handover and docs/COMMERCE.md. Verify GitHub main, the checkout and the authoritative Vercel Production deployment before editing. Preserve Quiet Ambition and the selected screenshot benchmark in docs/design/, the supplied component attribution and the private repository. Use the provided final PDF/assets and seller credentials to finish account-specific setup and real acceptance tests; do not enable live checkout just because the UI is deployed. Never commit secrets or paid PDF bytes. Close browser sessions immediately after QA. Record exact tested code and production status when releasing.
